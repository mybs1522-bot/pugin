import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  createSupportTicket,
  getSupportTickets,
  getUserSupportTickets,
  replyToSupportTicket,
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
    const { action, id, replyMessage, email, message, category } = body as {
      action?: string;
      id?: string;
      replyMessage?: string;
      email?: string;
      message?: string;
      category?: string;
    };

    // ADMIN REPLY TO SUPPORT TICKET
    if (action === "reply") {
      const cookieHeader = request.headers.get("cookie") ?? "";
      const tokenMatch = cookieHeader.match(/adminrob_session=([^;]+)/);
      const token = tokenMatch ? tokenMatch[1] : null;

      if (!token || !verifyToken(token)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!id || !replyMessage) {
        return NextResponse.json(
          { error: "Ticket ID and reply message are required." },
          { status: 400 }
        );
      }

      const ticket = await replyToSupportTicket(id, replyMessage);

      // Send Response Email via Resend to User
      if (ticket && ticket.email && ticket.email.includes("@")) {
        const resendKey = process.env.RESEND_API_KEY || RESEND_FALLBACK;
        try {
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: "AIsoft Support <onboarding@resend.dev>",
            to: ticket.email,
            subject: `Re: AIsoft Render AI Support Request [${ticket.category || "Inquiry"}]`,
            html: `
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background-color:#09090b; color:#ffffff; padding:32px; border-radius:16px; max-width:550px; margin:0 auto; border:1px solid rgba(255,255,255,0.1);">
                <div style="text-align:center; margin-bottom:24px;">
                  <h1 style="font-size:22px; font-weight:800; color:#ffffff; margin:0; letter-spacing:-0.5px;">✦ AIsoft Render AI</h1>
                  <p style="font-size:12px; color:#a1a1aa; margin-top:4px;">Official Support Resolution</p>
                </div>
                
                <div style="background-color:#121215; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px; margin-bottom:20px;">
                  <p style="font-size:11px; text-transform:uppercase; font-weight:700; color:#a1a1aa; margin:0 0 6px 0;">Your Original Inquiry:</p>
                  <p style="font-size:13px; color:#e4e4e7; margin:0; font-style:italic;">"${ticket.message}"</p>
                </div>

                <div style="background-color:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.25); border-radius:12px; padding:20px; margin-bottom:24px;">
                  <p style="font-size:11px; text-transform:uppercase; font-weight:700; color:#818cf8; margin:0 0 8px 0;">✦ Official Admin Support Response:</p>
                  <p style="font-size:14px; line-height:1.5; color:#ffffff; margin:0;">${replyMessage.replace(/\n/g, "<br/>")}</p>
                </div>

                <div style="text-align:center; font-size:11px; color:#71717a; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">
                  This is an automated resolution update from AIsoft Render Studio.<br/>
                  If you have further questions, reply in your SketchUp plugin window.
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

    // CREATE NEW SUPPORT TICKET FROM PLUGIN
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

  // If called by plugin user with ?email=...
  if (userEmail) {
    const userTickets = await getUserSupportTickets(userEmail);
    return NextResponse.json({ tickets: userTickets }, { status: 200 });
  }

  // Admin view requires auth
  const cookieHeader = request.headers.get("cookie") ?? "";
  const tokenMatch = cookieHeader.match(/adminrob_session=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await getSupportTickets();
  return NextResponse.json({ tickets }, { status: 200 });
}

export async function PATCH(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const tokenMatch = cookieHeader.match(/adminrob_session=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = (await request.json()) as {
      id?: string;
      status?: "open" | "resolved";
    };

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
