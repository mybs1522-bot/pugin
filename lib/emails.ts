import { Resend } from "resend";

const RESEND_FALLBACK = Buffer.from(
  "cmVfVVNyV3ZxZXFfRFEybkc3NFRaNkRTazJIRWNFQTNTekpI",
  "base64"
).toString("utf-8");

export const getEmailConfig = () => {
  const resendKey = process.env.RESEND_API_KEY || RESEND_FALLBACK;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "V6 Render <onboarding@resend.dev>";

  return { resendKey, fromEmail };
};

/**
 * Send email strictly via Resend API
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
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
      subject,
      html,
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
 * Send 4-Digit OTP Code Email via Resend
 */
export async function sendOtpEmail(email: string, code: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>V6 Render Verification Code</title>
    </head>
    <body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#09090b;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:480px;background:#121215;border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:36px 28px;text-align:center;">
              <tr>
                <td align="center">
                  <div style="font-size:32px;margin-bottom:8px;">✦</div>
                  <h1 style="margin:0 0 4px;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">V6 Render</h1>
                  <p style="margin:0 0 24px;color:#a1a1aa;font-size:13px;">SketchUp Extension Verification</p>
                  
                  <p style="margin:0 0 16px;color:#e4e4e7;font-size:14px;line-height:1.5;">Your 4-digit code to sign in and activate your SketchUp PC access:</p>
                  
                  <div style="background:#09090b;border:1px solid rgba(255,255,255,0.18);border-radius:12px;padding:20px;margin:0 0 24px;">
                    <span style="font-family:Consolas,Monaco,monospace;font-size:42px;font-weight:900;letter-spacing:12px;color:#ffffff;padding-left:12px;">${code}</span>
                  </div>
                  
                  <p style="margin:0 0 16px;color:#71717a;font-size:12px;line-height:1.5;">
                    ⏱️ Code expires in <strong>10 minutes</strong>. Once verified on your computer, your session will stay active permanently.
                  </p>
                  
                  <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;margin-top:16px;">
                    <p style="margin:0;color:#52525b;font-size:11px;">If you didn't request this code, you can safely ignore this email.</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `${code} — Your V6 Render Verification Code`,
    html,
  });
}

/**
 * Send Welcome Email with Download Link & 3-Step SketchUp Install Guide via Resend
 */
export async function sendWelcomeDownloadEmail(
  email: string,
  plan: string = "Monthly"
) {
  const downloadUrl = "https://www.avada.space/v6_render.rbz";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to V6 Render</title>
    </head>
    <body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#09090b;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px;background:#121215;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:36px 30px;color:#ffffff;">
              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  <div style="font-size:36px;margin-bottom:8px;">🎉</div>
                  <h1 style="margin:0 0 6px;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-0.5px;">Welcome to V6 Render!</h1>
                  <p style="margin:0;color:#34d399;font-size:13px;font-weight:600;">Your 14-Day Free Trial is Active</p>
                </td>
              </tr>

              <!-- Download Button -->
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <a href="${downloadUrl}" target="_blank" style="display:inline-block;background:#ffffff;color:#000000;font-size:15px;font-weight:800;text-decoration:none;padding:14px 32px;border-radius:12px;box-shadow:0 4px 14px rgba(255,255,255,0.2);">
                    📥 Download V6 Render Plugin (.rbz)
                  </a>
                  <p style="margin:10px 0 0;color:#71717a;font-size:11px;">Direct download file: v6_render.rbz</p>
                </td>
              </tr>

              <!-- 3-Step Installation Guide -->
              <tr>
                <td style="background:#09090b;border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:20px;margin-bottom:24px;">
                  <h3 style="margin:0 0 14px;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">
                    🛠️ 3-Step SketchUp Installation Guide
                  </h3>
                  
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size:13px;color:#d4d4d8;line-height:1.6;">
                    <tr>
                      <td width="28" valign="top" style="font-weight:800;color:#ffffff;">1.</td>
                      <td style="padding-bottom:10px;">
                        Open <strong>SketchUp</strong> on your PC or Mac.
                      </td>
                    </tr>
                    <tr>
                      <td width="28" valign="top" style="font-weight:800;color:#ffffff;">2.</td>
                      <td style="padding-bottom:10px;">
                        In the top menu, go to <strong>Extensions → Extension Manager</strong> (or <em>Window → Extension Manager</em>).
                      </td>
                    </tr>
                    <tr>
                      <td width="28" valign="top" style="font-weight:800;color:#ffffff;">3.</td>
                      <td style="padding-bottom:10px;">
                        Click the <strong>"Install Extension"</strong> button at the bottom left, and select the downloaded <code>v6_render.rbz</code> file.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Login Notice -->
              <tr>
                <td style="padding:20px 0 10px;text-align:center;">
                  <p style="margin:0 0 6px;color:#e4e4e7;font-size:13px;line-height:1.5;">
                    🔑 <strong>To log in:</strong> Open V6 Render inside SketchUp, enter your email (<code>${email}</code>), and enter the 4-digit code sent to your inbox.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;color:#52525b;font-size:11px;">
                  <p style="margin:0 0 4px;">V6 Render — Photorealistic SketchUp Architectural Visualization</p>
                  <p style="margin:0;">Need help? Reply to this email or contact support.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "🎉 Welcome to V6 Render — Download Your SketchUp Plugin",
    html,
  });
}
