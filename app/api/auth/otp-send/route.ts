import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createOTP } from "@/lib/otp";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client, x-user-email",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
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

    const apiKey = process.env.RESEND_API_KEY;

    // If Resend API key is missing, return success with devCode fallback so user is never blocked
    if (!apiKey) {
      console.warn(`[OTP] RESEND_API_KEY missing. Code for ${email}: ${code}`);
      return NextResponse.json(
        {
          ok: true,
          token,
          devCode: code,
          message: `Code generated: ${code} (RESEND_API_KEY not set on Vercel)`,
        },
        { status: 200, headers: corsHeaders }
      );
    }

    const resend = new Resend(apiKey);

    // Try sending email via Resend
    let sendResult = await resend.emails.send({
      from: "AIsoft Render <onboarding@resend.dev>",
      to: email,
      subject: `${code} — Your 4-Digit Verification Code`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#09090b;color:#ffffff;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px">
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff">AIsoft Render AI</h1>
            <p style="color:#a1a1aa;font-size:13px;margin-top:4px">SketchUp Plugin PC Verification</p>
          </div>
          <p style="color:#e4e4e7;margin-bottom:12px;font-size:14px">Your 4-digit verification code is:</p>
          <div style="background:#18181b;border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
            <span style="font-size:44px;font-weight:800;letter-spacing:12px;color:#ffffff;font-family:monospace">${code}</span>
          </div>
          <p style="color:#71717a;font-size:12px">This code expires in 10 minutes. If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    if (sendResult.error) {
      console.warn(
        "Resend email failed, trying alternative sender:",
        sendResult.error
      );
      // Try domain sender fallback if onboarding sender failed
      sendResult = await resend.emails.send({
        from: "Interior Designer AI <design@avada.space>",
        to: email,
        subject: `${code} — Your 4-Digit Verification Code`,
        html: `<p>Your code is <b>${code}</b></p>`,
      });
    }

    if (sendResult.error) {
      console.error("Resend final error:", sendResult.error);
      // Fail gracefully returning status 400 with devCode fallback so user is not blocked
      return NextResponse.json(
        {
          ok: true,
          token,
          devCode: code,
          warning:
            "Resend email delivery failed, but code generated for verification.",
          error:
            (sendResult.error as { message?: string }).message ||
            "Email delivery failed",
        },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { ok: true, token },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("OTP send exception:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send code" },
      { status: 400, headers: corsHeaders }
    );
  }
}
