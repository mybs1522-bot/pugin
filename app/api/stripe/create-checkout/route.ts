import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => ({}));
    const email = (session?.user?.email || body?.email || "")
      .trim()
      .toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const plan: PlanKey =
      body?.plan && PLANS[body.plan as PlanKey]
        ? (body.plan as PlanKey)
        : "monthly";
    const { priceId, trialDays } = PLANS[plan];

    if (!priceId) {
      return NextResponse.json(
        { error: "Price not configured for this plan" },
        { status: 500 }
      );
    }

    // Find or create Stripe customer
    const existing = await stripe.customers.list({ email, limit: 1 });
    let customerId: string;
    let hadPreviousSubscription = false;

    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
      const prevSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 5,
      });
      hadPreviousSubscription = prevSubs.data.some(
        (s) =>
          s.status === "active" ||
          s.status === "past_due" ||
          s.status === "canceled"
      );
    } else {
      const customer = await stripe.customers.create({
        email,
        name: session?.user?.name ?? undefined,
        metadata: { source: "V6 Render Web / Plugin" },
      });
      customerId = customer.id;
    }

    const origin =
      req.headers.get("origin") ||
      req.nextUrl.origin ||
      process.env.NEXTAUTH_URL ||
      "https://www.avada.space";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: hadPreviousSubscription
        ? {}
        : {
            trial_period_days: trialDays,
            description: "V6 Render Pro 14-Day Free Trial",
          },
      allow_promotion_codes: true,
      success_url: `${origin}/render?session_id={CHECKOUT_SESSION_ID}&trial_activated=1`,
      cancel_url: `${origin}/`,
      metadata: {
        email,
        plan,
      },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (err: any) {
    console.error("Stripe create-checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
