import { getSupabaseAdmin } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export const TRIAL_IMAGE_LIMIT = 10;
export const TRIAL_VIDEO_LIMIT = 1;
export const TRIAL_GENERATION_LIMIT = 10;

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

const memoryPaidUsers = new Map<string, { isPaid: boolean; mode: string }>();
const memoryUserStatuses = new Map<string, "paid" | "trial" | "cancelled">();
const memoryActiveSessions = new Map<string, string>(); // email -> activeSessionId
const memoryUserLogins = new Map<string, string>(); // email -> lastLoginAt
const memoryLastModels = new Map<string, string>(); // email -> lastModelUsed
const memoryUserModels = new Map<
  string,
  { imageModel: string; videoModel: string }
>(); // email -> assigned models
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

  const seed = seedUsers.find((u) => u.email.toLowerCase().trim() === norm);
  if (seed && seed.isPaid) return true;

  try {
    const { data } = await getSupabaseAdmin()
      .from("user_usage")
      .select("is_paid")
      .eq("email", norm)
      .single();

    return !!(data as { is_paid?: boolean })?.is_paid;
  } catch {
    return !!seed?.isPaid;
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

  // 1. Check in-memory fast cache
  const mem = memoryUserModels.get(norm);
  if (mem && mem.imageModel) {
    return mem;
  }

  // 2. Check Supabase permanent storage (support_tickets table with category user_model_config)
  try {
    const { data } = await getSupabaseAdmin()
      .from("support_tickets")
      .select("messages_json, message")
      .eq("category", "user_model_config")
      .eq("email", norm)
      .limit(1)
      .single();

    if (data && data.messages_json) {
      try {
        const parsed = JSON.parse(data.messages_json);
        if (parsed.imageModel) {
          const res = {
            imageModel: parsed.imageModel,
            videoModel:
              parsed.videoModel || "stability-ai/stable-video-diffusion",
          };
          memoryUserModels.set(norm, res);
          return res;
        }
      } catch {}
    } else if (data && data.message) {
      const res = {
        imageModel: data.message,
        videoModel: "stability-ai/stable-video-diffusion",
      };
      memoryUserModels.set(norm, res);
      return res;
    }
  } catch (err) {
    console.warn("Supabase getUserModels read warning:", err);
  }

  // 3. Check disk fallback
  const diskMap = loadDiskUsers();
  const diskUser = diskMap.get(norm);
  const imageModel = diskUser?.imageModel || "google/nano-banana-pro";
  const videoModel =
    diskUser?.videoModel || "stability-ai/stable-video-diffusion";
  const res = { imageModel, videoModel };
  memoryUserModels.set(norm, res);

  return res;
}

export async function setUserModels(
  email: string,
  imageModel: string,
  videoModel: string
): Promise<boolean> {
  const norm = email.toLowerCase().trim();
  const now = new Date().toISOString();

  // 1. Update in-memory map
  memoryUserModels.set(norm, { imageModel, videoModel });
  memoryLastModels.set(norm, imageModel);

  // 2. Save permanently to Supabase support_tickets table
  const configId = `user_config_${norm.replace(/[^a-zA-Z0-9]/g, "_")}`;
  try {
    await getSupabaseAdmin()
      .from("support_tickets")
      .upsert({
        id: configId,
        email: norm,
        category: "user_model_config",
        message: imageModel,
        messages_json: JSON.stringify({
          imageModel,
          videoModel,
          updatedAt: now,
        }),
        status: "active",
        updated_at: now,
      });
  } catch (err) {
    console.warn("Supabase setUserModels write warning:", err);
  }

  // 3. Update disk registry
  const diskMap = loadDiskUsers();
  const existing = diskMap.get(norm);
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

  // Check seedUsers baseline
  const seed = seedUsers.find((u) => u.email.toLowerCase().trim() === norm);
  const seedCount = seed ? seed.imageCount || seed.count || 0 : 0;

  // Also check disk storage (survives memory wipes on cold starts)
  let diskCount = 0;
  try {
    const diskMap = loadDiskUsers();
    const diskUser = diskMap.get(norm);
    if (diskUser) {
      diskCount = diskUser.imageCount || diskUser.count || 0;
      if (diskCount > mem.imageCount) {
        mem.imageCount = diskCount;
        mem.count = Math.max(mem.count, diskUser.count || 0);
      }
    }
  } catch {}

  let dbCount = 0;
  try {
    const { data } = await getSupabaseAdmin()
      .from("user_usage")
      .select("count, image_count")
      .eq("email", norm)
      .single();

    const row = data as { count?: number; image_count?: number } | null;
    dbCount = row?.image_count ?? row?.count ?? 0;
  } catch {}

  let logCount = 0;
  try {
    const { data: logs } = await getSupabaseAdmin()
      .from("support_tickets")
      .select("id")
      .eq("category", "system_render_log")
      .eq("email", norm);
    if (logs) logCount = logs.length;
  } catch {}

  const finalCount = Math.max(
    seedCount,
    dbCount,
    logCount,
    mem.imageCount,
    diskCount
  );
  mem.imageCount = finalCount;
  mem.count = Math.max(mem.count, finalCount);
  return finalCount;
}

