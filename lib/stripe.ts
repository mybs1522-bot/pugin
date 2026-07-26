import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-03-31.basil",
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    const s = getStripe();
    if (!s) return undefined;
    return (s as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLANS = {
  monthly: {
    label: "Monthly",
    price: "$20",
    period: "/month",
    priceId: process.env.STRIPE_PRICE_MONTHLY_ID || "",
    trialDays: 7,
  },
  yearly: {
    label: "Yearly",
    price: "$200",
    period: "/year",
    priceId: process.env.STRIPE_PRICE_YEARLY_ID || "",
    trialDays: 7,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
