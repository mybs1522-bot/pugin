import { NextRequest, NextResponse } from "next/server";
import { sendFacebookCapiEvent } from "@/lib/facebook-capi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventName,
      eventId,
      eventSourceUrl,
      userData = {},
      customData,
      testEventCode,
    } = body;

    if (!eventName) {
      return NextResponse.json(
        { success: false, error: "eventName is required" },
        { status: 400 }
      );
    }

    // Auto-populate IP and User-Agent if not provided
    const clientIpAddress =
      userData.clientIpAddress ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined;

    const clientUserAgent =
      userData.clientUserAgent || req.headers.get("user-agent") || undefined;

    // Extract _fbp and _fbc from cookies if present
    const fbp = userData.fbp || req.cookies.get("_fbp")?.value;
    const fbc = userData.fbc || req.cookies.get("_fbc")?.value;

    const result = await sendFacebookCapiEvent({
      eventName,
      eventId,
      eventSourceUrl: eventSourceUrl || req.headers.get("referer") || undefined,
      userData: {
        ...userData,
        clientIpAddress,
        clientUserAgent,
        fbp,
        fbc,
      },
      customData,
      testEventCode,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
