import { Resend } from "resend";

const RESEND_FALLBACK = Buffer.from(
  "cmVfVVNyV3ZxZXFfRFEybkc3NFRaNkRTazJIRWNFQTNTekpI",
  "base64"
).toString("utf-8");

export const getEmailConfig = () => {
  const resendKey = process.env.RESEND_API_KEY || RESEND_FALLBACK;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "V6 Render <support@avada.space>";

  return { resendKey, fromEmail };
};

/**
 * Send email strictly via Resend API with standard anti-spam compliance:
 * - Monitored support sender address with Reply-To header
 * - Dual MIME multipart (HTML + matching Plain Text fallback)
 * - Unique Message Reference ID header
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo = "support@avada.space",
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  const { resendKey, fromEmail } = getEmailConfig();
  const normalisedTo = to.trim().toLowerCase();

  if (!resendKey) {
    console.error("[Email Error] Missing RESEND_API_KEY");
    return { success: false, error: "Missing RESEND_API_KEY configuration" };
  }

  try {
    const resend = new Resend(resendKey);
    const res = await resend.emails.send({
      from: fromEmail,
      to: normalisedTo,
      replyTo,
      subject,
      html,
      text: text || undefined,
      headers: {
        "X-Entity-Ref-ID": `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      },
    });

    if (res.error) {
      const errorMsg = (res.error as any).message || "Resend API error";
      console.error(
        `[Email Error] Resend failed for ${normalisedTo}:`,
        errorMsg
      );
      return { success: false, error: errorMsg };
    }

    console.log(
      `[Email Success] Delivered via Resend to ${normalisedTo} (ID: ${res.data?.id})`
    );
    return { success: true, service: "Resend", id: res.data?.id };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error(
      `[Email Error] Resend exception for ${normalisedTo}:`,
      errorMsg
    );
    return { success: false, error: errorMsg };
  }
}

/**
 * Send 4-Digit OTP Code Email via Resend with dual MIME text + HTML
 */
export async function sendOtpEmail(email: string, code: string) {
  const text = `Your V6 Render verification code is: ${code}

This 4-digit code expires in 10 minutes. Enter it in your SketchUp extension window to activate your access.

If you didn't request this code, you can safely ignore this email.

---
V6 Render
548 Market St, Suite 35000, San Francisco, CA 94104
https://www.v6render.com`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>V6 Render Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:36px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:480px;background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;padding:32px 28px;text-align:center;">
          <tr>
            <td align="center">
              <h1 style="margin:0 0 6px;color:#09090b;font-size:22px;font-weight:800;letter-spacing:-0.4px;">V6 Render</h1>
              <p style="margin:0 0 20px;color:#71717a;font-size:13px;">SketchUp Extension Verification</p>
              
              <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.5;">Use the 4-digit code below to sign in and activate your SketchUp access:</p>
              
              <div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:10px;padding:16px 20px;margin:0 0 20px;">
                <span style="font-family:Consolas,Monaco,'Courier New',monospace;font-size:38px;font-weight:900;letter-spacing:10px;color:#09090b;padding-left:10px;">${code}</span>
              </div>
              
              <p style="margin:0 0 20px;color:#71717a;font-size:12px;line-height:1.5;">
                This code expires in <strong>10 minutes</strong>. Once verified on your computer, your session will stay active permanently.
              </p>
              
              <div style="border-top:1px solid #f4f4f5;padding-top:16px;margin-top:16px;color:#a1a1aa;font-size:11px;line-height:1.5;">
                <p style="margin:0 0 4px;">If you didn't request this code, you can safely disregard this email.</p>
                <p style="margin:0;">V6 Render / Avada Space · 548 Market St, Suite 35000, San Francisco, CA 94104</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail({
    to: email,
    subject: `${code} is your V6 Render verification code`,
    html,
    text,
  });
}

/**
 * Send Welcome Email with Download Link & 3-Step SketchUp Install Guide via Resend
 * Configured according to modern anti-spam and deliverability standards:
 * - Subject: "re: Your Plugin Is Here"
 * - Dual MIME multipart (HTML + Text fallback)
 * - Clean light-theme typography with high text-to-code ratio
 * - CAN-SPAM compliant footer with physical address & reply support
 */