export async function getVideoCount(email: string): Promise<number> {
  const norm = email.toLowerCase().trim();
  const mem = ensureMemRecord(norm);
  try {
    const { data } = await getSupabaseAdmin()
      .from("user_usage")
      .select("count, video_count")
      .eq("email", norm)
      .single();

    const row = data as { count?: number; video_count?: number } | null;
    const dbVid = row?.video_count ?? 0;
    return Math.max(dbVid, mem.videoCount);
  } catch {
    return mem.videoCount;
  }
}

export async function getGenerationCount(email: string): Promise<number> {
  const norm = email.toLowerCase().trim();
  const mem = ensureMemRecord(norm);

  let dbCount = 0;
  try {
    const { data } = await getSupabaseAdmin()
      .from("user_usage")
      .select("count")
      .eq("email", norm)
      .single();

    const row = data as { count?: number };
    dbCount = row?.count ?? 0;
  } catch {}

  let logCount = 0;
  try {
    const { data: logs } = await getSupabaseAdmin()
      .from("support_tickets")
      .select("id")
      .eq("category", "system_render_log")
      .eq("email", norm);
    if (logs) logCount = logs.length;
  } catch {}

  const finalCount = Math.max(dbCount, logCount, mem.count);
  mem.count = finalCount;
  return finalCount;
}

export async function incrementImageCount(
  email: string,
  modelUsed: string = "google/nano-banana-2"
): Promise<number> {
  const norm = email.toLowerCase().trim();
  const now = new Date().toISOString();

  // 1. Fetch current true count from Supabase first
  let dbCount = 0;
  let dbImg = 0;
  let dbVid = 0;
  let isPaid = !!memoryPaidUsers.get(norm)?.isPaid;

  try {
    const { data } = await getSupabaseAdmin()
      .from("user_usage")
      .select("count, image_count, video_count, is_paid")
      .eq("email", norm)
      .single();

    if (data) {
      dbCount = data.count || 0;
      dbImg = data.image_count || data.count || 0;
      dbVid = data.video_count || 0;
      if (typeof data.is_paid === "boolean") isPaid = data.is_paid;
    }
  } catch {}

  // 2. Also check ground truth live logs in Supabase
  try {
    const { data: logs } = await getSupabaseAdmin()
      .from("support_tickets")
      .select("id")
      .eq("category", "system_render_log")
      .eq("email", norm);
    if (logs && logs.length > 0) {
      dbCount = Math.max(dbCount, logs.length);
      dbImg = Math.max(dbImg, logs.length - dbVid);
    }
  } catch {}

  const mem = ensureMemRecord(norm);
  const newTotal = Math.max(dbCount, mem.count) + 1;
  const newImg = Math.max(dbImg, mem.imageCount) + 1;

  mem.count = newTotal;
  mem.imageCount = newImg;
  mem.lastActiveAt = now;
  memoryLastModels.set(norm, modelUsed);

  const userStatusImg =
    memoryUserStatuses.get(norm) || (isPaid ? "paid" : "trial");

  saveDiskUserRecord({
    email: norm,
    count: newTotal,
    imageCount: newImg,
    videoCount: mem.videoCount,
    isPaid: isPaid,
    status: userStatusImg,
    paymentMode: isPaid ? "Pro Plan Subscription" : "14-Day Free Trial",
    lastModelUsed: modelUsed,
    signedUpAt: mem.signedUpAt || now,
    lastLoginAt: now,
    lastActiveAt: now,
  });

  try {
    await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      count: newTotal,
      image_count: newImg,
      last_active_at: now,
    });
  } catch (err) {
    console.warn("Supabase image increment warning:", err);
  }

  return newTotal;
}

