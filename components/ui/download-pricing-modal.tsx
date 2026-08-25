"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  CheckCircle2,
  Lock,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Calendar,
} from "lucide-react";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripeClient } from "@/lib/stripe-client";
import { cn } from "@/lib/utils";

interface DownloadPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform?: "windows" | "mac";
  windowsHref?: string;
  macHref?: string;
}

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

function UnifiedTrialForm({
  onSuccess,
}: {
  onSuccess: (email: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const normEmail = email.trim().toLowerCase();
    if (!normEmail || !normEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!stripe || !elements) {
      setErrorMessage(
        "Stripe payment gateway is initializing. Please wait a moment."
      );
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setErrorMessage("Please enter your card number.");
      return;
    }

    setLoading(true);

    try {
      // 1. Request SetupIntent from backend to securely save card off-session
      const setupRes = await fetch("/api/stripe/setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normEmail }),
      });

      const setupData = await setupRes.json();
      if (!setupRes.ok || !setupData.clientSecret) {
        throw new Error(
          setupData.error || "Failed to initialize secure card setup."
        );
      }

      // 2. Confirm Card Setup with Stripe ($0 charged today, cardholder name bypassed)
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
          confirmResult.error.message || "Card verification failed."
        );
      }

      const paymentMethodId = confirmResult.setupIntent.payment_method;

      // 3. Create 14-day free trial subscription in Stripe with saved card
      const subRes = await fetch("/api/stripe/create-trial-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normEmail,
          paymentMethodId:
            typeof paymentMethodId === "string"
              ? paymentMethodId
              : paymentMethodId?.id,
          plan: selectedPlan,
        }),
      });

      const subData = await subRes.json();
      if (!subRes.ok || subData.error) {
        throw new Error(
          subData.error || "Failed to establish trial subscription."
        );
      }

      // 4. Save local state
      try {
        const trialRecord = {
          email: normEmail,
          count: 0,
          imageCount: 0,
          videoCount: 0,
          isPaid: false,
          status: "trial",
          paymentMode: `Stripe 14-Day Free Trial (${selectedPlan})`,
          lastModelUsed: "google/nano-banana-pro",
          signedUpAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        };
        const stored = localStorage.getItem("pugin_trials_list");
        const list = stored ? JSON.parse(stored) : [];
        if (!list.some((u: any) => u.email.toLowerCase() === normEmail)) {
          list.unshift(trialRecord);
          localStorage.setItem("pugin_trials_list", JSON.stringify(list));
        }
      } catch {}

      // 5. Trigger automatic download of .rbz
      const downloadLink = document.createElement("a");
      downloadLink.href = "/v6_render.rbz";
      downloadLink.download = "v6_render.rbz";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      onSuccess(normEmail);
    } catch (err: any) {
      console.error("Trial submission error:", err);
      setErrorMessage(
        err.message ||
          "Something went wrong while verifying your card. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-[#09090b] p-6 text-white sm:p-7">
      {/* Top Badge & Header */}
      <div className="space-y-2 text-left">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/90 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-200">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Native SketchUp Extension • 2,000 Renders
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              Download Plugin Now
            </h3>
            <Image
              src="/sketchup-logo.png"
              alt="SketchUp Logo"
              width={26}
              height={26}
              className="h-6 w-6 shrink-0 object-contain"
            />
          </div>
          <span className="shrink-0 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-[11px] font-bold text-white">
            $0.00 Due Today
          </span>
        </div>
      </div>

      {/* Side-by-Side Plan Selector (Monochrome Black & White Dark Theme) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Monthly Card */}
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
              <span className="text-[10px] font-normal text-zinc-400">/mo</span>
            </span>
          </div>
          <span className="mt-1.5 text-[11px] font-medium text-zinc-400">
            14 Days Free • 2,000 Renders
          </span>
        </button>

        {/* Yearly Card */}
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-1">
        {/* EMAIL ADDRESS */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="architect@studio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 border-zinc-800 bg-zinc-900/90 text-sm text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white"
            required
            autoFocus
          />
        </div>

        {/* CARD NUMBER */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              Card Number
            </label>
            <span className="flex items-center gap-1 text-[10px] text-zinc-400">
              <ShieldCheck className="h-3 w-3 text-zinc-300" /> SSL Encrypted
            </span>
          </div>
          <div className="relative rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 pl-10 focus-within:border-white focus-within:ring-1 focus-within:ring-white">
            <CreditCard className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400" />
            <CardNumberElement options={ELEMENT_STYLE} />
          </div>
        </div>

        {/* EXPIRY DATE & CVC */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              Expiry Date
            </label>
            <div className="relative rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 pl-10 focus-within:border-white focus-within:ring-1 focus-within:ring-white">
              <Calendar className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400" />
              <CardExpiryElement options={ELEMENT_STYLE} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              CVC
            </label>
            <div className="relative rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 pl-10 focus-within:border-white focus-within:ring-1 focus-within:ring-white">
              <Lock className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400" />
              <CardCvcElement options={ELEMENT_STYLE} />
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SUBMIT CTA (Black & White High Contrast) */}
        <Button
          type="submit"
          size="lg"
          disabled={loading || !stripe}
          className="mt-1 h-12 w-full cursor-pointer gap-2 bg-white text-sm font-extrabold text-black shadow-xl transition-all hover:bg-zinc-200"
        >
          {loading ? (
            "Verifying Card & Starting Trial..."
          ) : (
            <>
              <Download className="h-4 w-4 text-black" />
              Start 14-Day Free Trial & Download (.rbz)
            </>
          )}
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-zinc-400">
          <Lock className="mr-1 inline-block h-3 w-3 text-zinc-300" />
          $0.00 charged today. 14 days free trial with 2,000 Renders. Cancel
          anytime in 1 click.
        </p>
      </form>
    </div>
  );
}

export function DownloadPricingModal({
  open,
  onOpenChange,
}: DownloadPricingModalProps) {
  const [done, setDone] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");

  const handleSuccess = (email: string) => {
    setConfirmedEmail(email);
    setDone(true);
  };

  const handleManualDownload = () => {
    const downloadLink = document.createElement("a");
    downloadLink.href = "/v6_render.rbz";
    downloadLink.download = "v6_render.rbz";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) {
          setTimeout(() => setDone(false), 300);
        }
      }}
    >
      <DialogContent className="max-w-[480px] overflow-hidden rounded-2xl border-zinc-800 bg-[#09090b] p-0 text-white shadow-2xl">
        {!done ? (
          <Elements stripe={getStripeClient()}>
            <UnifiedTrialForm onSuccess={handleSuccess} />
          </Elements>
        ) : (
          <div className="flex flex-col items-center gap-4 bg-[#09090b] p-6 text-center text-white sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-white">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                14-Day Free Trial Activated!
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                Your 14-day trial for{" "}
                <span className="font-semibold text-white">
                  {confirmedEmail}
                </span>{" "}
                has been set up with card securely on file (2,000 Renders
                Included). Your download of{" "}
                <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-zinc-200">
                  v6_render.rbz
                </code>{" "}
                has started.
              </p>
            </div>

            <div className="mt-2 w-full space-y-3">
              <Button
                onClick={handleManualDownload}
                variant="outline"
                className="w-full gap-2 border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800"
              >
                <Download className="h-4 w-4" />
                Click here if download didn't start automatically
              </Button>

              <Button
                onClick={() => onOpenChange(false)}
                className="w-full bg-white font-bold text-black hover:bg-zinc-200"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
