import { NextResponse } from "next/server";
import { TRIAL_IMAGE_LIMIT, isUserPaid, getImageCount } from "@/lib/usage";

export const dynamic = "force-dynamic";

/**
 * Pre-flight trial status check.
 *
 * Uses the authoritative single source of truth from @/lib/usage
 * (the exact same database & registry used by the admin dashboard and replicate API).
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

    // 1. Check if user has active paid subscription
    const paid = await isUserPaid(normEmail);
    if (paid) {
      return NextResponse.json({
        allowed: true,
        paid: true,
        imageCount: 0,
        limit: TRIAL_IMAGE_LIMIT,
        source: "paid_subscription",
      });
    }

    // 2. Authoritative check from user usage database / registry
    const currentImageCount = await getImageCount(normEmail);
    const allowed = currentImageCount < TRIAL_IMAGE_LIMIT;

    console.log(
      `[TRIAL CHECK] ${normEmail}: imageCount=${currentImageCount}/${TRIAL_IMAGE_LIMIT}, allowed=${allowed}`
    );

    return NextResponse.json({
      allowed,
      paid: false,
      imageCount: currentImageCount,
      limit: TRIAL_IMAGE_LIMIT,
    });
  } catch (err) {
    console.error("Trial check error:", err);
    return NextResponse.json({
      allowed: true,
      paid: false,
      imageCount: 0,
      limit: TRIAL_IMAGE_LIMIT,
    });
  }
}
