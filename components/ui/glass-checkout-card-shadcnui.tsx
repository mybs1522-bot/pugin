"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
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
      color: "#ffffff",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      fontSmoothing: "antialiased",
      fontSize: "14px",
      "::placeholder": {
        color: "#71717a",
      },
      iconColor: "#ffffff",
    },
    invalid: {
      color: "#f87171",
      iconColor: "#f87171",
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
        "🎉 14-Day Free Trial Activated (2,000 Renders Included) & Plugin Downloaded!"
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
      <Card className="group relative overflow-hidden rounded-2xl border-zinc-800 bg-[#09090b] p-0 text-white shadow-2xl">
        <form onSubmit={handleFormSubmit} className="p-6 sm:p-7">
          <div className="mb-4 space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/90 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Native SketchUp Extension • 2,000 Renders
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Download Plugin Now
                </h3>
                <Image
                  src="/sketchup-logo.png"
                  alt="SketchUp Logo"
                  width={24}
                  height={24}
                  className="h-5 w-5 shrink-0 object-contain"
                />
              </div>
              <span className="shrink-0 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-[11px] font-bold text-white">
                $0.00 Due Today
              </span>
            </div>
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
                  ? "border-white bg-zinc-900 text-white shadow-lg ring-1 ring-white"
                  : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-white uppercase">
                  Monthly
                </span>
                <span className="text-sm font-black text-white">
                  $20
                  <span className="text-[10px] font-normal text-zinc-400">
                    /mo
                  </span>
                </span>
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-zinc-400">
                14 Days Free • 2,000 Renders
              </span>
            </button>

            {/* Yearly */}
            <button
              type="button"
              onClick={() => setSelectedPlan("yearly")}
              className={cn(
                "relative flex cursor-pointer flex-col justify-between rounded-xl border p-3 text-left transition-all",
                selectedPlan === "yearly"
                  ? "border-white bg-zinc-900 text-white shadow-lg ring-1 ring-white"
                  : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
              )}
            >
              <div className="absolute -top-2.5 right-2">
                <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black tracking-wider text-black uppercase shadow-sm">
                  25% OFF
                </span>
              </div>
              <div className="flex w-full items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-white uppercase">
                  Yearly
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] text-zinc-500 line-through">
                    $240
                  </span>
                  <span className="text-sm font-black text-white">
                    $180
                    <span className="text-[10px] font-normal text-zinc-400">
                      /yr
                    </span>
                  </span>
                </div>
              </div>
              <span className="mt-1.5 text-[11px] font-semibold text-zinc-300">
                $15/mo • 2,000 Renders/mo (Save $60/yr)
              </span>
            </button>
          </div>

          <div className="space-y-3">
            {/* Email Address */}
            <div className="space-y-1.5 text-left">
              <Label
                htmlFor="email"
                className="text-xs font-semibold tracking-wider text-zinc-300 uppercase"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="architect@studio.com"
                value={currentEmail}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 border-zinc-800 bg-zinc-900/90 text-sm text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white"
                required
              />
            </div>

            {/* Card Number */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="cardNumber"
                  className="text-xs font-semibold tracking-wider text-zinc-300 uppercase"
                >
                  Card Number
                </Label>
                <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <ShieldCheck className="h-3 w-3 text-zinc-300" /> SSL
                  Encrypted
                </span>
              </div>
              <div className="relative rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 pl-10 focus-within:border-white focus-within:ring-1 focus-within:ring-white">
                <CreditCard className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400" />
                <CardNumberElement options={ELEMENT_STYLE} />
              </div>
            </div>

            {/* Expiry Date & CVC */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="space-y-1.5">
                <Label
                  htmlFor="expiry"
                  className="text-xs font-semibold tracking-wider text-zinc-300 uppercase"
                >
                  Expiry Date
                </Label>
                <div className="relative rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 pl-10 focus-within:border-white focus-within:ring-1 focus-within:ring-white">
                  <Calendar className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400" />
                  <CardExpiryElement options={ELEMENT_STYLE} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="cvc"
                  className="text-xs font-semibold tracking-wider text-zinc-300 uppercase"
                >
                  CVC
                </Label>
                <div className="relative rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 pl-10 focus-within:border-white focus-within:ring-1 focus-within:ring-white">
                  <Lock className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400" />
                  <CardCvcElement options={ELEMENT_STYLE} />
                </div>
              </div>
            </div>
          </div>

          {currentError && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <span>{currentError}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !stripe}
            className="mt-4 h-11 w-full cursor-pointer gap-2 bg-white font-extrabold text-black shadow-xl transition-all hover:bg-zinc-200"
          >
            {isLoading ? (
              "Setting up trial..."
            ) : (
              <>
                <Download className="h-4 w-4 text-black" />
                Download Plugin
              </>
            )}
          </Button>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-zinc-400">
            <Lock className="h-3 w-3 text-zinc-300" />
            <span>
              $0.00 charged today. 14 days free trial with 2,000 Renders. Cancel
              anytime in 1 click.
            </span>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
