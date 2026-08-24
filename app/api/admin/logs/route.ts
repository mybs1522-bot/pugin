import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRenderLogs } from "@/lib/usage";
import { verifyToken } from "@/app/api/adminrob/auth/route";

async function isAuthed(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("adminrob_session")?.value ?? "";
  const sessionValid = verifyToken(sessionToken);

  const secret = process.env.ADMIN_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const bearerValid = secret ? provided === secret : false;

  return sessionValid || bearerValid;
}

export async function GET(request: Request) {
  if (!(await isAuthed(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 100;

  const logs = await getRenderLogs(limit);

  return NextResponse.json({
    logs,
    total: logs.length,
  });
}
