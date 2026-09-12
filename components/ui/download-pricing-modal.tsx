"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { getStripeClient } from "@/lib/stripe-client";
import {
  Rocket,
  Lock,
  AlertCircle,
  Check,
  ShieldCheck,
  Download,
  CreditCard,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { event as fbEvent } from "@/lib/fpixel";

interface DownloadPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform?: "windows" | "mac";
  windowsHref?: string;
  macHref?: string;
  defaultEmail?: string;
  hideEmail?: boolean;
  mode?: "download" | "activate_pro";
  onProActivated?: (email: string) => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#ffffff",
      fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "14px",
      "::placeholder": {
        color: "#71717a",
      },
      iconColor: "#ffffff",
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
  hidePostalCode: false,
};

function CheckoutForm({
  defaultEmail = "",
  mode = "download",
  onSuccess,
}: {
  defaultEmail?: string;
  mode?: "download" | "activate_pro";
  onSuccess: (email: string, plan: "monthly" | "yearly") => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const normEmail = email.trim().toLowerCase();
    if (!normEmail || !normEmail.includes("@") || !normEmail.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!stripe || !elements) {
      setErrorMessage(
        "Payment gateway is initializing. Please try again in a moment."
      );
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage("Please enter your card details.");
      return;
    }

    setLoading(true);

    try {
      // 1. Track checkout initiation in Meta Pixel
      fbEvent("InitiateCheckout", {
        value: selectedPlan === "yearly" ? 180 : 20,
        currency: "USD",
        content_name: `V6 Render ${selectedPlan} trial`,
        content_category: "subscription",
      });

      // 2. Obtain SetupIntent client secret
      const setupRes = await fetch("/api/stripe/setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normEmail }),
      });

      const setupData = await setupRes.json();
      if (!setupRes.ok || !setupData.clientSecret) {
        throw new Error(
          setupData.error || "Failed to initialize card verification."
        );
      }

      // 3. Confirm card with Stripe ($0 charged today, 3D Secure verified automatically)
      const confirmResult = await stripe.confirmCardSetup(
        setupData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: normEmail,
            },
          },
        }
      );

      if (confirmResult.error) {
        throw new Error(
          confirmResult.error.message ||
            "Card verification failed. Please check your card numbers."
        );
      }

      const pmId = confirmResult.setupIntent.payment_method;
      const paymentMethodId = typeof pmId === "string" ? pmId : pmId?.id;

      if (!paymentMethodId) {
        throw new Error(
          "Could not retrieve card payment method. Please retry."
        );
      }

      // 4. Create 14-day free trial subscription
      const subRes = await fetch("/api/stripe/create-trial-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normEmail,
          paymentMethodId,
          plan: selectedPlan,
        }),
      });

      const subData = await subRes.json();
      if (!subRes.ok || subData.error) {
        throw new Error(subData.error || "Failed to activate 14-day trial.");
      }

      // 5. Store trial state in local storage
      try {
        localStorage.setItem("v6_is_paid", "true");
        localStorage.setItem("v6_plan_status", "paid");
        localStorage.setItem("v6_user_email", normEmail);
        localStorage.setItem("v6_pending_plan", selectedPlan);
      } catch {}

      // 6. Fire StartTrial Meta Pixel event
      fbEvent("StartTrial", {
        value: 0,
        currency: "USD",
        predicted_ltv: selectedPlan === "yearly" ? 180 : 20,
      });

      onSuccess(normEmail, selectedPlan);
    } catch (err: any) {
      console.error("Trial setup error:", err);
      setErrorMessage(
        err.message ||
          "Failed to start free trial. Please verify card details and try again."
      );
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3.5 p-5 text-white sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xl font-black tracking-tight text-white sm:text-2xl">
            {mode === "activate_pro" ? "Activate Pro Plan" : "Start Free Trial"}
          </h3>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            <Image
              src="/sketchup-logo.png"
              alt="SketchUp Logo"
              width={32}
              height={32}
              className="h-7 w-7 object-contain"
              priority
            />
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
          $0.00 Due Today
        </span>
      </div>

      {/* Plan Selector */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Monthly Card */}
        <button
          type="button"
          onClick={() => setSelectedPlan("monthly")}
          className={cn(
            "relative flex cursor-pointer flex-col justify-between rounded-xl border p-3 text-left transition-colors",
            selectedPlan === "monthly"
              ? "border-white bg-zinc-900 text-white ring-1 ring-white"
              : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
          )}
        >
          <div className="flex w-full items-center justify-between gap-1">
            <span className="text-[11px] font-bold tracking-wider text-white uppercase">
              Monthly
            </span>
            <span className="text-sm font-black text-white">
              $20
              <span className="text-[10px] font-normal text-zinc-400">/mo</span>
            </span>
          </div>
          <span className="mt-1 text-[11px] font-medium text-emerald-400">
            14 Days Free
          </span>
        </button>

        {/* Yearly Card */}
        <button
          type="button"
          onClick={() => setSelectedPlan("yearly")}
          className={cn(
            "relative flex cursor-pointer flex-col justify-between rounded-xl border p-3 text-left transition-colors",
            selectedPlan === "yearly"
              ? "border-white bg-zinc-900 text-white ring-1 ring-white"
              : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
          )}
        >
          <div className="absolute -top-2.5 right-2">
            <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black text-black uppercase">
              Save 25%
            </span>
          </div>
          <div className="flex w-full items-center justify-between gap-1">
            <span className="text-[11px] font-bold tracking-wider text-white uppercase">
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
          <span className="mt-1 text-[11px] font-medium text-emerald-400">
            14 Days Free
          </span>
        </button>
      </div>

      {/* Email Input */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
          Your Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="you@company.com"
          required
          disabled={loading}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 focus:outline-none disabled:opacity-50"
        />
      </div>

      {/* On-Page Card Details */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
            <CreditCard className="h-3.5 w-3.5 text-zinc-300" />
            Card Information
          </label>
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            $0.00 Today
          </span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 shadow-inner focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-500">
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={(e) => {
              setCardComplete(e.complete);
              if (errorMessage) setErrorMessage(null);
            }}
          />
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Primary CTA Button */}
      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="h-12 w-full cursor-pointer gap-2 bg-white text-sm font-extrabold text-black shadow-lg transition-all hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            <span>Activating 14-Day Free Trial...</span>
          </span>
        ) : (
          <>
            <Rocket className="h-4 w-4 text-black" strokeWidth={2.5} />
            <span>Start 14-Day Free Trial</span>
          </>
        )}
      </Button>

      {/* Trust & Guarantee Footer */}
      <div className="flex flex-col items-center justify-center gap-1 pt-0.5 text-center">
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1 text-zinc-400">
            <Lock className="h-3 w-3" /> 256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span>Cancel anytime with 1 click</span>
        </div>
        <p className="text-[10px] text-zinc-500">
          No charge until day 14. You will receive an email reminder before your
          trial ends.
        </p>
      </div>
    </form>
  );
}