export async function incrementVideoCount(
  email: string,
  modelUsed: string = "stability-ai/stable-video-diffusion"
): Promise<number> {
  const norm = email.toLowerCase().trim();
  const now = new Date().toISOString();

  let dbCount = 0;
  let dbImg = 0;
  let dbVid = 0;
  let isPaid = !!memoryPaidUsers.get(norm)?.isPaid;

  try {
    const { data } = await getSupabaseAdmin()
      .from("user_usage")
      .select("count, image_count, video_count, is_paid")
      .eq("email", norm)
      .single();

    if (data) {
      dbCount = data.count || 0;
      dbImg = data.image_count || data.count || 0;
      dbVid = data.video_count || 0;
      if (typeof data.is_paid === "boolean") isPaid = data.is_paid;
    }
  } catch {}

  const mem = ensureMemRecord(norm);
  const newTotal = Math.max(dbCount, mem.count) + 1;
  const newVid = Math.max(dbVid, mem.videoCount) + 1;

  mem.count = newTotal;
  mem.videoCount = newVid;
  mem.lastActiveAt = now;
  memoryLastModels.set(norm, modelUsed);

  const userStatusVid =
    memoryUserStatuses.get(norm) || (isPaid ? "paid" : "trial");

  saveDiskUserRecord({
    email: norm,
    count: newTotal,
    imageCount: mem.imageCount,
    videoCount: newVid,
    isPaid: isPaid,
    status: userStatusVid,
    paymentMode: isPaid ? "Pro Plan Subscription" : "14-Day Free Trial",
    lastModelUsed: modelUsed,
    signedUpAt: mem.signedUpAt || now,
    lastLoginAt: now,
    lastActiveAt: now,
  });

  try {
    await getSupabaseAdmin().from("user_usage").upsert({
      email: norm,
      count: newTotal,
      video_count: newVid,
      last_active_at: now,
    });
  } catch (err) {
    console.warn("Supabase video increment warning:", err);
  }

  return newTotal;
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

    // Also load assigned model configurations from Supabase
    try {
      const { data: configs } = await getSupabaseAdmin()
        .from("support_tickets")
        .select("email, messages_json, message")
        .eq("category", "user_model_config");

      (configs || []).forEach(
        (c: { email: string; messages_json?: string; message?: string }) => {
          const key = c.email.toLowerCase().trim();
          let imgModel = c.message || "google/nano-banana-pro";
          let vidModel = "stability-ai/stable-video-diffusion";
          try {
            if (c.messages_json) {
              const parsed = JSON.parse(c.messages_json);
              if (parsed.imageModel) imgModel = parsed.imageModel;
              if (parsed.videoModel) vidModel = parsed.videoModel;
            }
          } catch {}

          memoryUserModels.set(key, {
            imageModel: imgModel,
            videoModel: vidModel,
          });

          const existing = map.get(key);
          if (existing) {
            existing.imageModel = imgModel;
            existing.videoModel = vidModel;
            existing.lastModelUsed = imgModel;
          }
        }
      );
    } catch (cfgErr) {
      console.warn("Supabase user_model_config fetch warning:", cfgErr);
    }

    // Compute ground truth render counts directly from recorded execution logs
    try {
      const { data: logs } = await getSupabaseAdmin()
        .from("support_tickets")
        .select("email, messages_json, message, status")
        .eq("category", "system_render_log");

      const logCounts = new Map<
        string,
        { total: number; img: number; vid: number }
      >();

      (logs || []).forEach(
        (l: {
          email: string;
          messages_json?: string;
          message?: string;
          status?: string;
        }) => {
          const key = l.email.toLowerCase().trim();
          let isVid = false;
          let isSuccess = true;
          try {
            if (l.messages_json) {
              const parsed = JSON.parse(l.messages_json);
              if (parsed.type === "video") isVid = true;
              if (parsed.status === "failed") isSuccess = false;
            } else if (l.message && l.message.includes("VIDEO")) {
              isVid = true;
            }
          } catch {}

          if (isSuccess) {
            const cur = logCounts.get(key) || { total: 0, img: 0, vid: 0 };
            cur.total += 1;
            if (isVid) cur.vid += 1;
            else cur.img += 1;
            logCounts.set(key, cur);
          }
        }
      );

      logCounts.forEach((counts, emailKey) => {
        const existing = map.get(emailKey);
        if (existing) {
          existing.count = Math.max(existing.count || 0, counts.total);
          existing.imageCount = Math.max(existing.imageCount || 0, counts.img);
          existing.videoCount = Math.max(existing.videoCount || 0, counts.vid);
        } else {
          map.set(emailKey, {
            email: emailKey,
            count: counts.total,
            imageCount: counts.img,
            videoCount: counts.vid,
            isPaid: false,
            status: "trial",
            paymentMode: "14-Day Free Trial",
            lastModelUsed: "google/nano-banana-pro",
            signedUpAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
          });
        }
      });
    } catch (logErr) {
      console.warn(
        "Supabase system_render_log count aggregation warning:",
        logErr
      );
    }
  } catch (err) {
    console.warn("Supabase fetch warning in getAllUsers:", err);
  }

  return Array.from(map.values()).map((u) => {
    const key = u.email.toLowerCase().trim();
    const assigned = memoryUserModels.get(key) || {
      imageModel: u.imageModel || "google/nano-banana-pro",
      videoModel: u.videoModel || "stability-ai/stable-video-diffusion",
    };
    return {
      ...u,
      imageModel: assigned.imageModel,
      videoModel: assigned.videoModel,
      lastModelUsed:
        assigned.imageModel || u.lastModelUsed || "google/nano-banana-pro",
      status: u.status || (u.isPaid ? "paid" : "trial"),
    };
  });
}

