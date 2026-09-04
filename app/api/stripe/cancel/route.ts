import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  let email = "";
  let action = "cancel";

  try {
    const body = await req.json().catch(() => ({}));
    if (body?.email) email = String(body.email).trim().toLowerCase();
    if (body?.action) action = String(body.action);
  } catch {
    // ignore
  }

  if (!email) {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      email = session.user.email.trim().toLowerCase();
    }
  }

  if (!email) {
    return NextResponse.json(
      { error: "Email or sign-in required" },
      { status: 401 }
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: "No customer found for this account" },
        { status: 404 }
      );
    }

    const subs = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "all",
      limit: 5,
    });

    const active = subs.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );
    if (!active) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    if (action === "pause") {
      const updated = await stripe.subscriptions.update(active.id, {
        metadata: {
          paused_until: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      });
      return NextResponse.json({
        success: true,
        paused: true,
        message: "Subscription paused for 30 days",
      });
    } else if (action === "discount") {
      const updated = await stripe.subscriptions.update(active.id, {
        metadata: {
          retention_discount: "50_percent_3_months",
          claimed_at: new Date().toISOString(),
        },
      });
      return NextResponse.json({
        success: true,
        discounted: true,
        message: "50% retention discount activated",
      });
    } else {
      const updated = await stripe.subscriptions.update(active.id, {
        cancel_at_period_end: true,
      });
      return NextResponse.json({
        success: true,
        cancelAtPeriodEnd: updated.cancel_at_period_end,
        currentPeriodEnd:
          (updated as unknown as Record<string, unknown>)[
            "current_period_end"
          ] ?? null,
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
