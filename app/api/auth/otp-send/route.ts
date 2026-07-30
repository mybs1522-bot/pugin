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

    const gmailUser = process.env.GMAIL_USER || "mybs1522@gmail.com";
    const gmailPass = process.env.GMAIL_APP_PASSWORD || "agqarxxzmghwychm";
    const resendApiKey = process.env.RESEND_API_KEY;

    let emailSent = false;
    let lastError = "";

    // 1. Try Gmail SMTP via nodemailer
    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        await transporter.sendMail({
          from: `"AIsoft Render AI" <${gmailUser}>`,
          to: normalised,
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

        emailSent = true;
        console.log(
          `✓ Email sent successfully via Gmail SMTP to ${normalised}`
        );
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn("Gmail SMTP send failed, trying Resend...", lastError);
      }
    }

    // 2. Try Resend if Gmail SMTP failed or unconfigured
    if (!emailSent && resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const resendResult = await resend.emails.send({
          from: "AIsoft Render <onboarding@resend.dev>",
          to: normalised,
          subject: `${code} — Your 4-Digit Verification Code`,
          html: `<p>Your code is <b>${code}</b></p>`,
        });

        if (!resendResult.error) {
          emailSent = true;
          console.log(`✓ Email sent via Resend to ${normalised}`);
        } else {
          lastError =
            (resendResult.error as { message?: string }).message ||
            "Resend error";
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    // Return response
    return NextResponse.json(
      {
        ok: true,
        token,
        devCode: emailSent ? undefined : code,
        message: emailSent
          ? "Verification code sent to your email!"
          : `Code generated: ${code} (Fallback mode)`,
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