/* ─── RENDER AUDIT & EXECUTION LOGS ───────────────────────────────────────── */
export interface RenderLogEntry {
  id: string;
  timestamp: string;
  email: string;
  type: "image" | "video";
  requestedModel: string;
  executedModel: string;
  provider: "Google AI Studio" | "Replicate";
  status: "success" | "fallback_cascade" | "failed";
  durationSeconds: number;
  details?: string;
  error?: string;
  outputPreview?: string;
}

const memoryRenderLogs: RenderLogEntry[] = [];

function getLogStorePath(): string {
  try {
    const tmpDir = "/tmp";
    if (fs.existsSync(tmpDir)) {
      return path.join(tmpDir, "pugin_render_logs.json");
    }
  } catch {}
  return path.join(process.cwd(), ".render_logs.json");
}

export async function recordRenderLog(
  entry: Omit<RenderLogEntry, "id" | "timestamp">
): Promise<RenderLogEntry> {
  const fullEntry: RenderLogEntry = {
    id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    ...entry,
  };

  memoryRenderLogs.unshift(fullEntry);
  if (memoryRenderLogs.length > 500) {
    memoryRenderLogs.pop();
  }

  // 1. Permanently persist to Supabase Database
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("support_tickets").insert({
      id: fullEntry.id,
      email: fullEntry.email,
      category: "system_render_log",
      status: "resolved",
      message: `${fullEntry.type.toUpperCase()} render via ${fullEntry.executedModel} (${fullEntry.status})`,
      messages_json: JSON.stringify(fullEntry),
      created_at: fullEntry.timestamp,
      updated_at: fullEntry.timestamp,
    });
  } catch (err) {
    console.warn("Failed to write render log to Supabase:", err);
  }

  // 2. Persist to disk as secondary local cache
  try {
    const logPath = getLogStorePath();
    let existingLogs: RenderLogEntry[] = [];
    if (fs.existsSync(logPath)) {
      const raw = fs.readFileSync(logPath, "utf-8");
      if (raw && raw.trim()) {
        existingLogs = JSON.parse(raw);
      }
    }
    existingLogs.unshift(fullEntry);
    if (existingLogs.length > 500) {
      existingLogs = existingLogs.slice(0, 500);
    }
    fs.writeFileSync(logPath, JSON.stringify(existingLogs, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to persist render log to disk:", err);
  }

  return fullEntry;
}

export async function getRenderLogs(
  limit: number = 100
): Promise<RenderLogEntry[]> {
  const map = new Map<string, RenderLogEntry>();

  // 1. Fetch permanent execution logs from Supabase Database
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("category", "system_render_log")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (data && Array.isArray(data)) {
      data.forEach((row: any) => {
        try {
          if (row.messages_json) {
            const parsed = JSON.parse(row.messages_json);
            if (parsed && parsed.id) {
              map.set(parsed.id, {
                ...parsed,
                timestamp: parsed.timestamp || row.created_at,
              });
            }
          }
        } catch {}
      });
    }
  } catch (err) {
    console.warn("Supabase fetch warning in getRenderLogs:", err);
  }

  // 2. Merge in-memory cache
  memoryRenderLogs.forEach((l) => {
    if (!map.has(l.id)) {
      map.set(l.id, l);
    }
  });

  // 3. Merge disk cache
  try {
    const logPath = getLogStorePath();
    if (fs.existsSync(logPath)) {
      const raw = fs.readFileSync(logPath, "utf-8");
      if (raw && raw.trim()) {
        const diskLogs = JSON.parse(raw);
        if (Array.isArray(diskLogs)) {
          diskLogs.forEach((l: RenderLogEntry) => {
            if (l && l.id && !map.has(l.id)) {
              map.set(l.id, l);
            }
          });
        }
      }
    }
  } catch {}

  const sorted = Array.from(map.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return sorted.slice(0, limit);
}
