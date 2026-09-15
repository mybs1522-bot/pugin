"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { getStripeClient } from "@/lib/stripe-client";
import {
  Rocket,
  Lock,
  AlertCircle,
  Download,
  CreditCard,
  CheckCircle2,
  Clock,
  Ticket,
  Mail,
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
      color: "#09090b",
      fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "14px",
      "::placeholder": {
        color: "#a1a1aa",
      },
      iconColor: "#09090b",
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
  showIcon: true,
};

function useEvergreenCountdown() {
  // 2 Days 2 Hours 37 Mins default duration (ms)
  const DURATION_MS = 2 * 86400000 + 2 * 3600000 + 37 * 60000;

  const [remaining, setRemaining] = useState<number>(DURATION_MS);

  useEffect(() => {
    const key = "v6_evergreen_offer_end";
    let endTime: number;
    try {
      const stored = localStorage.getItem(key);
      const now = Date.now();
      if (stored && Number(stored) > now) {
        endTime = Number(stored);
      } else {
        endTime = now + DURATION_MS;
        localStorage.setItem(key, String(endTime));
      }
    } catch {
      endTime = Date.now() + DURATION_MS;
    }

    const update = () => {
      const diff = Math.max(0, endTime - Date.now());
      setRemaining(diff);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [DURATION_MS]);

  const totalSecs = Math.floor(remaining / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };
}

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
  const timer = useEvergreenCountdown();

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

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setErrorMessage("Please enter your card details.");
      return;
    }

    setLoading(true);

    try {
      // 1. Track checkout initiation in Meta Pixel
      fbEvent("InitiateCheckout", {
        value: selectedPlan === "yearly" ? 63 : 7,
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
            card: cardNumberElement,
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

      // 4. Create 7-day free trial subscription
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
        throw new Error(subData.error || "Failed to activate 7-day trial.");
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
        predicted_ltv: selectedPlan === "yearly" ? 63 : 7,
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
      className="flex flex-col gap-3 p-5 text-zinc-900 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xl font-black tracking-tight text-zinc-950 sm:text-2xl">
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
      </div>

      {/* Plan Selector */}
      <div className="grid grid-cols-2 gap-2.5 pt-0.5">
        {/* Monthly Card */}
        <button
          type="button"
          onClick={() => setSelectedPlan("monthly")}
          className={cn(
            "relative flex cursor-pointer flex-col justify-between rounded-xl border p-3 text-left transition-all",
            selectedPlan === "monthly"
              ? "border-zinc-950 bg-zinc-100/90 text-zinc-950 shadow-sm ring-2 ring-zinc-950"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
          )}
        >
          <div className="absolute -top-2.5 right-2">
            <span className="rounded-full bg-zinc-950 px-2 py-0.5 text-[9px] font-black text-white uppercase shadow-sm">
              Save 50%
            </span>
          </div>
          <div className="flex w-full items-center justify-between gap-1">
            <span className="text-[11px] font-bold tracking-wider text-zinc-950 uppercase">
              Monthly
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] text-zinc-400 line-through">
                $14
              </span>
              <span className="text-sm font-black text-zinc-950">
                $7
                <span className="text-[10px] font-normal text-zinc-500">
                  /mo
                </span>
              </span>
            </div>
          </div>
          <span className="mt-1 text-[11px] font-semibold text-emerald-600">
            7 Days Free
          </span>
        </button>

        {/* Yearly Card */}
        <button
          type="button"
          onClick={() => setSelectedPlan("yearly")}
          className={cn(
            "relative flex cursor-pointer flex-col justify-between rounded-xl border p-3 text-left transition-all",
            selectedPlan === "yearly"
              ? "border-zinc-950 bg-zinc-100/90 text-zinc-950 shadow-sm ring-2 ring-zinc-950"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
          )}
        >
          <div className="absolute -top-2.5 right-2">
            <span className="rounded-full bg-zinc-950 px-2 py-0.5 text-[9px] font-black text-white uppercase shadow-sm">
              Save 50%
            </span>
          </div>
          <div className="flex w-full items-center justify-between gap-1">
            <span className="text-[11px] font-bold tracking-wider text-zinc-950 uppercase">
              Yearly
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] text-zinc-400 line-through">
                $11
              </span>
              <span className="text-sm font-black text-zinc-950">
                $5.25
                <span className="text-[10px] font-normal text-zinc-500">
                  /mo
                </span>
              </span>
            </div>
          </div>
          <span className="mt-1 text-[11px] font-semibold text-emerald-600">
            7 Days Free
          </span>
        </button>
      </div>

      {/* Email Input */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-zinc-700 uppercase">
            <Mail className="h-3.5 w-3.5 text-zinc-500" />
            Account Email
          </label>
          <span className="text-[10px] font-medium text-zinc-400">
            License sent here
          </span>
        </div>
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
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-2.5 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white focus:ring-1 focus:ring-zinc-950 focus:outline-none disabled:opacity-50"
        />
      </div>

      {/* Professional Bifurcation Divider */}
      <div className="relative my-0.5 flex items-center justify-center py-1">
        <div className="w-full border-t border-zinc-200" />
        <span className="absolute bg-white px-2.5 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
          Payment Details
        </span>
      </div>

      {/* On-Page Card Details (2 Lines) */}
      <div className="space-y-2">
        {/* Line 1: Card Number */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-zinc-700 uppercase">
              <CreditCard className="h-3.5 w-3.5 text-zinc-500" />
              Card Information
            </label>
            <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400">
              <Lock className="h-3 w-3 text-zinc-400" />
              Encrypted
            </span>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 px-3 shadow-xs transition-colors focus-within:border-zinc-950 focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-950">
            <CardNumberElement
              options={CARD_ELEMENT_OPTIONS}
              onChange={(e) => {
                setCardComplete(e.complete);
                if (errorMessage) setErrorMessage(null);
              }}
            />
          </div>
        </div>

        {/* Line 2: Expiration Date & CVC */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold tracking-wider text-zinc-600 uppercase">
              Expires (MM/YY)
            </label>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 px-3 shadow-xs transition-colors focus-within:border-zinc-950 focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-950">
              <CardExpiryElement
                options={CARD_ELEMENT_OPTIONS}
                onChange={() => {
                  if (errorMessage) setErrorMessage(null);
                }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold tracking-wider text-zinc-600 uppercase">
              CVC / CVV
            </label>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5 px-3 shadow-xs transition-colors focus-within:border-zinc-950 focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-950">
              <CardCvcElement
                options={CARD_ELEMENT_OPTIONS}
                onChange={() => {
                  if (errorMessage) setErrorMessage(null);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-50 p-2.5 text-xs text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Movie Ticket Style Order Total $0 */}
      <div className="relative flex items-center justify-between gap-3 rounded-xl border border-dashed border-zinc-300 bg-gradient-to-r from-zinc-50 via-zinc-50 to-emerald-50/40 p-2.5 px-4 shadow-xs">
        {/* Left punch notch cutout */}
        <span
          aria-hidden="true"
          className="absolute top-1/2 -left-2.5 h-4 w-4 -translate-y-1/2 rounded-full border border-zinc-300 bg-white"
        />
        {/* Right punch notch cutout */}
        <span
          aria-hidden="true"
          className="absolute top-1/2 -right-2.5 h-4 w-4 -translate-y-1/2 rounded-full border border-zinc-300 bg-white"
        />

        {/* Ticket Left Section */}
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-zinc-600">
            <Ticket className="h-3.5 w-3.5 text-zinc-700" />
            <span className="font-mono text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
              PLUGIN DOWNLOAD · 7-DAY PASS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="truncate text-xs font-extrabold text-zinc-900">
              {selectedPlan === "monthly"
                ? "Monthly Subscription"
                : "Yearly VIP Subscription"}
            </span>
            <span className="hidden font-mono text-[9px] tracking-[2px] text-zinc-400 select-none sm:inline">
              ||| |||| || |||
            </span>
          </div>
        </div>

        {/* Perforation Divider */}
        <div className="h-8 w-px shrink-0 border-r border-dashed border-zinc-300" />

        {/* Ticket Right Section (Order Total $0) */}
        <div className="flex shrink-0 flex-col items-end text-right">
          <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
            ORDER TOTAL
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl leading-none font-black text-emerald-600 tabular-nums">
              $0.00
            </span>
          </div>
          <span className="text-[9px] font-semibold text-zinc-500">
            Due today
          </span>
        </div>
      </div>

      {/* Primary CTA Button */}
      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="h-12 w-full cursor-pointer gap-2 rounded-xl bg-zinc-950 text-sm font-extrabold text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>Activating 7-Day Free Trial...</span>
          </span>
        ) : (
          <>
            <Download className="h-4 w-4 text-white" strokeWidth={2.5} />
            <span>Download Plugin</span>
          </>
        )}
      </Button>

      {/* Sleek Evergreen Timer (Sitting just below CTA button) */}
      <div className="flex items-center justify-between gap-1.5 rounded-lg border border-amber-500/25 bg-amber-50/80 px-2.5 py-1 text-amber-950 shadow-xs">
        <div className="flex min-w-0 items-center gap-1.5">
          <Clock className="h-3 w-3 shrink-0 animate-pulse text-amber-600" />
          <span className="truncate text-[11px] font-semibold text-amber-900">
            Offer Ends in
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold whitespace-nowrap text-zinc-950 tabular-nums">
          <span className="hidden sm:inline">
            {timer.days} Days {timer.hours} Hours {timer.minutes} Mins
          </span>
          <span className="sm:hidden">
            {timer.days}d {timer.hours}h {timer.minutes}m
          </span>
          <span className="py-0.2 rounded border border-amber-500/20 bg-white px-1 text-[10px] text-amber-700">
            {timer.seconds}s
          </span>
        </div>
      </div>

      {/* Trust & Guarantee Footer */}
      <div className="flex flex-col items-center justify-center gap-1 pt-0.5 text-center">
        <div className="flex items-center gap-2 text-[11px] text-zinc-600">
          <span className="flex items-center gap-1 text-zinc-600">
            <Lock className="h-3 w-3 text-zinc-500" /> 256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span>Cancel anytime with 1 click</span>
        </div>
        <p className="text-[10px] text-zinc-500">
          No charge until day 7. You will receive an email reminder before your
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
    <div className="flex flex-col items-center gap-4 p-6 text-center text-zinc-900 sm:p-7">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/30">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-black tracking-tight text-zinc-950">
          7-Day Free Trial Activated!
        </h3>
        <p className="text-xs text-zinc-600">
          Unlimited 4K photorealistic renders unlocked for{" "}
          <span className="font-semibold text-zinc-950">{email}</span>.
        </p>
      </div>

      {/* Primary Download Button */}
      <div className="w-full space-y-2 pt-1">
        <Button
          onClick={downloadPlugin}
          className="h-12 w-full gap-2 rounded-xl bg-zinc-950 text-sm font-extrabold text-white shadow-lg transition-all hover:bg-zinc-800"
        >
          <Download className="h-4 w-4 text-white" strokeWidth={2.5} />
          <span>Download v6_render.rbz</span>
        </Button>
        <p className="text-[11px] text-zinc-500">
          Browser should download automatically · macOS & Windows Universal
        </p>
      </div>

      {/* 3-Step Installation Guide */}
      <div className="w-full space-y-2.5 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-left">
        <p className="text-[11px] font-bold tracking-wider text-zinc-800 uppercase">
          Quick 3-Step Setup in SketchUp:
        </p>
        <div className="space-y-2 text-xs text-zinc-600">
          <div className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-bold text-zinc-900">
              1
            </span>
            <span>
              Open SketchUp → Go to{" "}
              <strong className="text-zinc-900">Extensions</strong> →{" "}
              <strong className="text-zinc-900">Extension Manager</strong>.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-bold text-zinc-900">
              2
            </span>
            <span>
              Click <strong className="text-zinc-900">Install Extension</strong>{" "}
              and select the downloaded{" "}
              <strong className="text-zinc-900">v6_render.rbz</strong>.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-bold text-zinc-900">
              3
            </span>
            <span>
              Enter your email (
              <strong className="text-zinc-900">{email}</strong>) in the plugin
              window to start rendering!
            </span>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        onClick={onClose}
        className="w-full text-xs text-zinc-500 hover:text-zinc-900"
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

  if (!open && !successData) return null;

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
      <DialogContent className="w-[calc(100%-2rem)] max-w-[460px] overflow-hidden rounded-2xl border-zinc-200 bg-white p-0 text-zinc-900 shadow-2xl focus:outline-none [&>button]:border-zinc-200 [&>button]:bg-zinc-100 [&>button]:text-zinc-700 hover:[&>button]:bg-zinc-200">
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
