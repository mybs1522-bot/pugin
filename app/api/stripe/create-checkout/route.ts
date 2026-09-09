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

    let customerId: string | undefined = undefined;
    let hadPreviousSubscription = false;

    if (email && email.includes("@")) {
      const existing = await stripe.customers.list({ email, limit: 1 });
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
    }

    const origin =
      req.headers.get("origin") ||
      req.nextUrl.origin ||
      process.env.NEXTAUTH_URL ||
      "https://www.avada.space";

    const isActivatePro = body?.mode === "activate_pro" || body?.noTrial;

    const sessionParams: any = {
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data:
        hadPreviousSubscription || isActivatePro
          ? {}
          : {
              trial_period_days: trialDays,
              description: "V6 Render Pro 14-Day Free Trial",
            },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url:
        body?.mode === "activate_pro"
          ? `${origin}/render?session_id={CHECKOUT_SESSION_ID}&pro_activated=1`
          : `${origin}/render?session_id={CHECKOUT_SESSION_ID}&trial_activated=1&download=1`,
      cancel_url: `${origin}/`,
      metadata: {
        email: email || "collected_at_checkout",
        plan,
        mode: body?.mode || "download",
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (email && email.includes("@")) {
      sessionParams.customer_email = email;
    }

    const checkoutSession =
      await stripe.checkout.sessions.create(sessionParams);

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
