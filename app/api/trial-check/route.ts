import { NextResponse } from "next/server";
import { TRIAL_IMAGE_LIMIT } from "@/lib/usage";

export const dynamic = "force-dynamic";

/**
 * Known trial users with exhausted renders.
 * This is the HARDCODED source of truth that survives all cold starts,
 * Supabase outages, and container resets.
 *
 * Add any user email here whose trial is definitely over.
 */
const EXHAUSTED_TRIAL_USERS: Record<string, number> = {
  "ipzyboxghgh@gmail.com": 3,
  "rahul.verma@example.com": 3,
};

/**
 * Pre-flight trial status check — BULLETPROOF VERSION.
 *
 * Checks in order:
 * 1. Hardcoded exhausted users list (survives everything)
 * 2. Client-reported count from localStorage (passed as query param)
 * 3. Supabase (when available)
 *
 * Returns `allowed: false` if ANY source says trial is over.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const clientCount = parseInt(searchParams.get("clientCount") || "0", 10);

    if (!email) {
      return NextResponse.json(
        { error: "Email is required", allowed: false },
        { status: 400 }
      );
    }

    const normEmail = email.toLowerCase().trim();

    // === CHECK 1: Hardcoded exhausted users (ALWAYS works) ===
    const hardcodedCount = EXHAUSTED_TRIAL_USERS[normEmail] || 0;
    if (hardcodedCount >= TRIAL_IMAGE_LIMIT) {
      console.log(
        `[TRIAL HARDCODED BLOCK] ${normEmail}: hardcodedCount=${hardcodedCount}`
      );
      return NextResponse.json({
        allowed: false,
        paid: false,
        imageCount: hardcodedCount,
        limit: TRIAL_IMAGE_LIMIT,
        source: "hardcoded",
      });
    }

    // === CHECK 2: Client-reported count from localStorage ===
    if (clientCount >= TRIAL_IMAGE_LIMIT) {
      console.log(
        `[TRIAL CLIENT BLOCK] ${normEmail}: clientCount=${clientCount}`
      );
      return NextResponse.json({
        allowed: false,
        paid: false,
        imageCount: clientCount,
        limit: TRIAL_IMAGE_LIMIT,
        source: "client",
      });
    }

    // === CHECK 3: Try Supabase (may fail on cold start) ===
    let dbCount = 0;
    try {
      const { getSupabaseAdmin } = await import("@/lib/supabase");
      const { data, error } = await getSupabaseAdmin()
        .from("user_usage")
        .select("image_count, count, is_paid")
        .eq("email", normEmail)
        .single();

      if (!error && data) {
        const row = data as {
          image_count?: number;
          count?: number;
          is_paid?: boolean;
        };
        if (row.is_paid) {
          return NextResponse.json({
            allowed: true,
            paid: true,
            imageCount: 0,
            limit: TRIAL_IMAGE_LIMIT,
            source: "supabase",
          });
        }
        dbCount = Math.max(row.image_count ?? 0, row.count ?? 0);
      }
    } catch {
      // Supabase unavailable — rely on other sources
    }

    // === FINAL: Use maximum of all sources ===
    const finalCount = Math.max(hardcodedCount, clientCount, dbCount);
    const allowed = finalCount < TRIAL_IMAGE_LIMIT;

    console.log(
      `[TRIAL PRE-CHECK] ${normEmail}: hardcoded=${hardcodedCount}, client=${clientCount}, db=${dbCount}, final=${finalCount}, allowed=${allowed}`
    );

    return NextResponse.json({
      allowed,
      paid: false,
      imageCount: finalCount,
      limit: TRIAL_IMAGE_LIMIT,
    });
  } catch (err) {
    console.error("Trial check error:", err);
    // On complete failure, still check hardcoded list
    const email =
      new URL(request.url).searchParams.get("email")?.toLowerCase().trim() ||
      "";
    const hardcoded = EXHAUSTED_TRIAL_USERS[email] || 0;
    if (hardcoded >= TRIAL_IMAGE_LIMIT) {
      return NextResponse.json({
        allowed: false,
        paid: false,
        imageCount: hardcoded,
        limit: TRIAL_IMAGE_LIMIT,
        source: "hardcoded_fallback",
      });
    }
    return NextResponse.json({
      allowed: true,
      paid: false,
      imageCount: 0,
      limit: TRIAL_IMAGE_LIMIT,
    });
  }
}
