"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Calendar,
  CreditCard,
  Lock,
  ShieldCheck,
  Download,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const ELEMENT_STYLE = {
  style: {
    base: {
      color: "var(--foreground, #ffffff)",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      fontSmoothing: "antialiased",
      fontSize: "14px",
      "::placeholder": {
        color: "var(--muted-foreground, #71717a)",
      },
      iconColor: "#10b981",
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
};

interface GlassCheckoutCardProps {
  amount?: number;
  className?: string;
  selectedPlan?: "monthly" | "yearly";
  onPlanChange?: (plan: "monthly" | "yearly") => void;
  email?: string;
  onEmailChange?: (email: string) => void;
  onSubmitTrial?: (email: string) => Promise<void>;
  loading?: boolean;
  errorMessage?: string | null;
}

export function GlassCheckoutCard({
  amount = 20,
  className,
  selectedPlan: propPlan,
  onPlanChange,
  email: propEmail,
  onEmailChange,
  onSubmitTrial,
  loading: propLoading,
  errorMessage: propError,
}: GlassCheckoutCardProps) {
  const [localPlan, setLocalPlan] = useState<"monthly" | "yearly">("monthly");
  const [localEmail, setLocalEmail] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const stripe = useStripe();
  const elements = useElements();

  const selectedPlan = propPlan !== undefined ? propPlan : localPlan;
  const setSelectedPlan = onPlanChange || setLocalPlan;
  const currentEmail = propEmail !== undefined ? propEmail : localEmail;
  const setEmail = onEmailChange || setLocalEmail;
  const isLoading = propLoading !== undefined ? propLoading : localLoading;
  const currentError = propError !== undefined ? propError : localError;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const normEmail = currentEmail.trim().toLowerCase();
    if (!normEmail || !normEmail.includes("@")) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    if (onSubmitTrial) {
      await onSubmitTrial(normEmail);
      return;
    }

    if (!stripe || !elements) {
      setLocalError("Stripe gateway is initializing. Please wait a second.");
      return;
    }

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      setLocalError("Please enter your card number.");
      return;
    }

    setLocalLoading(true);
    try {
      // 1. Get SetupIntent
      const setupRes = await fetch("/api/stripe/setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normEmail }),
      });
      const setupData = await setupRes.json();
      if (!setupRes.ok || !setupData.clientSecret) {
        throw new Error(setupData.error || "Failed to initialize card setup.");
      }

      // 2. Confirm card setup with Stripe ($0 charged today, cardholder name bypassed)
      const confirmResult = await stripe.confirmCardSetup(
        setupData.clientSecret,
        {
          payment_method: {
            card: cardNumber,
            billing_details: {
              email: normEmail,
            },
          },
        }
      );

      if (confirmResult.error) {
        throw new Error(
          confirmResult.error.message || "Card verification failed."
        );
      }

      const pmId = confirmResult.setupIntent.payment_method;

      // 3. Create 14-day trial subscription in Stripe
      const subRes = await fetch("/api/stripe/create-trial-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normEmail,
          paymentMethodId: typeof pmId === "string" ? pmId : pmId?.id,
          plan: selectedPlan,
        }),
      });

      const subData = await subRes.json();
      if (!subRes.ok || subData.error) {
        throw new Error(
          subData.error || "Failed to establish trial subscription."
        );
      }

      // 4. Download .rbz
      const downloadLink = document.createElement("a");
      downloadLink.href = "/v6_render.rbz";
      downloadLink.download = "v6_render.rbz";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      alert(
        "🎉 14-Day Free Trial Activated & Plugin Downloaded! Your card has been safely saved with $0 charged today."
      );
    } catch (err: any) {
      console.error("GlassCheckoutCard submission error:", err);
      setLocalError(
        err.message || "Something went wrong while verifying card."
      );
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("mx-auto w-full max-w-[480px]", className)}
    >
      <Card className="group border-border/60 bg-card/60 relative overflow-hidden rounded-2xl p-0 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10">
        <form onSubmit={handleFormSubmit} className="p-6 sm:p-7">
          <div className="mb-4">
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Native SketchUp Extension • Unlimited 4K Renders
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-xl font-bold tracking-tight">
                Download Plugin Now
              </h3>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                $0.00 Due Today
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              14 days free trial. Unrestricted access to unlimited 4K renders &
              3D video walkthroughs.
            </p>
          </div>

          {/* Side-by-Side Plan Selector */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            {/* Monthly */}
            <button
              type="button"
              onClick={() => setSelectedPlan("monthly")}
              className={cn(
                "relative flex cursor-pointer flex-col justify-between rounded-xl border p-3 text-left transition-all",
                selectedPlan === "monthly"
                  ? "border-emerald-500 bg-emerald-500/5 shadow-sm ring-2 ring-emerald-500/30 dark:bg-emerald-500/10"
                  : "border-border/60 bg-background/50 hover:bg-background/80 opacity-80 hover:opacity-100"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-foreground text-xs font-bold tracking-wider uppercase">
                  Monthly
                </span>
                <span className="text-foreground text-sm font-black">
                  $20
                  <span className="text-muted-foreground text-[10px] font-normal">
                    /mo
                  </span>
                </span>
              </div>
              <span className="text-muted-foreground mt-1.5 text-[11px] font-medium">
                14 Days Free • Then $20/mo
              </span>
            </button>

            {/* Yearly */}
            <button
              type="button"
              onClick={() => setSelectedPlan("yearly")}
              className={cn(
                "relative flex cursor-pointer flex-col justify-between rounded-xl border p-3 text-left transition-all",
                selectedPlan === "yearly"
                  ? "border-emerald-500 bg-emerald-500/5 shadow-sm ring-2 ring-emerald-500/30 dark:bg-emerald-500/10"
                  : "border-border/60 bg-background/50 hover:bg-background/80 opacity-80 hover:opacity-100"
              )}
            >
              <div className="absolute -top-2.5 right-2">
                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black tracking-wider text-black uppercase shadow-sm">
                  25% OFF
                </span>
              </div>
              <div className="flex w-full items-center justify-between">
                <span className="text-foreground text-xs font-bold tracking-wider uppercase">
                  Yearly
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-muted-foreground text-[10px] line-through">
                    $240
                  </span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    $180
                    <span className="text-muted-foreground text-[10px] font-normal">
                      /yr
                    </span>
                  </span>
                </div>
              </div>
              <span className="mt-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                $15/mo • Save $60/yr
              </span>
            </button>
          </div>

          <div className="space-y-3">
            {/* Email Address */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-foreground text-xs font-semibold tracking-wider uppercase"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="architect@studio.com"
                value={currentEmail}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border/60 bg-background/60 focus:bg-background/90 h-10 text-sm backdrop-blur-sm focus:border-emerald-500"
                required
              />
            </div>

            {/* Card Number */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="cardNumber"
                  className="text-foreground text-xs font-semibold tracking-wider uppercase"
                >
                  Card Number
                </Label>
                <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" /> SSL
                  Encrypted
                </span>
              </div>
              <div className="border-border/60 bg-background/60 relative rounded-lg border p-2.5 pl-10 backdrop-blur-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                <CreditCard className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <CardNumberElement options={ELEMENT_STYLE} />
              </div>
            </div>

            {/* Expiry Date & CVC */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="expiry"
                  className="text-foreground text-xs font-semibold tracking-wider uppercase"
                >
                  Expiry Date
                </Label>
                <div className="border-border/60 bg-background/60 relative rounded-lg border p-2.5 pl-10 backdrop-blur-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                  <Calendar className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                  <CardExpiryElement options={ELEMENT_STYLE} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="cvc"
                  className="text-foreground text-xs font-semibold tracking-wider uppercase"
                >
                  CVC
                </Label>
                <div className="border-border/60 bg-background/60 relative rounded-lg border p-2.5 pl-10 backdrop-blur-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                  <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                  <CardCvcElement options={ELEMENT_STYLE} />
                </div>
              </div>
            </div>
          </div>

          {currentError && (
            <div className="bg-destructive/10 border-destructive/20 text-destructive mt-3 flex items-start gap-2 rounded-xl border p-3 text-xs">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{currentError}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !stripe}
            className="mt-4 h-11 w-full gap-2 bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
          >
            {isLoading ? (
              "Setting up trial..."
            ) : (
              <>
                <Download className="h-4 w-4" />
                Start 14-Day Free Trial & Download (.rbz)
              </>
            )}
          </Button>

          <div className="text-muted-foreground mt-3 flex items-center justify-center gap-1.5 text-center text-xs">
            <Lock className="h-3 w-3 text-emerald-500" />
            <span>
              $0.00 charged today. 14 days free trial. Cancel anytime in 1
              click.
            </span>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
