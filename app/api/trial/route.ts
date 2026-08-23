import { NextRequest, NextResponse } from "next/server";
import { registerTrialUser } from "@/lib/usage";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client, x-user-email, x-session-id",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    await registerTrialUser(email.trim());

    return NextResponse.json(
      { success: true, email: email.trim() },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: msg },
      { status: 500, headers: corsHeaders }
    );
  }
}
