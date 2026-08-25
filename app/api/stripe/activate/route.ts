import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";
import { setUserPaidStatus } from "@/lib/usage";

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

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const plan: PlanKey =
      body?.plan && PLANS[body.plan as PlanKey]
        ? (body.plan as PlanKey)
        : "monthly";
    const selectedPlan = PLANS[plan];

    // Find Stripe customer
    const existing = await stripe.customers.list({ email, limit: 1 });
    let customerId: string;

    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        name: session?.user?.name ?? undefined,
        metadata: { source: "V6 Render 1-Click Activate" },
      });
      customerId = customer.id;
    }

    // 1. Check for active or trialing subscriptions
    const activeSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 5,
    });

    const trialingSub = activeSubs.data.find((s) => s.status === "trialing");

    if (trialingSub) {
      // 1-Click: End trial immediately and charge the saved payment method on file!
      const updated = await stripe.subscriptions.update(trialingSub.id, {
        trial_end: "now",
        proration_behavior: "always_invoice",
      });

      // Anti-Fraud / Empty Card Check: Verify the subscription is actually paid/active
      if (
        updated.status === "past_due" ||
        updated.status === "incomplete" ||
        updated.status === "unpaid"
      ) {
        await setUserPaidStatus(
          email,
          false,
          "Payment Failed (Card Empty/Declined)"
        );
        return NextResponse.json(
          {
            error:
              "Card charge was declined (insufficient funds or bank declined). Please update your payment method.",
            status: updated.status,
          },
          { status: 402 }
        );
      }

      await setUserPaidStatus(email, true, `Stripe Pro (${plan})`);

      return NextResponse.json({
        success: true,
        activated: true,
        isPaid: true,
        subscriptionId: updated.id,
        status: updated.status,
        message:
          "Your subscription has been activated and your card on file has been charged. Unlimited 4K renders unlocked!",
      });
    }

    // Check if they already have an active paid subscription
    const currentActive = activeSubs.data.find((s) => s.status === "active");
    if (currentActive) {
      await setUserPaidStatus(email, true, `Stripe Pro (${plan})`);
      return NextResponse.json({
        success: true,
        activated: true,
        isPaid: true,
        subscriptionId: currentActive.id,
        status: "active",
        message: "You already have an active subscription.",
      });
    }

    // 2. Check for saved payment methods on customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    if (paymentMethods.data.length > 0) {
      // Has saved card on file — create paid subscription immediately off-session
      const pm = paymentMethods.data[0];
      const newSub = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: selectedPlan.priceId }],
        default_payment_method: pm.id,
        off_session: true,
        payment_behavior: "error_if_incomplete",
        metadata: { activatedVia: "1-Click Plugin Activation" },
      });

      if (
        newSub.status === "past_due" ||
        newSub.status === "incomplete" ||
        newSub.status === "unpaid"
      ) {
        await setUserPaidStatus(
          email,
          false,
          "Payment Failed (Card Empty/Declined)"
        );
        return NextResponse.json(
          {
            error:
              "Card charge was declined (insufficient funds). Please update your payment method.",
            status: newSub.status,
          },
          { status: 402 }
        );
      }

      await setUserPaidStatus(email, true, `Stripe Pro (${plan})`);

      return NextResponse.json({
        success: true,
        activated: true,
        isPaid: true,
        subscriptionId: newSub.id,
        status: newSub.status,
        message:
          "Card on file charged successfully. Unlimited rendering unlocked!",
      });
    }

    // 3. No card on file — generate Stripe Checkout session to add card
    const origin =
      req.headers.get("origin") ||
      req.nextUrl.origin ||
      process.env.NEXTAUTH_URL ||
      "https://www.avada.space";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: `${origin}/render?session_id={CHECKOUT_SESSION_ID}&activated=1`,
      cancel_url: `${origin}/`,
      metadata: { email, plan },
    });

    return NextResponse.json({
      needsCheckout: true,
      url: checkoutSession.url,
      message: "Please enter your payment method to activate your plan.",
    });
  } catch (err: any) {
    console.error("Stripe 1-Click Activate Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to activate subscription" },
      { status: 500 }
    );
  }
}
