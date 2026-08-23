import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAllUsers,
  setUserPaidStatus,
  setUserStatus,
  resetUserUsage,
  TRIAL_GENERATION_LIMIT,
} from "@/lib/usage";
import { verifyToken } from "@/app/api/adminrob/auth/route";

async function isAuthed(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("adminrob_session")?.value ?? "";
  const sessionValid = verifyToken(sessionToken);

  const secret = process.env.ADMIN_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const bearerValid = secret ? provided === secret : false;

  return sessionValid || bearerValid;
}

export async function GET(request: Request) {
  if (!(await isAuthed(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getAllUsers();

  const totalRenders = users.reduce((sum, u) => sum + u.count, 0);
  const trialUsers = users.filter(
    (u) => u.count < TRIAL_GENERATION_LIMIT
  ).length;
  const exhaustedUsers = users.filter(
    (u) => u.count >= TRIAL_GENERATION_LIMIT && !u.isPaid
  ).length;
  const paidUsers = users.filter((u) => u.isPaid).length;

  return NextResponse.json({
    stats: {
      totalUsers: users.length,
      totalRenders,
      trialUsers,
      exhaustedUsers,
      paidUsers,
      trialLimit: TRIAL_GENERATION_LIMIT,
    },
    users,
  });
}

export async function POST(request: Request) {
  if (!(await isAuthed(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, action, paid, status } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    if (action === "set_status") {
      const targetStatus = status || (paid ? "paid" : "trial");
      await setUserStatus(email, targetStatus);
      return NextResponse.json({ ok: true, status: targetStatus });
    }

    if (action === "toggle_paid") {
      await setUserPaidStatus(email, !!paid);
      return NextResponse.json({ ok: true, isPaid: !!paid });
    }

    if (action === "reset_count") {
      await resetUserUsage(email);
      return NextResponse.json({ ok: true, reset: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Admin user management error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
