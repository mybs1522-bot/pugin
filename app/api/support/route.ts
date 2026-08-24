import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  createSupportTicket,
  addChatMessage,
  getSupportTickets,
  getUserSupportTickets,
  markTicketsReadByUser,
  markTicketReadByAdmin,
  updateTicketStatus,
} from "@/lib/support";
import { verifyToken } from "@/app/api/adminrob/auth/route";

const RESEND_FALLBACK = Buffer.from(
  "cmVfMkZidmpnaTlfUUZZZWtLOTV6VXJtTU5xWWd5elV6VjRY",
  "base64"
).toString("utf-8");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action,
      id,
      ticketId,
      message,
      replyMessage,
      text,
      email,
      category,
      sender,
    } = body as {
      action?: string;
      id?: string;
      ticketId?: string;
      message?: string;
      replyMessage?: string;
      text?: string;
      email?: string;
      category?: string;
      sender?: "user" | "admin";
    };

    const targetTicketId = ticketId || id;
    const chatText = text || replyMessage || message;

    // ACTION: CHAT REPLY (User or Admin)
    if (action === "reply" || action === "send_message") {
      const msgSender = sender || "admin";

      if (msgSender === "admin") {
        const cookieHeader = request.headers.get("cookie") ?? "";
        const tokenMatch = cookieHeader.match(/adminrob_session=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token || !verifyToken(token)) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      }

      if (!targetTicketId || !chatText) {
        return NextResponse.json(
          { error: "Ticket ID and message content are required." },
          { status: 400 }
        );
      }

      const ticket = await addChatMessage(targetTicketId, msgSender, chatText);

      // Email Notification to User when Admin Replies
      if (
        msgSender === "admin" &&
        ticket &&
        ticket.email &&
        ticket.email.includes("@")
      ) {
        const resendKey = process.env.RESEND_API_KEY || RESEND_FALLBACK;
        try {
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: "V6 Support <onboarding@resend.dev>",
            to: ticket.email,
            subject: `💬 New Support Reply: V6 Render Studio [${ticket.category}]`,
            html: `
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background-color:#09090b; color:#ffffff; padding:32px; border-radius:16px; max-width:550px; margin:0 auto; border:1px solid rgba(255,255,255,0.1);">
                <div style="text-align:center; margin-bottom:24px;">
                  <h1 style="font-size:22px; font-weight:800; color:#ffffff; margin:0; letter-spacing:-0.5px;">✦ V6 Render Support Chat</h1>
                  <p style="font-size:12px; color:#a1a1aa; margin-top:4px;">You have a new reply from Admin</p>
                </div>

                <div style="background-color:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.25); border-radius:12px; padding:20px; margin-bottom:24px;">
                  <p style="font-size:11px; text-transform:uppercase; font-weight:700; color:#818cf8; margin:0 0 8px 0;">✦ Admin Support Message:</p>
                  <p style="font-size:14px; line-height:1.5; color:#ffffff; margin:0;">${chatText.replace(/\n/g, "<br/>")}</p>
                </div>

                <div style="text-align:center; font-size:11px; color:#71717a; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">
                  Open your SketchUp plugin window and click <b>💬 Support</b> to view and continue the conversation.
                </div>
              </div>
            `,
          });
        } catch (emailErr) {
          console.warn("Resend email delivery skipped:", emailErr);
        }
      }

      return NextResponse.json({ ok: true, ticket }, { status: 200 });
    }

    // ACTION: CREATE INITIAL SUPPORT CHAT TICKET
    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message content are required." },
        { status: 400 }
      );
    }

    const ticket = await createSupportTicket(
      email,
      message,
      category || "General Inquiry"
    );
    return NextResponse.json({ ok: true, ticket }, { status: 200 });
  } catch (err) {
    console.error("Support API error:", err);
    return NextResponse.json(
      { error: "Failed to process support request" },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userEmail = url.searchParams.get("email");
  const actionParam = url.searchParams.get("action");

  // Plugin user queries
  if (userEmail) {
    if (actionParam === "mark_read") {
      await markTicketsReadByUser(userEmail);
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    const userTickets = await getUserSupportTickets(userEmail);
    const totalUnread = userTickets.reduce(
      (acc, t) => acc + (t.unreadUserCount || 0),
      0
    );
    return NextResponse.json(
      { tickets: userTickets, unreadCount: totalUnread },
      { status: 200 }
    );
  }

  // Admin queries require auth session
  const cookieHeader = request.headers.get("cookie") ?? "";
  const tokenMatch = cookieHeader.match(/adminrob_session=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await getSupportTickets();
  const openCount = tickets.filter((t) => t.status === "open").length;
  const unreadAdminCount = tickets.reduce(
    (acc, t) => acc + (t.unreadAdminCount || 0),
    0
  );

  return NextResponse.json(
    { tickets, openCount, unreadAdminCount },
    { status: 200 }
  );
}

export async function PATCH(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const tokenMatch = cookieHeader.match(/adminrob_session=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status, markRead } = (await request.json()) as {
      id?: string;
      status?: "open" | "resolved";
      markRead?: boolean;
    };

    if (id && markRead) {
      await markTicketReadByAdmin(id);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (!id || !status) {
      return NextResponse.json(
        { error: "Ticket ID and status required" },
        { status: 400 }
      );
    }

    await updateTicketStatus(id, status);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 400 }
    );
  }
}
