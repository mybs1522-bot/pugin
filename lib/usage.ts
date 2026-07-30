import { getSupabaseAdmin } from "@/lib/supabase";

export const TRIAL_GENERATION_LIMIT = 3;

export interface UserRecord {
  count: number;
  isPaid?: boolean;
  activeSessionId?: string;
  signedUpAt: string;
  lastActiveAt: string;
}

// In-memory fallback store for active paid users & device sessions
const memoryPaidUsers = new Set<string>();
const memoryActiveSessions = new Map<string, string>(); // email -> activeSessionId
const memoryUserCounts = new Map<
  string,
  { count: number; signedUpAt: string; lastActiveAt: string }
>();

export async function setDeviceSession(email: string): Promise<string> {
  const norm = email.toLowerCase().trim();
  const sessionId =
    "sess_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();
  memoryActiveSessions.set(norm, sessionId);

  try {
    await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      active_session_id: sessionId,
      last_active_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Supabase active session update skipped:", err);
  }

  return sessionId;
}

export async function verifyDeviceSession(
  email: string,
  sessionId?: string
): Promise<boolean> {
  const norm = email.toLowerCase().trim();
  if (!sessionId) return false;

  const currentMemSession = memoryActiveSessions.get(norm);
  if (currentMemSession) {
    return currentMemSession === sessionId;
  }

  try {
    const { data } = await getSupabaseAdmin()
      .from("user_usage")
      .select("active_session_id")
      .eq("email", norm)
      .single();

    const dbSession = (data as { active_session_id?: string })
      ?.active_session_id;
    if (dbSession) {
      memoryActiveSessions.set(norm, dbSession);
      return dbSession === sessionId;
    }
  } catch {
    // If no session recorded yet, accept current
    memoryActiveSessions.set(norm, sessionId);
    return true;
  }

  // Fallback: set and accept session if none stored
  memoryActiveSessions.set(norm, sessionId);
  return true;
}

export async function isUserPaid(email: string): Promise<boolean> {
  const norm = email.toLowerCase().trim();
  if (memoryPaidUsers.has(norm)) return true;

  try {
    const { data } = await getSupabaseAdmin()
      .from("user_usage")
      .select("is_paid")
      .eq("email", norm)
      .single();

    return !!(data as { is_paid?: boolean })?.is_paid;
  } catch {
    return false;
  }
}

export async function setUserPaidStatus(
  email: string,
  paid: boolean
): Promise<boolean> {
  const norm = email.toLowerCase().trim();
  if (paid) {
    memoryPaidUsers.add(norm);
  } else {
    memoryPaidUsers.delete(norm);
  }

  try {
    await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      is_paid: paid,
      last_active_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Supabase paid status update skipped:", err);
  }

  return true;
}

export async function resetUserUsage(email: string): Promise<boolean> {
  const norm = email.toLowerCase().trim();
  const existing = memoryUserCounts.get(norm);
  if (existing) {
    existing.count = 0;
    existing.lastActiveAt = new Date().toISOString();
  }

  try {
    await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      count: 0,
      last_active_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Supabase usage reset skipped:", err);
  }

  return true;
}

export async function getGenerationCount(email: string): Promise<number> {
  const norm = email.toLowerCase().trim();
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("user_usage")
      .select("count")
      .eq("email", norm)
      .single();

    if (error || !data) {
      if (!memoryUserCounts.has(norm)) {
        memoryUserCounts.set(norm, {
          count: 0,
          signedUpAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        });
      }
      return memoryUserCounts.get(norm)!.count;
    }

    return (data as { count: number }).count ?? 0;
  } catch {
    if (!memoryUserCounts.has(norm)) {
      memoryUserCounts.set(norm, {
        count: 0,
        signedUpAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      });
    }
    return memoryUserCounts.get(norm)!.count;
  }
}

export async function incrementGenerationCount(email: string): Promise<number> {
  const norm = email.toLowerCase().trim();
  try {
    const current = await getGenerationCount(email);
    const next = current + 1;

    const mem = memoryUserCounts.get(norm);
    if (mem) {
      mem.count = next;
      mem.lastActiveAt = new Date().toISOString();
    }

    await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      count: next,
      last_active_at: new Date().toISOString(),
    });

    return next;
  } catch (err) {
    console.warn("Supabase usage increment skipped:", err);
    const mem = memoryUserCounts.get(norm);
    if (mem) {
      mem.count += 1;
      mem.lastActiveAt = new Date().toISOString();
      return mem.count;
    }
    return 1;
  }
}

export async function getAllUsers(): Promise<
  Array<{ email: string } & UserRecord>
> {
  try {
    const { data } = await getSupabaseAdmin()
      .from("user_usage")
      .select("*")
      .order("signed_up_at", { ascending: false });

    const dbUsers = (data ?? []).map(
      (row: {
        email: string;
        count: number;
        is_paid?: boolean;
        active_session_id?: string;
        signed_up_at: string;
        last_active_at: string;
      }) => ({
        email: row.email,
        count: row.count,
        isPaid: row.is_paid || memoryPaidUsers.has(row.email.toLowerCase()),
        activeSessionId:
          row.active_session_id ||
          memoryActiveSessions.get(row.email.toLowerCase()),
        signedUpAt: row.signed_up_at,
        lastActiveAt: row.last_active_at,
      })
    );

    // Merge memory users if DB returns empty
    const map = new Map<string, { email: string } & UserRecord>();
    dbUsers.forEach((u) => map.set(u.email.toLowerCase(), u));

    memoryUserCounts.forEach((val, emailKey) => {
      if (!map.has(emailKey)) {
        map.set(emailKey, {
          email: emailKey,
          count: val.count,
          isPaid: memoryPaidUsers.has(emailKey),
          activeSessionId: memoryActiveSessions.get(emailKey),
          signedUpAt: val.signedUpAt,
          lastActiveAt: val.lastActiveAt,
        });
      }
    });

    return Array.from(map.values());
  } catch {
    const list: Array<{ email: string } & UserRecord> = [];
    memoryUserCounts.forEach((val, emailKey) => {
      list.push({
        email: emailKey,
        count: val.count,
        isPaid: memoryPaidUsers.has(emailKey),
        activeSessionId: memoryActiveSessions.get(emailKey),
        signedUpAt: val.signedUpAt,
        lastActiveAt: val.lastActiveAt,
      });
    });
    return list;
  }
}
