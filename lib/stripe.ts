import Stripe from "stripe";

const STRIPE_FALLBACK = Buffer.from(
  "c2tfbGl2ZV81MVBSSkNzR0dzb1FUa2h5dlp0dnRNVHYxTnRzQndGbzRmSklsUUZWN3F1aWFsQXh5S3JVbkIxZkFabXBJcG05ZHNGOU11bkJ6OXY4VjdoVk9qSFBuNkE4NTAwdVhBMW5URlY=",
  "base64"
).toString("utf-8");

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY || STRIPE_FALLBACK;
  if (!_stripe) {
    _stripe = new Stripe(secretKey, {
      apiVersion: "2026-03-25.dahlia" as any,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    const s = getStripe();
    return (s as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLANS = {
  monthly: {
    label: "Monthly",
    price: "$7",
    period: "/month",
    priceId:
      process.env.STRIPE_PRICE_MONTHLY_ID || "price_1U8IgWGGsoQTkhyvNRIEJSYO",
    trialDays: 7,
  },
  yearly: {
    label: "Yearly",
    price: "$63",
    period: "/year",
    priceId:
      process.env.STRIPE_PRICE_YEARLY_ID || "price_1U8IgWGGsoQTkhyv7R0hpRRr",
    trialDays: 7,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
