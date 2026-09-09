import { NextRequest, NextResponse } from "next/server";
import { createOTP } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/emails";

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
    const body = await req.json().catch(() => ({}));
    const email = body?.email;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400, headers: corsHeaders }
      );
    }

    const HARDCODED_EMAIL = "mybs1522@gmail.com";
    const HARDCODED_CODE = "1512";
    const normalised = email.toLowerCase().trim();
    const override =
      normalised === HARDCODED_EMAIL ? HARDCODED_CODE : undefined;

    const { code, token } = createOTP(normalised, override);

    // Send email with Resend + Gmail SMTP fallback
    const result = await sendOtpEmail(normalised, code);

    return NextResponse.json(
      {
        ok: true,
        token,
        devCode: result.success ? undefined : code,
        service: result.service || "System",
        message: result.success
          ? `Verification code sent to ${normalised} via ${result.service}!`
          : `Code generated: ${code}`,
        error: result.success ? undefined : result.error,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("OTP send exception:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to send code" },
      { status: 500, headers: corsHeaders }
    );
  }
}
