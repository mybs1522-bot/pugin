import { getSupabaseAdmin } from "@/lib/supabase";

export const TRIAL_IMAGE_LIMIT = 3;
export const TRIAL_VIDEO_LIMIT = 1;
export const TRIAL_GENERATION_LIMIT = 3;

export interface UserRecord {
  count: number;
  imageCount: number;
  videoCount: number;
  isPaid?: boolean;
  status?: "paid" | "trial" | "cancelled";
  paymentMode?: string;
  lastModelUsed?: string;
  activeSessionId?: string;
  signedUpAt: string;
  lastLoginAt: string;
  lastActiveAt: string;
}

// In-memory fallback store to ensure zero data loss
const memoryPaidUsers = new Map<string, { isPaid: boolean; mode: string }>();
const memoryUserStatuses = new Map<string, "paid" | "trial" | "cancelled">();
const memoryActiveSessions = new Map<string, string>(); // email -> activeSessionId
const memoryUserLogins = new Map<string, string>(); // email -> lastLoginAt
const memoryLastModels = new Map<string, string>(); // email -> lastModelUsed
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

/** Ensure in-memory record exists */
function ensureMemRecord(email: string) {
  const norm = email.toLowerCase().trim();
  if (!memoryUserCounts.has(norm)) {
    const now = new Date().toISOString();
    memoryUserCounts.set(norm, {
      count: 0,
      imageCount: 0,
      videoCount: 0,
      signedUpAt: now,
      lastActiveAt: now,
    });
  }
  return memoryUserCounts.get(norm)!;
}

export async function setDeviceSession(email: string): Promise<string> {
  const norm = email.toLowerCase().trim();
  const sessionId =
    "sess_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();
  const now = new Date().toISOString();

  memoryActiveSessions.set(norm, sessionId);
  memoryUserLogins.set(norm, now);

  const mem = ensureMemRecord(norm);
  mem.lastActiveAt = now;

  try {
    await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      active_session_id: sessionId,
      last_login_at: now,
      last_active_at: now,
      count: mem.count,
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
  const status = paid ? "paid" : "trial";
  return setUserStatus(email, status, mode);
}

export async function setUserStatus(
  email: string,
  status: "paid" | "trial" | "cancelled",
  mode?: string
): Promise<boolean> {
  const norm = email.toLowerCase().trim();
  const isPaid = status === "paid";
  const paymentMode =
    mode ||
    (status === "paid"
      ? "Paid Subscription"
      : status === "cancelled"
        ? "Cancelled"
        : "Free Trial");

  memoryUserStatuses.set(norm, status);
  memoryPaidUsers.set(norm, { isPaid, mode: paymentMode });

  try {
    await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      is_paid: isPaid,
      status: status,
      payment_mode: paymentMode,
      last_active_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Supabase status update skipped:", err);
  }

  return true;
}

export async function resetUserUsage(email: string): Promise<boolean> {
  const norm = email.toLowerCase().trim();
  const mem = ensureMemRecord(norm);
  mem.count = 0;
  mem.imageCount = 0;
  mem.videoCount = 0;
  mem.lastActiveAt = new Date().toISOString();

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

export async function getImageCount(email: string): Promise<number> {
  const norm = email.toLowerCase().trim();
  const mem = ensureMemRecord(norm);
  try {
    const { data } = await getSupabaseAdmin()
      .from("user_usage")
      .select("image_count, count")
      .eq("email", norm)
      .single();

    const row = data as { image_count?: number; count?: number } | null;
    const dbImg = row?.image_count ?? row?.count ?? 0;
    return Math.max(dbImg, mem.imageCount);
  } catch {
    return mem.imageCount;
  }
}

export async function getVideoCount(email: string): Promise<number> {
  const norm = email.toLowerCase().trim();
  const mem = ensureMemRecord(norm);
  try {
    const { data } = await getSupabaseAdmin()
      .from("user_usage")
      .select("video_count")
      .eq("email", norm)
      .single();

    const row = data as { video_count?: number } | null;
    const dbVid = row?.video_count ?? 0;
    return Math.max(dbVid, mem.videoCount);
  } catch {
    return mem.videoCount;
  }
}

export async function getGenerationCount(email: string): Promise<number> {
  const norm = email.toLowerCase().trim();
  const mem = ensureMemRecord(norm);

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("user_usage")
      .select("count, image_count, video_count")
      .eq("email", norm)
      .single();

    if (error || !data) {
      return mem.count;
    }

    const row = data as {
      count?: number;
      image_count?: number;
      video_count?: number;
    };
    const dbCount =
      row.count ?? (row.image_count || 0) + (row.video_count || 0);

    const finalCount = Math.max(dbCount, mem.count);
    mem.count = finalCount;
    return finalCount;
  } catch {
    return mem.count;
  }
}

export async function incrementImageCount(
  email: string,
  modelUsed: string = "google/nano-banana-2"
): Promise<number> {
  const norm = email.toLowerCase().trim();
  const now = new Date().toISOString();

  const mem = ensureMemRecord(norm);
  mem.imageCount += 1;
  mem.count += 1;
  mem.lastActiveAt = now;
  memoryLastModels.set(norm, modelUsed);

  const nextImg = mem.imageCount;
  const nextTotal = mem.count;

  try {
    const { error } = await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      image_count: nextImg,
      count: nextTotal,
      last_model_used: modelUsed,
      last_active_at: now,
    });

    if (error) {
      await getSupabaseAdmin().from("user_usage").upsert({
        email: norm,
        count: nextTotal,
        last_active_at: now,
      });
    }
  } catch (err) {
    console.warn("Supabase image increment warning:", err);
  }

  return nextTotal;
}