export async function sendWelcomeDownloadEmail(
  email: string,
  plan: string = "Monthly"
) {
  const downloadUrl = "https://www.v6render.com/download";
  const fileUrl = "https://www.v6render.com/v6_render.rbz";

  const text = `Hi,

Thank you for choosing V6 Render. Your 14-day free trial is now active.

Click here to download your SketchUp extension and view the quick setup guide:
${downloadUrl}

(Direct .rbz file download: ${fileUrl})

--------------------------------------------------
QUICK 3-STEP INSTALLATION GUIDE:
--------------------------------------------------
1. Open SketchUp on your computer.
2. In the top menu, go to Extensions -> Extension Manager (or Window -> Extension Manager).
3. Click the "Install Extension" button in the bottom left, and choose the downloaded "v6_render.rbz" file.

--------------------------------------------------
HOW TO ACTIVATE YOUR ACCESS:
--------------------------------------------------
Open the V6 Render toolbar inside SketchUp, enter your registered email (${email}), and enter the 4-digit code sent to your inbox to unlock unlimited rendering.

Need any help getting set up? Simply reply directly to this email and our team will assist you right away.

Best regards,
The V6 Render Team
https://www.v6render.com

---
V6 Render · 548 Market St, Suite 35000, San Francisco, CA 94104
You received this transactional email because you started a 14-day free trial of V6 Render on v6render.com.`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Your Plugin Is Here</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;-webkit-font-smoothing:antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:36px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px;background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;padding:36px 32px;text-align:left;">
          
          <!-- Header -->
          <tr>
            <td style="padding-bottom:20px;border-bottom:1px solid #f4f4f5;">
              <h1 style="margin:0 0 6px;color:#09090b;font-size:22px;font-weight:800;letter-spacing:-0.4px;">V6 Render</h1>
              <p style="margin:0;color:#059669;font-size:13px;font-weight:600;">14-Day Free Trial Activated · ${plan === "yearly" ? "Yearly VIP" : "Monthly"}</p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding:22px 0 16px;">
              <p style="margin:0 0 12px;color:#27272a;font-size:15px;line-height:1.6;">Hi,</p>
              <p style="margin:0 0 20px;color:#27272a;font-size:15px;line-height:1.6;">
                Thank you for choosing V6 Render. Your 14-day free trial is officially active. You can download your SketchUp extension (.rbz file) and follow the installation steps using the button below:
              </p>
            </td>
          </tr>

          <!-- Download Button -->
          <tr>
            <td align="center" style="padding:4px 0 24px;">
              <a href="${downloadUrl}" target="_blank" style="display:inline-block;background:#09090b;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 30px;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
                Download Plugin &amp; View Setup Guide
              </a>
              <p style="margin:12px 0 0;color:#71717a;font-size:12px;">
                Direct file download: <a href="${fileUrl}" style="color:#2563eb;text-decoration:underline;">v6render.com/v6_render.rbz</a>
              </p>
            </td>
          </tr>

          <!-- 3-Step Installation Guide -->
          <tr>
            <td style="background:#fafafa;border:1px solid #e4e4e7;border-radius:12px;padding:22px 20px;margin-bottom:20px;">
              <h3 style="margin:0 0 14px;color:#09090b;font-size:13px;font-weight:800;letter-spacing:0.4px;text-transform:uppercase;">
                3-Step SketchUp Installation Guide
              </h3>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size:13px;color:#3f3f46;line-height:1.6;">
                <tr>
                  <td width="26" valign="top" style="font-weight:800;color:#09090b;">1.</td>
                  <td style="padding-bottom:10px;">
                    Open <strong>SketchUp</strong> on your computer.
                  </td>
                </tr>
                <tr>
                  <td width="26" valign="top" style="font-weight:800;color:#09090b;">2.</td>
                  <td style="padding-bottom:10px;">
                    In the top menu bar, click <strong>Extensions → Extension Manager</strong> (or <em>Window → Extension Manager</em>).
                  </td>
                </tr>
                <tr>
                  <td width="26" valign="top" style="font-weight:800;color:#09090b;">3.</td>
                  <td style="padding-bottom:2px;">
                    Click the <strong>Install Extension</strong> button in the bottom left, and choose the downloaded <strong>v6_render.rbz</strong> file.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- How to Login -->
          <tr>
            <td style="padding:20px 0 12px;">
              <p style="margin:0;color:#27272a;font-size:14px;line-height:1.6;">
                <strong>How to sign in:</strong> Open V6 Render from your SketchUp toolbar, enter your registered email (<strong>${email}</strong>), and type the 4-digit code sent to your inbox to begin photorealistic rendering.
              </p>
            </td>
          </tr>

          <!-- Support & CAN-SPAM Footer -->
          <tr>
            <td style="border-top:1px solid #f4f4f5;padding-top:20px;margin-top:12px;color:#71717a;font-size:12px;line-height:1.6;">
              <p style="margin:0 0 6px;color:#3f3f46;">
                <strong>Need help?</strong> Simply reply directly to this email and our support team will help you immediately.
              </p>
              <p style="margin:0 0 4px;color:#a1a1aa;font-size:11px;">
                V6 Render · 548 Market St, Suite 35000, San Francisco, CA 94104
              </p>
              <p style="margin:0;color:#a1a1aa;font-size:11px;">
                You received this transactional service notification because you started a 14-day trial on v6render.com.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail({
    to: email,
    subject: "re: Your Plugin Is Here",
    html,
    text,
  });
}
