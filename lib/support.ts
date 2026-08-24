import { getSupabaseAdmin } from "@/lib/supabase";

export interface ChatMessage {
  id: string;
  sender: "user" | "admin";
  text: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  email: string;
  category: string;
  status: "open" | "resolved";
  messages: ChatMessage[];
  unreadUserCount: number;
  unreadAdminCount: number;
  createdAt: string;
  updatedAt: string;
  // Legacy backward compatibility fields
  message?: string;
  replyMessage?: string;
  replyAt?: string;
}

// In-memory chat store for instant speed & zero data loss
const memoryTickets: SupportTicket[] = [];

export async function createSupportTicket(
  email: string,
  initialMessage: string,
  category: string = "General Inquiry"
): Promise<SupportTicket> {
  const normEmail = email.toLowerCase().trim();
  const now = new Date().toISOString();
  const ticketId =
    "ticket_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();

  const firstMsg: ChatMessage = {
    id: "msg_" + Math.random().toString(36).substring(2, 10),
    sender: "user",
    text: initialMessage.trim(),
    createdAt: now,
  };

  const ticket: SupportTicket = {
    id: ticketId,
    email: normEmail,
    category,
    status: "open",
    messages: [firstMsg],
    unreadUserCount: 0,
    unreadAdminCount: 1,
    createdAt: now,
    updatedAt: now,
    message: initialMessage.trim(),
  };

  memoryTickets.unshift(ticket);

  try {
    await getSupabaseAdmin()
      .from("support_tickets")
      .upsert({
        id: ticket.id,
        email: ticket.email,
        category: ticket.category,
        status: ticket.status,
        message: ticket.message,
        messages_json: JSON.stringify(ticket.messages),
        unread_user_count: 0,
        unread_admin_count: 1,
        created_at: ticket.createdAt,
        updated_at: ticket.updatedAt,
      });
  } catch (err) {
    console.warn("Supabase ticket creation warning:", err);
  }

  return ticket;
}

export async function addChatMessage(
  ticketId: string,
  sender: "user" | "admin",
  text: string
): Promise<SupportTicket | null> {
  const now = new Date().toISOString();
  let ticket = memoryTickets.find((t) => t.id === ticketId);

  const newMsg: ChatMessage = {
    id: "msg_" + Math.random().toString(36).substring(2, 10),
    sender,
    text: text.trim(),
    createdAt: now,
  };

  if (!ticket) {
    // Attempt DB fetch
    try {
      const { data } = await getSupabaseAdmin()
        .from("support_tickets")
        .select("*")
        .eq("id", ticketId)
        .single();
      if (data) {
        let existingMsgs: ChatMessage[] = [];
        try {
          if (data.messages_json) existingMsgs = JSON.parse(data.messages_json);
        } catch {}
        if (existingMsgs.length === 0 && data.message) {
          existingMsgs.push({
            id: "msg_orig",
            sender: "user",
            text: data.message,
            createdAt: data.created_at,
          });
        }
        ticket = {
          id: data.id,
          email: data.email,
          category: data.category || "General Inquiry",
          status: (data.status as "open" | "resolved") || "open",
          messages: existingMsgs,
          unreadUserCount: data.unread_user_count || 0,
          unreadAdminCount: data.unread_admin_count || 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at || data.created_at,
        };
        memoryTickets.unshift(ticket);
      }
    } catch {}
  }

  if (!ticket) return null;

  ticket.messages.push(newMsg);
  ticket.updatedAt = now;

  if (sender === "admin") {
    ticket.unreadUserCount += 1;
    ticket.unreadAdminCount = 0;
    ticket.replyMessage = text.trim();
    ticket.replyAt = now;
  } else {
    ticket.unreadAdminCount += 1;
    ticket.unreadUserCount = 0;
  }

  try {
    await getSupabaseAdmin()
      .from("support_tickets")
      .update({
        messages_json: JSON.stringify(ticket.messages),
        status: ticket.status,
        reply_message: ticket.replyMessage || null,
        reply_at: ticket.replyAt || null,
        unread_user_count: ticket.unreadUserCount,
        unread_admin_count: ticket.unreadAdminCount,
        updated_at: now,
      })
      .eq("id", ticketId);
  } catch (err) {
    console.warn("Supabase message update warning:", err);
  }

  return ticket;
}

export async function markTicketsReadByUser(email: string): Promise<void> {
  const normEmail = email.toLowerCase().trim();
  memoryTickets.forEach((t) => {
    if (t.email === normEmail) {
      t.unreadUserCount = 0;
    }
  });

  try {
    await getSupabaseAdmin()
      .from("support_tickets")
      .update({ unread_user_count: 0 })
      .eq("email", normEmail);
  } catch {}
}

export async function markTicketReadByAdmin(ticketId: string): Promise<void> {
  const ticket = memoryTickets.find((t) => t.id === ticketId);
  if (ticket) ticket.unreadAdminCount = 0;

  try {
    await getSupabaseAdmin()
      .from("support_tickets")
      .update({ unread_admin_count: 0 })
      .eq("id", ticketId);
  } catch {}
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  try {
    const { data } = await getSupabaseAdmin()
      .from("support_tickets")
      .select("*")
      .neq("category", "system_render_log")
      .neq("category", "user_model_config")
      .order("updated_at", { ascending: false });

    if (data && data.length > 0) {
      const dbTickets: SupportTicket[] = data.map((row: any) => {
        let msgs: ChatMessage[] = [];
        try {
          if (row.messages_json) msgs = JSON.parse(row.messages_json);
        } catch {}

        if (msgs.length === 0) {
          if (row.message) {
            msgs.push({
              id: "msg_1",
              sender: "user",
              text: row.message,
              createdAt: row.created_at,
            });
          }
          if (row.reply_message) {
            msgs.push({
              id: "msg_2",
              sender: "admin",
              text: row.reply_message,
              createdAt: row.reply_at || row.created_at,
            });
          }
        }

        return {
          id: row.id,
          email: row.email,
          category: row.category || "General Inquiry",
          status: (row.status as "open" | "resolved") || "open",
          messages: msgs,
          unreadUserCount: row.unread_user_count || 0,
          unreadAdminCount: row.unread_admin_count || 0,
          createdAt: row.created_at,
          updatedAt: row.updated_at || row.created_at,
          message: row.message || (msgs[0]?.text ?? ""),
          replyMessage:
            row.reply_message || msgs.find((m) => m.sender === "admin")?.text,
          replyAt: row.reply_at,
        };
      });

      const ticketMap = new Map<string, SupportTicket>();
      dbTickets.forEach((t) => ticketMap.set(t.id, t));
      memoryTickets.forEach((t) => {
        if (!ticketMap.has(t.id)) ticketMap.set(t.id, t);
      });

      return Array.from(ticketMap.values()).sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }
  } catch (err) {
    console.warn("Supabase support ticket fetch skipped:", err);
  }

  return [...memoryTickets];
}

export async function getUserSupportTickets(
  email: string
): Promise<SupportTicket[]> {
  const normEmail = email.toLowerCase().trim();
  const all = await getSupportTickets();
  return all.filter((t) => t.email.toLowerCase().trim() === normEmail);
}

export async function updateTicketStatus(
  id: string,
  status: "open" | "resolved"
): Promise<boolean> {
  const t = memoryTickets.find((item) => item.id === id);
  if (t) t.status = status;

  try {
    await getSupabaseAdmin()
      .from("support_tickets")
      .update({ status })
      .eq("id", id);
  } catch {}

  return true;
}
