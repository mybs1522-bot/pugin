import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const ipCheck = checkRateLimit(ip, 10, 10 * 60 * 1000);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many card verification attempts from this IP. Please try again in ${Math.ceil(
            ipCheck.retryAfterSeconds / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const email = (body?.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const emailCheck = checkRateLimit(email, 5, 10 * 60 * 1000);
    if (!emailCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many card verification attempts for this email. Please try again in ${Math.ceil(
            emailCheck.retryAfterSeconds / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    // Find or create customer
    const existing = await stripe.customers.list({ email, limit: 1 });
    let customerId: string;

    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { source: "V6 Render Trial Setup" },
      });
      customerId = customer.id;
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
      metadata: { email, clientIp: ip },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId,
    });
  } catch (err: any) {
    console.error("Stripe SetupIntent Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create setup intent" },
      { status: 500 }
    );
  }
}
