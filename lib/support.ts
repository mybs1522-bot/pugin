import { getSupabaseAdmin } from "@/lib/supabase";

export interface SupportTicket {
  id: string;
  email: string;
  message: string;
  category?: string;
  status: "open" | "resolved";
  createdAt: string;
}

// In-memory fallback ticket store
const memoryTickets: SupportTicket[] = [];

export async function createSupportTicket(
  email: string,
  message: string,
  category: string = "General Inquiry"
): Promise<SupportTicket> {
  const normEmail = email.toLowerCase().trim();
  const ticket: SupportTicket = {
    id:
      "ticket_" +
      Math.random().toString(36).substring(2, 10) +
      "_" +
      Date.now(),
    email: normEmail,
    message: message.trim(),
    category,
    status: "open",
    createdAt: new Date().toISOString(),
  };

  memoryTickets.unshift(ticket);

  try {
    await getSupabaseAdmin().from("support_tickets").upsert({
      id: ticket.id,
      email: ticket.email,
      message: ticket.message,
      category: ticket.category,
      status: ticket.status,
      created_at: ticket.createdAt,
    });
  } catch (err) {
    console.warn("Supabase support ticket save skipped:", err);
  }

  return ticket;
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  try {
    const { data } = await getSupabaseAdmin()
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      const dbTickets: SupportTicket[] = data.map(
        (row: {
          id: string;
          email: string;
          message: string;
          category?: string;
          status?: string;
          created_at: string;
        }) => ({
          id: row.id,
          email: row.email,
          message: row.message,
          category: row.category || "General Inquiry",
          status: (row.status as "open" | "resolved") || "open",
          createdAt: row.created_at,
        })
      );

      // Merge memory tickets
      const ticketMap = new Map<string, SupportTicket>();
      dbTickets.forEach((t) => ticketMap.set(t.id, t));
      memoryTickets.forEach((t) => {
        if (!ticketMap.has(t.id)) ticketMap.set(t.id, t);
      });

      return Array.from(ticketMap.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (err) {
    console.warn("Supabase support ticket fetch skipped:", err);
  }

  return [...memoryTickets];
}

export async function updateTicketStatus(
  id: string,
  status: "open" | "resolved"
): Promise<boolean> {
  const t = memoryTickets.find((item) => item.id === id);
  if (t) {
    t.status = status;
  }

  try {
    await getSupabaseAdmin()
      .from("support_tickets")
      .update({ status })
      .eq("id", id);
  } catch (err) {
    console.warn("Supabase support ticket update skipped:", err);
  }

  return true;
}
