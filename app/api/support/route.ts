import { NextResponse } from "next/server";
import {
  createSupportTicket,
  getSupportTickets,
  updateTicketStatus,
} from "@/lib/support";
import { verifyToken } from "@/app/api/adminrob/auth/route";

export async function POST(request: Request) {
  try {
    const { email, message, category } = (await request.json()) as {
      email?: string;
      message?: string;
      category?: string;
    };

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
    console.error("Support submission error:", err);
    return NextResponse.json(
      { error: "Failed to submit support request" },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
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
