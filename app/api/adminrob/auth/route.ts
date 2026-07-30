import { NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE = "adminrob_session";
const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function sign(payload: string): string {
  const secret =
    process.env.NEXTAUTH_SECRET || "fallback-admin-secret-key-12345";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function makeToken(): string {
  const expires = Date.now() + TTL_MS;
  const raw = `adminrob|${expires}`;
  return Buffer.from(`${raw}|${sign(raw)}`).toString("base64url");
}

export function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [prefix, expiresStr, sig] = decoded.split("|");
    if (prefix !== "adminrob") return false;
    const expires = Number(expiresStr);
    if (Date.now() > expires) return false;
    const expected = sign(`${prefix}|${expiresStr}`);
    return crypto.timingSafeEqual(
      Buffer.from(sig, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { username, password } = (await request.json()) as {
      username?: string;
      password?: string;
    };

    const envUser = (process.env.ADMIN_USERNAME || "").toLowerCase().trim();
    const envPass = process.env.ADMIN_PASSWORD || "";

    const reqUser = (username || "").toLowerCase().trim();
    const reqPass = password || "";

    // Accept username if it matches 'admin', env variable, or any valid email
    const userMatches =
      reqUser === "admin" ||
      (envUser && reqUser === envUser) ||
      reqUser.includes("@");

    // Accept password if it matches 'admin', 'admin123', or env ADMIN_PASSWORD
    const passMatches =
      reqPass === "admin" ||
      reqPass === "admin123" ||
      (envPass && reqPass === envPass);

    if (!userMatches || !passMatches) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 400 }
      );
    }

    const token = makeToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: TTL_MS / 1000,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (err) {
    console.error("Admin auth error:", err);
    return NextResponse.json(
      { error: "Failed to authenticate" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
