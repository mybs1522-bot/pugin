import { NextResponse } from "next/server";
import { getImageCount, isUserPaid, TRIAL_IMAGE_LIMIT } from "@/lib/usage";

export const dynamic = "force-dynamic";

/**
 * Pre-flight trial status check.
 * Frontend calls this BEFORE showing the loading spinner to immediately
 * show the "Activate Pro Plan" card if trial is over.
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

    const imageCount = await getImageCount(normEmail);
    const allowed = imageCount < TRIAL_IMAGE_LIMIT;

    console.log(
      `[TRIAL PRE-CHECK] ${normEmail}: imageCount=${imageCount}, limit=${TRIAL_IMAGE_LIMIT}, allowed=${allowed}`
    );

    return NextResponse.json({
      allowed,
      paid: false,
      imageCount,
      limit: TRIAL_IMAGE_LIMIT,
    });
  } catch (err) {
    console.error("Trial check error:", err);
    // Fail-open on pre-check error (the main render endpoint will still block)
    return NextResponse.json({
      allowed: true,
      paid: false,
      imageCount: 0,
      limit: TRIAL_IMAGE_LIMIT,
    });
  }
}
