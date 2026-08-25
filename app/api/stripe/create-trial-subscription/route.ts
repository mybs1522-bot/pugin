import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";
import { registerTrialUser, setUserStatus } from "@/lib/usage";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const ipCheck = checkRateLimit(ip, 10, 10 * 60 * 1000);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many attempts from this IP. Please try again in ${Math.ceil(
            ipCheck.retryAfterSeconds / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

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

    const emailCheck = checkRateLimit(email, 5, 10 * 60 * 1000);
    if (!emailCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many attempts for this email. Please try again in ${Math.ceil(
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

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Card payment method is required to start free trial" },
        { status: 400 }
      );
    }

    // 1. Anti-Fraud Layer: Inspect Payment Method for Fake/Burner/Prepaid/Empty Cards
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (!pm || !pm.card) {
      return NextResponse.json(
        { error: "Invalid card details. Please try again." },
        { status: 400 }
      );
    }

    // Check A: CVC Security Code Verification
    if (pm.card.checks?.cvc_check === "fail") {
      return NextResponse.json(
        {
          error:
            "Card security code (CVC) verification failed. Please check the 3 or 4-digit code on your card.",
        },
        { status: 400 }
      );
    }

    // Check B: Reject Disposable / Prepaid Burner Cards ($0 empty cards)
    if (pm.card.funding === "prepaid") {
      return NextResponse.json(
        {
          error:
            "Prepaid and gift cards are not accepted for the free trial. Please use a valid credit or debit card.",
        },
        { status: 400 }
      );
    }

    // Check C: Expiry Validation
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (
      pm.card.exp_year < currentYear ||
      (pm.card.exp_year === currentYear && pm.card.exp_month < currentMonth)
    ) {
      return NextResponse.json(
        { error: "Your card has expired. Please use an active card." },
        { status: 400 }
      );
    }

    const selectedPlan = PLANS[plan];

    // 2. Find or create Stripe customer
    const existing = await stripe.customers.list({ email, limit: 1 });
    let customerId: string;

    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          source: "V6 Render In-Modal Trial",
          clientIp: ip,
        },
      });
      customerId = customer.id;
    }

    // 3. Attach payment method to customer as default payment method
    try {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (attachErr: any) {
      // May already be attached via SetupIntent
      console.log("Payment method attach notice:", attachErr?.message);
    }

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // 4. Check for existing trialing/active subscriptions
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
      // 5. Create 14-day free trial subscription with automated anti-fraud settings
      const sub = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: selectedPlan.priceId }],
        default_payment_method: paymentMethodId,
        trial_period_days: 14,
        trial_settings: {
          end_behavior: {
            missing_payment_method: "cancel",
          },
        },
        payment_settings: {
          payment_method_types: ["card"],
          save_default_payment_method: "on_subscription",
        },
        payment_behavior: "default_incomplete",
        metadata: {
          email,
          plan,
          card_brand: pm.card.brand || "",
          card_last4: pm.card.last4 || "",
          card_fingerprint: pm.card.fingerprint || "",
          client_ip: ip,
          source: "In-Modal Anti-Fraud Trial Setup",
        },
      });
      subscriptionId = sub.id;
    }

    // 6. Register trial user in local store
    await registerTrialUser(email);
    await setUserStatus(email, "trial", "Stripe 14-Day Trial (Card Saved)");

    return NextResponse.json({
      success: true,
      subscriptionId,
      customerId,
      isTrial: true,
      trialDays: 14,
      message:
        "14-Day Free Trial activated with card securely verified on file.",
    });
  } catch (err: any) {
    console.error("Create Trial Subscription Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create trial subscription" },
      { status: 500 }
    );
  }
}
