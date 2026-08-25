import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { setUserPaidStatus, setUserStatus } from "@/lib/usage";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing webhook signature or secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(
      "[Webhook Error] Signature verification failed:",
      err?.message
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // 1. Recurring or Trial-End Invoice Payment Succeeded
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerEmail =
          invoice.customer_email ||
          (typeof invoice.customer === "string"
            ? (
                (await stripe.customers.retrieve(
                  invoice.customer
                )) as Stripe.Customer
              ).email
            : null);

        if (customerEmail) {
          console.log(
            `[Stripe Webhook] Payment succeeded for: ${customerEmail}`
          );
          await setUserPaidStatus(
            customerEmail,
            true,
            "Stripe Active Subscription"
          );
          await setUserStatus(
            customerEmail,
            "paid",
            "Stripe Subscription Paid"
          );
        }
        break;
      }

      // 2. Renewal Failed (Empty Card / Insufficient Funds / Expired Card)
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerEmail =
          invoice.customer_email ||
          (typeof invoice.customer === "string"
            ? (
                (await stripe.customers.retrieve(
                  invoice.customer
                )) as Stripe.Customer
              ).email
            : null);

        if (customerEmail) {
          console.warn(
            `[Stripe Webhook - Anti-Fraud] Payment failed (insufficient funds/declined) for: ${customerEmail}`
          );
          // Revoke access immediately to prevent free-riding on empty cards
          await setUserPaidStatus(
            customerEmail,
            false,
            "Payment Failed (Card Empty/Declined)"
          );
          await setUserStatus(
            customerEmail,
            "cancelled",
            "Payment Failed - Card Declined"
          );
        }
        break;
      }

      // 3. Subscription Deleted or Canceled
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerEmail =
          (sub.metadata && sub.metadata.email) ||
          (typeof sub.customer === "string"
            ? (
                (await stripe.customers.retrieve(
                  sub.customer
                )) as Stripe.Customer
              ).email
            : null);

        if (customerEmail) {
          console.log(
            `[Stripe Webhook] Subscription deleted for: ${customerEmail}`
          );
          await setUserPaidStatus(customerEmail, false, "Subscription Deleted");
          await setUserStatus(customerEmail, "cancelled", "Subscription Ended");
        }
        break;
      }

      // 4. Chargeback or Fraud Claim Initiated
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        console.error(
          `[Stripe Webhook - Fraud Dispute] Dispute ID: ${dispute.id}, Amount: ${dispute.amount}`
        );
        break;
      }

      default:
        break;
    }
  } catch (err: any) {
    console.error("[Stripe Webhook Handler Error]", err);
  }

  return NextResponse.json({ received: true });
}
