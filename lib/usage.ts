import { getSupabaseAdmin } from "@/lib/supabase";

export const TRIAL_GENERATION_LIMIT = 3;

export interface UserRecord {
  count: number;
  imageCount: number;
  videoCount: number;
  isPaid?: boolean;
  paymentMode?: string;
  activeSessionId?: string;
  signedUpAt: string;
  lastLoginAt: string;
  lastActiveAt: string;
}

// In-memory fallback store
const memoryPaidUsers = new Map<string, { isPaid: boolean; mode: string }>();
const memoryActiveSessions = new Map<string, string>(); // email -> activeSessionId
const memoryUserLogins = new Map<string, string>(); // email -> lastLoginAt
const memoryUserCounts = new Map<
  string,
  {
    count: number;
    imageCount: number;
    videoCount: number;
    signedUpAt: string;
    lastActiveAt: string;
  }
>();

export async function setDeviceSession(email: string): Promise<string> {
  const norm = email.toLowerCase().trim();
  const sessionId =
    "sess_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();
  const now = new Date().toISOString();
  memoryActiveSessions.set(norm, sessionId);
  memoryUserLogins.set(norm, now);

  try {
    await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      active_session_id: sessionId,
      last_login_at: now,
      last_active_at: now,
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
    memoryActiveSessions.set(norm, sessionId);
    return true;
  }

  memoryActiveSessions.set(norm, sessionId);
  return true;
}

export async function isUserPaid(email: string): Promise<boolean> {
  const norm = email.toLowerCase().trim();
  const mem = memoryPaidUsers.get(norm);
  if (mem && mem.isPaid) return true;

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
  paid: boolean,
  mode: string = "Manual Admin"
): Promise<boolean> {
  const norm = email.toLowerCase().trim();
  memoryPaidUsers.set(norm, { isPaid: paid, mode: paid ? mode : "Free Trial" });

  try {
    await getSupabaseAdmin()
      .from("user_usage")
      .upsert({
        email: norm,
        is_paid: paid,
        payment_mode: paid ? mode : "Free Trial",
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
    existing.imageCount = 0;
    existing.videoCount = 0;
    existing.lastActiveAt = new Date().toISOString();
  }

  try {
    await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      count: 0,
      image_count: 0,
      video_count: 0,
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
      .select("count, image_count, video_count")
      .eq("email", norm)
      .single();

    if (error || !data) {
      if (!memoryUserCounts.has(norm)) {
        memoryUserCounts.set(norm, {
          count: 0,
          imageCount: 0,
          videoCount: 0,
          signedUpAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        });
      }
      return memoryUserCounts.get(norm)!.count;
    }

    const row = data as {
      count?: number;
      image_count?: number;
      video_count?: number;
    };
    return row.count ?? (row.image_count || 0) + (row.video_count || 0);
  } catch {
    if (!memoryUserCounts.has(norm)) {
      memoryUserCounts.set(norm, {
        count: 0,
        imageCount: 0,
        videoCount: 0,
        signedUpAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      });
    }
    return memoryUserCounts.get(norm)!.count;
  }
}

export async function incrementImageCount(email: string): Promise<number> {
  const norm = email.toLowerCase().trim();
  try {
    const { data } = await getSupabaseAdmin()
      .from("user_usage")
      .select("count, image_count, video_count")
      .eq("email", norm)
      .single();

    const row = data as {
      count?: number;
      image_count?: number;
      video_count?: number;
    } | null;
    const currentImg = row?.image_count ?? 0;
    const currentVid = row?.video_count ?? 0;
    const currentTotal = row?.count ?? currentImg + currentVid;

    const nextImg = currentImg + 1;
    const nextTotal = currentTotal + 1;
    const now = new Date().toISOString();

    const mem = memoryUserCounts.get(norm);
    if (mem) {
      mem.imageCount = nextImg;
      mem.count = nextTotal;
      mem.lastActiveAt = now;
    }

    await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      image_count: nextImg,
      count: nextTotal,
      last_active_at: now,
    });

    return nextTotal;
  } catch (err) {
    console.warn("Supabase image increment skipped:", err);
    const mem = memoryUserCounts.get(norm);
    if (mem) {
      mem.imageCount += 1;
      mem.count += 1;
      mem.lastActiveAt = new Date().toISOString();
      return mem.count;
    }
    return 1;
  }
}

