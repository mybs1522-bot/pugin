import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getImageCount, isUserPaid, TRIAL_IMAGE_LIMIT } from "@/lib/usage";

export const dynamic = "force-dynamic";

/**
 * Pre-flight trial status check — ROBUST VERSION.
 * Directly queries Supabase + uses getImageCount as backup.
 * Returns debug info so we can trace issues.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required", allowed: false },
        { status: 400 }
      );
    }

    const normEmail = email.toLowerCase().trim();
    const paid = await isUserPaid(normEmail);

    if (paid) {
      return NextResponse.json({
        allowed: true,
        paid: true,
        imageCount: 0,
        limit: TRIAL_IMAGE_LIMIT,
      });
    }

    // === DIRECT SUPABASE QUERY ===
    let dbImageCount = 0;
    let dbCount = 0;
    let dbError: string | null = null;
    try {
      const { data, error } = await getSupabaseAdmin()
        .from("user_usage")
        .select("image_count, count, is_paid")
        .eq("email", normEmail)
        .single();

      if (error) {
        dbError = error.message || "Query error";
      } else if (data) {
        const row = data as {
          image_count?: number;
          count?: number;
          is_paid?: boolean;
        };
        dbImageCount = row.image_count ?? 0;
        dbCount = row.count ?? 0;
        if (row.is_paid) {
          return NextResponse.json({
            allowed: true,
            paid: true,
            imageCount: 0,
            limit: TRIAL_IMAGE_LIMIT,
            source: "supabase_direct",
          });
        }
      }
    } catch (e) {
      dbError = e instanceof Error ? e.message : String(e);
    }

    // === getImageCount (memory + disk + supabase) ===
    const libImageCount = await getImageCount(normEmail);

    // Use the MAXIMUM from all sources
    const finalCount = Math.max(dbImageCount, dbCount, libImageCount);
    const allowed = finalCount < TRIAL_IMAGE_LIMIT;

    console.log(
      `[TRIAL PRE-CHECK] ${normEmail}: dbImageCount=${dbImageCount}, dbCount=${dbCount}, libImageCount=${libImageCount}, finalCount=${finalCount}, limit=${TRIAL_IMAGE_LIMIT}, allowed=${allowed}, dbError=${dbError}`
    );

    return NextResponse.json({
      allowed,
      paid: false,
      imageCount: finalCount,
      limit: TRIAL_IMAGE_LIMIT,
      _debug: {
        dbImageCount,
        dbCount,
        libImageCount,
        dbError,
      },
    });
  } catch (err) {
    console.error("Trial check error:", err);
    return NextResponse.json({
      allowed: true,
      paid: false,
      imageCount: 0,
      limit: TRIAL_IMAGE_LIMIT,
      _debug: { error: err instanceof Error ? err.message : String(err) },
    });
  }
}