function SuccessView({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const downloadPlugin = () => {
    const a = document.createElement("a");
    a.href = "/v6_render.rbz";
    a.download = "v6_render.rbz";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 text-center text-white sm:p-7">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-black tracking-tight text-white">
          14-Day Free Trial Activated!
        </h3>
        <p className="text-xs text-zinc-400">
          Unlimited 4K photorealistic renders unlocked for{" "}
          <span className="font-semibold text-white">{email}</span>.
        </p>
      </div>

      {/* Primary Download Button */}
      <div className="w-full space-y-2 pt-1">
        <Button
          onClick={downloadPlugin}
          className="h-12 w-full gap-2 rounded-xl bg-white text-sm font-extrabold text-black shadow-lg transition-all hover:bg-zinc-200"
        >
          <Download className="h-4 w-4 text-black" strokeWidth={2.5} />
          <span>Download v6_render.rbz</span>
        </Button>
        <p className="text-[11px] text-zinc-400">
          Browser should download automatically · macOS & Windows Universal
        </p>
      </div>

      {/* 3-Step Installation Guide */}
      <div className="w-full space-y-2.5 rounded-xl border border-zinc-800/90 bg-zinc-900/40 p-3.5 text-left">
        <p className="text-[11px] font-bold tracking-wider text-zinc-300 uppercase">
          Quick 3-Step Setup in SketchUp:
        </p>
        <div className="space-y-2 text-xs text-zinc-400">
          <div className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-white">
              1
            </span>
            <span>
              Open SketchUp → Go to{" "}
              <strong className="text-zinc-200">Extensions</strong> →{" "}
              <strong className="text-zinc-200">Extension Manager</strong>.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-white">
              2
            </span>
            <span>
              Click <strong className="text-zinc-200">Install Extension</strong>{" "}
              and select the downloaded{" "}
              <strong className="text-zinc-200">v6_render.rbz</strong>.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-white">
              3
            </span>
            <span>
              Enter your email (
              <strong className="text-zinc-200">{email}</strong>) in the plugin
              window to start rendering!
            </span>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        onClick={onClose}
        className="w-full text-xs text-zinc-400 hover:text-white"
      >
        Close window
      </Button>
    </div>
  );
}

export function DownloadPricingModal({
  open,
  onOpenChange,
  defaultEmail = "",
  mode = "download",
}: DownloadPricingModalProps) {
  const [successData, setSuccessData] = useState<{
    email: string;
    plan: "monthly" | "yearly";
  } | null>(null);

  const handleSuccess = (email: string, plan: "monthly" | "yearly") => {
    setSuccessData({ email, plan });

    // Auto-trigger the download
    try {
      const a = document.createElement("a");
      a.href = "/v6_render.rbz";
      a.download = "v6_render.rbz";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {}
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset success view on close
    setTimeout(() => {
      setSuccessData(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[460px] overflow-hidden rounded-2xl border-zinc-800/80 bg-[#09090b] p-0 text-white shadow-2xl focus:outline-none">
        <DialogTitle className="sr-only">Start Free Trial</DialogTitle>
        {successData ? (
          <SuccessView email={successData.email} onClose={handleClose} />
        ) : (
          <Elements stripe={getStripeClient()}>
            <CheckoutForm
              defaultEmail={defaultEmail}
              mode={mode}
              onSuccess={handleSuccess}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