export async function incrementVideoCount(email: string): Promise<number> {
  const norm = email.toLowerCase().trim();
  try {
    const { data } = await getSupabaseAdmin()
      .from("user_usage")
      .select("count, image_count, video_count")
      .eq("email", norm)
      .single();

    const row = data as {
      count?: number;
      image_count?: number;
      video_count?: number;
    } | null;
    const currentImg = row?.image_count ?? 0;
    const currentVid = row?.video_count ?? 0;
    const currentTotal = row?.count ?? currentImg + currentVid;

    const nextVid = currentVid + 1;
    const nextTotal = currentTotal + 1;
    const now = new Date().toISOString();

    const mem = memoryUserCounts.get(norm);
    if (mem) {
      mem.videoCount = nextVid;
      mem.count = nextTotal;
      mem.lastActiveAt = now;
    }

    await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      video_count: nextVid,
      count: nextTotal,
      last_active_at: now,
    });

    return nextTotal;
  } catch (err) {
    console.warn("Supabase video increment skipped:", err);
    const mem = memoryUserCounts.get(norm);
    if (mem) {
      mem.videoCount += 1;
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
        image_count?: number;
        video_count?: number;
        is_paid?: boolean;
        payment_mode?: string;
        active_session_id?: string;
        signed_up_at: string;
        last_login_at?: string;
        last_active_at: string;
      }) => {
        const memPaid = memoryPaidUsers.get(row.email.toLowerCase());
        const isPaid = row.is_paid || (memPaid && memPaid.isPaid);
        const paymentMode =
          row.payment_mode ||
          (memPaid ? memPaid.mode : isPaid ? "Manual Admin" : "Free Trial");

        return {
          email: row.email,
          count: row.count ?? (row.image_count || 0) + (row.video_count || 0),
          imageCount: row.image_count ?? row.count ?? 0,
          videoCount: row.video_count ?? 0,
          isPaid: !!isPaid,
          paymentMode: paymentMode,
          activeSessionId:
            row.active_session_id ||
            memoryActiveSessions.get(row.email.toLowerCase()),
          signedUpAt: row.signed_up_at,
          lastLoginAt:
            row.last_login_at ||
            memoryUserLogins.get(row.email.toLowerCase()) ||
            row.last_active_at,
          lastActiveAt: row.last_active_at,
        };
      }
    );

    const map = new Map<string, { email: string } & UserRecord>();
    dbUsers.forEach((u) => map.set(u.email.toLowerCase(), u));

    memoryUserCounts.forEach((val, emailKey) => {
      if (!map.has(emailKey)) {
        const memPaid = memoryPaidUsers.get(emailKey);
        map.set(emailKey, {
          email: emailKey,
          count: val.count,
          imageCount: val.imageCount || val.count,
          videoCount: val.videoCount || 0,
          isPaid: !!(memPaid && memPaid.isPaid),
          paymentMode: memPaid ? memPaid.mode : "Free Trial",
          activeSessionId: memoryActiveSessions.get(emailKey),
          signedUpAt: val.signedUpAt,
          lastLoginAt: memoryUserLogins.get(emailKey) || val.lastActiveAt,
          lastActiveAt: val.lastActiveAt,
        });
      }
    });

    return Array.from(map.values());
  } catch {
    const list: Array<{ email: string } & UserRecord> = [];
    memoryUserCounts.forEach((val, emailKey) => {
      const memPaid = memoryPaidUsers.get(emailKey);
      list.push({
        email: emailKey,
        count: val.count,
        imageCount: val.imageCount || val.count,
        videoCount: val.videoCount || 0,
        isPaid: !!(memPaid && memPaid.isPaid),
        paymentMode: memPaid ? memPaid.mode : "Free Trial",
        activeSessionId: memoryActiveSessions.get(emailKey),
        signedUpAt: val.signedUpAt,
        lastLoginAt: memoryUserLogins.get(emailKey) || val.lastActiveAt,
        lastActiveAt: val.lastActiveAt,
      });
    });
    return list;
  }
}
