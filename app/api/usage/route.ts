import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getGenerationCount,
  registerTrialUser,
  TRIAL_GENERATION_LIMIT,
} from "@/lib/usage";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ count: 0, limit: TRIAL_GENERATION_LIMIT });
  }
  const count = await getGenerationCount(session.user.email);
  return NextResponse.json({ count, limit: TRIAL_GENERATION_LIMIT });
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (email && typeof email === "string" && email.includes("@")) {
      await registerTrialUser(email.trim());
      return NextResponse.json({ success: true, email: email.trim() });
    }
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
