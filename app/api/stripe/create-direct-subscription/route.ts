import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";
import {
  setUserPaidStatus,
  setUserStatus,
  registerTrialUser,
} from "@/lib/usage";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const ipCheck = checkRateLimit(ip, 12, 10 * 60 * 1000);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many attempts. Please try again later.",
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

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Card payment method is required to activate Pro" },
        { status: 400 }
      );
    }

    // 1. Verify Card Details & Security Checks
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (!pm || !pm.card) {
      return NextResponse.json(
        { error: "Invalid card details. Please try again." },
        { status: 400 }
      );
    }

    if (pm.card.checks?.cvc_check === "fail") {
      return NextResponse.json(
        {
          error:
            "Card security code (CVC) verification failed. Please check the 3 or 4-digit code on your card.",
        },
        { status: 400 }
      );
    }

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
          source: "V6 Render Direct Pro Plugin Checkout",
          clientIp: ip,
        },
      });
      customerId = customer.id;
    }

    // 3. Attach payment method to customer
    try {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (attachErr: any) {
      console.log("Payment method attach notice:", attachErr?.message);
    }

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // 4. Create DIRECT Paid Subscription (NO TRIAL - Charged Today!)
    const sub = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: selectedPlan.priceId }],
      default_payment_method: paymentMethodId,
      payment_behavior: "error_if_incomplete",
      proration_behavior: "always_invoice",
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        email,
        plan,
        card_brand: pm.card.brand || "",
        card_last4: pm.card.last4 || "",
        client_ip: ip,
        source: "In-Plugin Direct Paid Pro Subscription (No Trial)",
      },
    });

    // Check for 3D Secure / SCA requirement
    const latestInvoice = sub.latest_invoice as any;
    const paymentIntent = latestInvoice?.payment_intent;

    if (paymentIntent && paymentIntent.status === "requires_action") {
      return NextResponse.json({
        success: true,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        subscriptionId: sub.id,
        customerId,
        plan,
      });
    }

    // Check payment status of latest invoice
    if (
      sub.status === "past_due" ||
      sub.status === "incomplete" ||
      sub.status === "unpaid"
    ) {
      await setUserPaidStatus(
        email,
        false,
        "Payment Failed (Card Declined/Insufficient Funds)"
      );
      return NextResponse.json(
        {
          error:
            "Card payment was declined by your bank. Please try another card.",
          status: sub.status,
        },
        { status: 402 }
      );
    }

    // 5. Update local user records to Paid Pro
    await registerTrialUser(email);
    await setUserPaidStatus(email, true, "Stripe Pro (" + plan + ")");
    await setUserStatus(email, "paid", "Stripe Active Subscription");

    return NextResponse.json({
      success: true,
      isPaid: true,
      subscriptionId: sub.id,
      customerId,
      status: sub.status,
      plan,
      amountPaid: selectedPlan.price,
      message:
        "🎉 V6 Render Pro (" +
        selectedPlan.label +
        ") activated successfully! Unlimited 4K renders and 3D video walkthroughs unlocked.",
    });
  } catch (err: any) {
    console.error("Direct Subscription Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process card payment" },
      { status: 500 }
    );
  }
}
