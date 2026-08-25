import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";
import { registerTrialUser, setUserStatus } from "@/lib/usage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body?.email || "").trim().toLowerCase();
    const paymentMethodId = body?.paymentMethodId;
    const plan: PlanKey =
      body?.plan && PLANS[body.plan as PlanKey]
        ? (body.plan as PlanKey)
        : "monthly";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const selectedPlan = PLANS[plan];

    // 1. Find or create Stripe customer
    const existing = await stripe.customers.list({ email, limit: 1 });
    let customerId: string;

    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { source: "V6 Render In-Modal Trial" },
      });
      customerId = customer.id;
    }

    // 2. If paymentMethodId provided, attach to customer as default
    if (paymentMethodId) {
      try {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        });
      } catch (attachErr: any) {
        // May already be attached via SetupIntent confirmation
        console.log("Payment method attach note:", attachErr?.message);
      }

      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // 3. Check for existing trialing/active subscriptions
    const existingSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 5,
    });

    let subscriptionId = "";
    const activeSub = existingSubs.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    if (activeSub) {
      subscriptionId = activeSub.id;
    } else {
      // Create 14-day free trial subscription ($0 due today)
      const sub = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: selectedPlan.priceId }],
        default_payment_method: paymentMethodId || undefined,
        trial_period_days: 14,
        payment_behavior: "default_incomplete",
        metadata: {
          email,
          plan,
          source: "In-Modal Trial Card Setup",
        },
      });
      subscriptionId = sub.id;
    }

    // 4. Register trial user in local/Supabase store
    await registerTrialUser(email);
    await setUserStatus(email, "trial", "Stripe 14-Day Trial (Card Saved)");

    return NextResponse.json({
      success: true,
      subscriptionId,
      customerId,
      isTrial: true,
      trialDays: 14,
      message: "14-Day Free Trial activated with card securely saved on file.",
    });
  } catch (err: any) {
    console.error("Create Trial Subscription Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create trial subscription" },
      { status: 500 }
    );
  }
}
