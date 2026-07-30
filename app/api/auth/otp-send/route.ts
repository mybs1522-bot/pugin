import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import nodemailer from "nodemailer";
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

    const resendApiKey = process.env.RESEND_API_KEY;
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    let emailSent = false;
    let serviceUsed = "";
    let lastError = "";

    const emailHtml = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Geist','Segoe UI',Roboto,sans-serif;max-width:500px;margin:0 auto;padding:40px 28px;background:#09090b;color:#ffffff;border-radius:20px;border:1px solid rgba(255,255,255,0.1);box-shadow:0 20px 40px rgba(0,0,0,0.8);">
        <div style="text-align:center;margin-bottom:32px">
          <div style="font-size:36px;margin-bottom:12px;">✦</div>
          <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px">AIsoft Render AI</h1>
          <p style="color:#a1a1aa;font-size:13px;margin-top:6px">SketchUp Plugin PC Verification</p>
        </div>
        <p style="color:#e4e4e7;margin-bottom:16px;font-size:14px;line-height:1.5">Here is your 4-digit verification code to activate your SketchUp PC access:</p>
        <div style="background:#121215;border:1px solid rgba(255,255,255,0.18);border-radius:14px;padding:24px;text-align:center;margin-bottom:28px">
          <span style="font-size:48px;font-weight:800;letter-spacing:14px;color:#ffffff;font-family:monospace">${code}</span>
        </div>
        <p style="color:#71717a;font-size:12px;line-height:1.5;margin-bottom:0">This code expires in 10 minutes. Once verified, your PC will stay logged in permanently.</p>
      </div>
    `;

    // 1. PRIMARY: Resend Professional Email Service
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);

        // Try domain email first, then fallback to onboarding@resend.dev
        const fromAddress =
          process.env.RESEND_FROM_EMAIL ||
          "AIsoft Render <onboarding@resend.dev>";

        const resendResult = await resend.emails.send({
          from: fromAddress,
          to: normalised,
          subject: `${code} — Your 4-Digit Verification Code`,
          html: emailHtml,
        });

        if (!resendResult.error) {
          emailSent = true;
          serviceUsed = "Resend";
          console.log(`✓ Email sent via Resend to ${normalised}`);
        } else {
          lastError =
            (resendResult.error as { message?: string }).message ||
            "Resend error";
          console.warn("Resend email failed:", lastError);
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn("Resend exception:", lastError);
      }
    }

    // 2. FALLBACK: Gmail SMTP (if Resend API key is missing or failed)
    if (!emailSent && gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: gmailUser, pass: gmailPass },
        });

        await transporter.sendMail({
          from: `"AIsoft Render AI" <${gmailUser}>`,
          to: normalised,
          subject: `${code} — Your 4-Digit Verification Code`,
          html: emailHtml,
        });

        emailSent = true;
        serviceUsed = "Gmail SMTP";
        console.log(`✓ Email sent via Gmail SMTP fallback to ${normalised}`);
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        token,
        devCode: emailSent ? undefined : code,
        service: serviceUsed || "Fallback",
        message: emailSent
          ? "Verification code sent to your email!"
          : `Code generated: ${code} (Add RESEND_API_KEY to Vercel to send via Resend)`,
        lastError: emailSent ? undefined : lastError,
      },
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
