import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { setUserPaidStatus, setUserStatus } from "@/lib/usage";
import { sendWelcomeDownloadEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error(
      "[Stripe Webhook] Missing stripe-signature header or STRIPE_WEBHOOK_SECRET env variable"
    );
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
      "[Stripe Webhook Error] Signature verification failed:",
      err?.message
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(
    `[Stripe Webhook] Received verified event: ${event.type} (ID: ${event.id})`
  );

  try {
    switch (event.type) {
      // 1. Checkout Session Completed (Customer completed hosted checkout for trial or pro)
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = (
          session.customer_details?.email ||
          session.customer_email ||
          (session.metadata && session.metadata.email) ||
          ""
        )
          .trim()
          .toLowerCase();

        if (customerEmail && customerEmail.includes("@")) {
          const plan = (session.metadata && session.metadata.plan) || "monthly";
          const modeLabel = `Stripe 14-Day Free Trial (${plan})`;

          console.log(
            `[Stripe Webhook] New checkout for: ${customerEmail}, plan: ${plan}`
          );
          await setUserPaidStatus(customerEmail, true, modeLabel);
          await setUserStatus(customerEmail, "paid", modeLabel);

          // Dispatch Welcome Email with plugin download link
          sendWelcomeDownloadEmail(customerEmail, plan).catch((err) =>
            console.warn(
              "[Stripe Webhook] Welcome email dispatch warning:",
              err
            )
          );
        }
        break;
      }

      // 2. Subscription Created or Updated (Trial status or recurring changes)
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerEmail = (
          (sub.metadata && sub.metadata.email) ||
          (typeof sub.customer === "string"
            ? (
                (await stripe.customers.retrieve(
                  sub.customer
                )) as Stripe.Customer
              ).email
            : null) ||
          ""
        )
          .trim()
          .toLowerCase();

        if (customerEmail && customerEmail.includes("@")) {
          const isTrialing = sub.status === "trialing";
          const isActive = sub.status === "active" || isTrialing;
          const statusMode = isTrialing
            ? "Stripe 14-Day Free Trial"
            : "Stripe Pro Subscription";

          console.log(
            `[Stripe Webhook] Subscription ${event.type}: ${customerEmail}, status: ${sub.status}`
          );
          await setUserPaidStatus(customerEmail, isActive, statusMode);
          await setUserStatus(
            customerEmail,
            isActive ? "paid" : "cancelled",
            statusMode
          );
        }
        break;
      }

      // 3. Invoice Payment Succeeded (Initial $0.00 trial invoice or recurring renewal)
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerEmail = (
          invoice.customer_email ||
          (typeof invoice.customer === "string"
            ? (
                (await stripe.customers.retrieve(
                  invoice.customer
                )) as Stripe.Customer
              ).email
            : null) ||
          ""
        )
          .trim()
          .toLowerCase();

        if (customerEmail && customerEmail.includes("@")) {
          console.log(
            `[Stripe Webhook] Invoice payment succeeded for: ${customerEmail}`
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

      // 4. Invoice Payment Failed (Card empty / declined / expired)
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerEmail = (
          invoice.customer_email ||
          (typeof invoice.customer === "string"
            ? (
                (await stripe.customers.retrieve(
                  invoice.customer
                )) as Stripe.Customer
              ).email
            : null) ||
          ""
        )
          .trim()
          .toLowerCase();

        if (customerEmail && customerEmail.includes("@")) {
          console.warn(
            `[Stripe Webhook] Invoice payment failed for: ${customerEmail}`
          );
          await setUserPaidStatus(
            customerEmail,
            false,
            "Payment Failed (Card Declined)"
          );
          await setUserStatus(
            customerEmail,
            "cancelled",
            "Payment Failed - Card Declined"
          );
        }
        break;
      }

      // 5. Subscription Deleted or Canceled
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerEmail = (
          (sub.metadata && sub.metadata.email) ||
          (typeof sub.customer === "string"
            ? (
                (await stripe.customers.retrieve(
                  sub.customer
                )) as Stripe.Customer
              ).email
            : null) ||
          ""
        )
          .trim()
          .toLowerCase();

        if (customerEmail && customerEmail.includes("@")) {
          console.log(
            `[Stripe Webhook] Subscription canceled/deleted for: ${customerEmail}`
          );
          await setUserPaidStatus(customerEmail, false, "Subscription Deleted");
          await setUserStatus(customerEmail, "cancelled", "Subscription Ended");
        }
        break;
      }

      // 6. Charge Dispute / Fraud Created
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        console.error(
          `[Stripe Webhook - Fraud Alert] Dispute ID: ${dispute.id}, Amount: ${dispute.amount}`
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
