import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { setUserPaidStatus, setUserStatus } from "@/lib/usage";
import { sendWelcomeDownloadEmail } from "@/lib/emails";

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
      // 1. Checkout Session Completed (New Trial or Direct Subscription Started)
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail =
          session.customer_details?.email ||
          session.customer_email ||
          (session.metadata && session.metadata.email) ||
          null;

        if (customerEmail) {
          console.log(
            `[Stripe Webhook] Checkout completed for: ${customerEmail}`
          );
          await setUserPaidStatus(
            customerEmail,
            true,
            "Stripe Trial / Pro Started"
          );
          await setUserStatus(customerEmail, "paid", "Stripe Trial Started");

          // Send Welcome Email with Download Link & 3-Step SketchUp Install Guide
          const plan = (session.metadata && session.metadata.plan) || "Monthly";
          sendWelcomeDownloadEmail(customerEmail, plan).catch((err) =>
            console.warn("[Stripe Webhook] Welcome email error:", err)
          );
        }
        break;
      }

      // 2. Recurring or Trial-End Invoice Payment Succeeded
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

      // 3. Renewal Failed (Empty Card / Insufficient Funds / Expired Card)
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

      // 4. Subscription Deleted or Canceled
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

      // 5. Chargeback or Fraud Claim Initiated
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