export async function incrementVideoCount(
  email: string,
  modelUsed: string = "stability-ai/stable-video-diffusion"
): Promise<number> {
  const norm = email.toLowerCase().trim();
  const now = new Date().toISOString();

  const mem = ensureMemRecord(norm);
  mem.videoCount += 1;
  mem.count += 1;
  mem.lastActiveAt = now;
  memoryLastModels.set(norm, modelUsed);

  const nextVid = mem.videoCount;
  const nextTotal = mem.count;

  try {
    const { error } = await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      video_count: nextVid,
      count: nextTotal,
      last_model_used: modelUsed,
      last_active_at: now,
    });

    if (error) {
      await getSupabaseAdmin().from("user_usage").upsert({
        email: norm,
        count: nextTotal,
        last_active_at: now,
      });
    }
  } catch (err) {
    console.warn("Supabase video increment warning:", err);
  }

  return nextTotal;
}

export async function getAllUsers(): Promise<
  Array<{ email: string } & UserRecord>
> {
  const map = new Map<string, { email: string } & UserRecord>();

  memoryUserCounts.forEach((val, emailKey) => {
    const memPaid = memoryPaidUsers.get(emailKey);
    map.set(emailKey, {
      email: emailKey,
      count: val.count,
      imageCount: val.imageCount || val.count,
      videoCount: val.videoCount || 0,
      isPaid: !!(memPaid && memPaid.isPaid),
      paymentMode: memPaid ? memPaid.mode : "Free Trial",
      lastModelUsed: memoryLastModels.get(emailKey) || "google/nano-banana-pro",
      activeSessionId: memoryActiveSessions.get(emailKey),
      signedUpAt: val.signedUpAt,
      lastLoginAt: memoryUserLogins.get(emailKey) || val.lastActiveAt,
      lastActiveAt: val.lastActiveAt,
    });
  });

  try {
    const { data } = await getSupabaseAdmin()
      .from("user_usage")
      .select("*")
      .order("signed_up_at", { ascending: false });

    (data ?? []).forEach(
      (row: {
        email: string;
        count: number;
        image_count?: number;
        video_count?: number;
        is_paid?: boolean;
        payment_mode?: string;
        last_model_used?: string;
        active_session_id?: string;
        signed_up_at: string;
        last_login_at?: string;
        last_active_at: string;
      }) => {
        const emailKey = row.email.toLowerCase();
        const existingMem = map.get(emailKey);

        const memPaid = memoryPaidUsers.get(emailKey);
        const isPaid = row.is_paid || (memPaid && memPaid.isPaid);
        const paymentMode =
          row.payment_mode ||
          (memPaid ? memPaid.mode : isPaid ? "Manual Admin" : "Free Trial");

        const dbCount =
          row.count ?? (row.image_count || 0) + (row.video_count || 0);
        const dbImg = row.image_count ?? row.count ?? 0;
        const dbVid = row.video_count ?? 0;

        const finalCount = Math.max(dbCount, existingMem?.count ?? 0);
        const finalImg = Math.max(dbImg, existingMem?.imageCount ?? 0);
        const finalVid = Math.max(dbVid, existingMem?.videoCount ?? 0);

        const memStatus = memoryUserStatuses.get(emailKey);
        const userStatus: "paid" | "trial" | "cancelled" =
          memStatus || (isPaid ? "paid" : "trial");

        map.set(emailKey, {
          email: row.email,
          count: finalCount,
          imageCount: finalImg,
          videoCount: finalVid,
          isPaid: !!isPaid,
          status: userStatus,
          paymentMode: paymentMode,
          lastModelUsed:
            row.last_model_used ||
            memoryLastModels.get(emailKey) ||
            existingMem?.lastModelUsed ||
            (isPaid ? "google/nano-banana-2" : "google/nano-banana-pro"),
          activeSessionId:
            row.active_session_id ||
            memoryActiveSessions.get(emailKey) ||
            existingMem?.activeSessionId,
          signedUpAt:
            row.signed_up_at ||
            existingMem?.signedUpAt ||
            new Date().toISOString(),
          lastLoginAt:
            row.last_login_at ||
            memoryUserLogins.get(emailKey) ||
            existingMem?.lastLoginAt ||
            row.last_active_at,
          lastActiveAt:
            row.last_active_at ||
            existingMem?.lastActiveAt ||
            new Date().toISOString(),
        });
      }
    );
  } catch (err) {
    console.warn("Supabase fetch warning in getAllUsers:", err);
  }

  return Array.from(map.values());
}
