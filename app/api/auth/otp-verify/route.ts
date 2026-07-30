import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";
import { getGenerationCount } from "@/lib/usage";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, code, token } = await req.json();

    if (!email || !code || !token) {
      return NextResponse.json(
        { error: "Email, code, and token are required." },
        { status: 400 }
      );
    }

    const isValid = verifyOTP(email, code, token);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired 4-digit verification code." },
        { status: 400 }
      );
    }

    const normalisedEmail = email.toLowerCase().trim();
    await getGenerationCount(normalisedEmail);

    const secret = process.env.NEXTAUTH_SECRET || "fallback-secret-key-123456";
    const authToken = crypto
      .createHmac("sha256", secret)
      .update(`auth-device|${normalisedEmail}`)
      .digest("hex");

    return NextResponse.json({
      ok: true,
      email: normalisedEmail,
      authToken,
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    return NextResponse.json(
      { error: "Failed to verify 4-digit code." },
      { status: 500 }
    );
  }
}
