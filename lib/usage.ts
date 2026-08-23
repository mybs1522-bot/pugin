import { getSupabaseAdmin } from "@/lib/supabase";
import fs from "fs";
import path from "path";

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
  imageModel?: string;
  videoModel?: string;
  lastModelUsed?: string;
  activeSessionId?: string;
  signedUpAt: string;
  lastLoginAt: string;
  lastActiveAt: string;
}

function getDiskStorePath(): string {
  try {
    const tmpDir = "/tmp";
    if (fs.existsSync(tmpDir)) {
      return path.join(tmpDir, "pugin_users_registry.json");
    }
  } catch {}
  return path.join(process.cwd(), ".users_registry.json");
}

function loadDiskUsers(): Map<string, { email: string } & UserRecord> {
  const map = new Map<string, { email: string } & UserRecord>();
  try {
    const filePath = getDiskStorePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      if (raw && raw.trim()) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((u: { email: string } & UserRecord) => {
            if (u && u.email) {
              map.set(u.email.toLowerCase().trim(), u);
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn("Disk load warning:", err);
  }
  return map;
}

function saveDiskUserRecord(u: { email: string } & UserRecord) {
  try {
    const diskMap = loadDiskUsers();
    diskMap.set(u.email.toLowerCase().trim(), u);
    const filePath = getDiskStorePath();
    const list = Array.from(diskMap.values());
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("Disk save warning:", err);
  }
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

  const diskMap = loadDiskUsers();
  const existing = diskMap.get(norm);
  const now = new Date().toISOString();

  saveDiskUserRecord({
    email: norm,
    count: existing?.count || 0,
    imageCount: existing?.imageCount || 0,
    videoCount: existing?.videoCount || 0,
    isPaid,
    status,
    paymentMode,
    signedUpAt: existing?.signedUpAt || now,
    lastLoginAt: existing?.lastLoginAt || now,
    lastActiveAt: now,
  });

  try {
    await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      is_paid: isPaid,
      payment_mode: paymentMode,
      last_active_at: now,
    });
  } catch (err) {
    console.warn("Supabase status update skipped:", err);
  }

  return true;
}

export async function getUserModels(
  email: string
): Promise<{ imageModel: string; videoModel: string }> {
  const norm = email.toLowerCase().trim();
  const memStatus = memoryUserStatuses.get(norm);
  const diskMap = loadDiskUsers();
  const diskUser = diskMap.get(norm);

  const imageModel = diskUser?.imageModel || "google/nano-banana-pro";
  const videoModel =
    diskUser?.videoModel || "stability-ai/stable-video-diffusion";

  return { imageModel, videoModel };
}

export async function setUserModels(
  email: string,
  imageModel: string,
  videoModel: string
): Promise<boolean> {
  const norm = email.toLowerCase().trim();
  const diskMap = loadDiskUsers();
  const existing = diskMap.get(norm);
  const now = new Date().toISOString();

  saveDiskUserRecord({
    email: norm,
    count: existing?.count || 0,
    imageCount: existing?.imageCount || 0,
    videoCount: existing?.videoCount || 0,
    isPaid: existing?.isPaid || false,
    status: existing?.status || "trial",
    paymentMode: existing?.paymentMode || "Free Trial",
    imageModel,
    videoModel,
    lastModelUsed: imageModel,
    signedUpAt: existing?.signedUpAt || now,
    lastLoginAt: existing?.lastLoginAt || now,
    lastActiveAt: now,
  });

  return true;
}

export async function registerTrialUser(email: string): Promise<boolean> {
  const norm = email.toLowerCase().trim();
  const now = new Date().toISOString();

  memoryUserStatuses.set(norm, "trial");
  memoryUserLogins.set(norm, now);

  const mem = ensureMemRecord(norm);
  mem.lastActiveAt = now;

  saveDiskUserRecord({
    email: norm,
    count: mem.count || 0,
    imageCount: mem.imageCount || 0,
    videoCount: mem.videoCount || 0,
    isPaid: false,
    status: "trial",
    paymentMode: "14-Day Free Trial",
    signedUpAt: now,
    lastLoginAt: now,
    lastActiveAt: now,
  });

  try {
    await getSupabaseAdmin()
      .from("user_usage")
      .upsert({
        email: norm,
        is_paid: false,
        payment_mode: "14-Day Free Trial",
        signed_up_at: now,
        last_login_at: now,
        last_active_at: now,
        count: mem.count || 0,
      });
  } catch (err) {
    console.warn("Supabase trial registration skipped:", err);
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

  const isPaidUserImg = !!memoryPaidUsers.get(norm)?.isPaid;
  const userStatusImg =
    memoryUserStatuses.get(norm) || (isPaidUserImg ? "paid" : "trial");

  saveDiskUserRecord({
    email: norm,
    count: mem.count,
    imageCount: mem.imageCount,
    videoCount: mem.videoCount,
    isPaid: isPaidUserImg,
    status: userStatusImg,
    paymentMode: isPaidUserImg ? "Pro Plan Subscription" : "14-Day Free Trial",
    lastModelUsed: modelUsed,
    signedUpAt: mem.signedUpAt || now,
    lastLoginAt: now,
    lastActiveAt: now,
  });

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

  const isPaidUserVid = !!memoryPaidUsers.get(norm)?.isPaid;
  const userStatusVid =
    memoryUserStatuses.get(norm) || (isPaidUserVid ? "paid" : "trial");

  saveDiskUserRecord({
    email: norm,
    count: mem.count,
    imageCount: mem.imageCount,
    videoCount: mem.videoCount,
    isPaid: isPaidUserVid,
    status: userStatusVid,
    paymentMode: isPaidUserVid ? "Pro Plan Subscription" : "14-Day Free Trial",
    lastModelUsed: modelUsed,
    signedUpAt: mem.signedUpAt || now,
    lastLoginAt: now,
    lastActiveAt: now,
  });

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

const seedUsers: Array<{ email: string } & UserRecord> = [
  {
    email: "ipzyboxghgh@gmail.com",
    count: 3,
    imageCount: 3,
    videoCount: 0,
    isPaid: false,
    status: "trial",
    paymentMode: "14-Day Free Trial",
    lastModelUsed: "google/nano-banana-pro",
    signedUpAt: "2026-08-24T01:59:00Z",
    lastLoginAt: "2026-08-24T02:40:00Z",
    lastActiveAt: "2026-08-24T02:40:00Z",
  },
  {
    email: "shaukat.architect@studio.com",
    count: 14,
    imageCount: 11,
    videoCount: 3,
    isPaid: true,
    status: "paid",
    paymentMode: "Pro Plan Subscription",
    lastModelUsed: "google/nano-banana-pro",
    signedUpAt: "2026-08-15T10:00:00Z",
    lastLoginAt: "2026-08-23T18:00:00Z",
    lastActiveAt: "2026-08-23T18:00:00Z",
  },
  {
    email: "priya.design@gmail.com",
    count: 2,
    imageCount: 2,
    videoCount: 0,
    isPaid: false,
    status: "trial",
    paymentMode: "14-Day Free Trial",
    lastModelUsed: "google/nano-banana-pro",
    signedUpAt: "2026-08-22T14:30:00Z",
    lastLoginAt: "2026-08-23T12:00:00Z",
    lastActiveAt: "2026-08-23T12:00:00Z",
  },
  {
    email: "rahul.verma@example.com",
    count: 4,
    imageCount: 3,
    videoCount: 1,
    isPaid: false,
    status: "trial",
    paymentMode: "14-Day Free Trial",
    lastModelUsed: "google/nano-banana-pro",
    signedUpAt: "2026-08-23T09:15:00Z",
    lastLoginAt: "2026-08-23T15:30:00Z",
    lastActiveAt: "2026-08-23T15:30:00Z",
  },
];

export async function getAllUsers(): Promise<
  Array<{ email: string } & UserRecord>
> {
  const map = loadDiskUsers();

  seedUsers.forEach((u) => {
    const key = u.email.toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, u);
    }
  });

  memoryUserCounts.forEach((val, emailKey) => {
    const memPaid = memoryPaidUsers.get(emailKey);
    const existing = map.get(emailKey);
    map.set(emailKey, {
      email: emailKey,
      count: Math.max(val.count, existing?.count || 0),
      imageCount: Math.max(
        val.imageCount || val.count,
        existing?.imageCount || 0
      ),
      videoCount: Math.max(val.videoCount || 0, existing?.videoCount || 0),
      isPaid: !!(memPaid ? memPaid.isPaid : existing?.isPaid),
      status:
        memoryUserStatuses.get(emailKey) ||
        existing?.status ||
        (existing?.isPaid ? "paid" : "trial"),
      paymentMode: memPaid
        ? memPaid.mode
        : existing?.paymentMode || "Free Trial",
      lastModelUsed:
        memoryLastModels.get(emailKey) ||
        existing?.lastModelUsed ||
        "google/nano-banana-pro",
      activeSessionId:
        memoryActiveSessions.get(emailKey) || existing?.activeSessionId,
      signedUpAt: existing?.signedUpAt || val.signedUpAt,
      lastLoginAt:
        memoryUserLogins.get(emailKey) ||
        existing?.lastLoginAt ||
        val.lastActiveAt,
      lastActiveAt:
        val.lastActiveAt || existing?.lastActiveAt || new Date().toISOString(),
    });
  });

  try {
    const supabasePromise = getSupabaseAdmin()
      .from("user_usage")
      .select("*")
      .order("signed_up_at", { ascending: false });

    const timeoutPromise = new Promise<{ data: null }>((resolve) =>
      setTimeout(() => resolve({ data: null }), 1000)
    );

    const res = (await Promise.race([supabasePromise, timeoutPromise])) as {
      data?: any[] | null;
    };

    const data = res?.data;

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

  return Array.from(map.values()).map((u) => ({
    ...u,
    status: u.status || (u.isPaid ? "paid" : "trial"),
  }));
}
