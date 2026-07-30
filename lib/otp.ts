import crypto from "crypto";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function hmac(data: string): string {
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret-key-123456";
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

interface OTPPayload {
  e: string; // normalised email
  ts: number; // issued timestamp
  sig: string; // hmac(email|code|ts) — code is NOT stored in token
}

/** Generate a 4-digit code + a signed token to return to the client. */
export function createOTP(
  email: string,
  codeOverride?: string
): { code: string; token: string } {
  const e = email.toLowerCase().trim();
  const code = codeOverride ?? String(crypto.randomInt(1000, 10000));
  const ts = Date.now();
  const sig = hmac(`${e}|${code}|${ts}`);
  const token = Buffer.from(
    JSON.stringify({ e, ts, sig } satisfies OTPPayload)
  ).toString("base64url");
  return { code, token };
}

/** Verify user-supplied code against the signed token — fully stateless. */
export function verifyOTP(email: string, code: string, token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token, "base64url").toString()
    ) as OTPPayload;
    const e = email.toLowerCase().trim();
    if (payload.e !== e) return false;
    if (Date.now() - payload.ts > OTP_TTL_MS) return false;
    const expected = hmac(`${e}|${code.trim()}|${payload.ts}`);
    if (payload.sig.length !== expected.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(payload.sig, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}
