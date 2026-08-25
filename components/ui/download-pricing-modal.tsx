"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  Sparkles,
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
      color: "var(--foreground, #18181b)",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      fontSmoothing: "antialiased",
      fontSize: "14px",
      "::placeholder": {
        color: "var(--muted-foreground, #a1a1aa)",
      },
      iconColor: "#10b981",
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
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
    <div className="flex flex-col gap-4 p-6 sm:p-7">
      {/* Top Badge & Header */}
      <div className="space-y-1.5 text-left">
        <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Native SketchUp Extension • Unlimited 4K Renders
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-xl font-black tracking-tight sm:text-2xl">
            Download Plugin Now
          </h3>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            $0.00 Due Today
          </span>
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">
          14 days free trial. Unrestricted access to unlimited 4K photorealistic
          renders & 3D video walkthroughs. Cancel anytime in 1 click.
        </p>
      </div>

      {/* Side-by-Side Plan Selector (Directly on the page) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Monthly Card */}
        <button
          type="button"
          onClick={() => setSelectedPlan("monthly")}
          className={cn(
            "relative flex cursor-pointer flex-col justify-between rounded-xl border p-3 text-left transition-all",
            selectedPlan === "monthly"
              ? "border-emerald-500 bg-emerald-500/5 shadow-sm ring-2 ring-emerald-500/30 dark:bg-emerald-500/10"
              : "border-border/60 bg-muted/20 hover:bg-muted/40 opacity-85 hover:opacity-100"
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

        {/* Yearly Card */}
        <button
          type="button"
          onClick={() => setSelectedPlan("yearly")}
          className={cn(
            "relative flex cursor-pointer flex-col justify-between rounded-xl border p-3 text-left transition-all",
            selectedPlan === "yearly"
              ? "border-emerald-500 bg-emerald-500/5 shadow-sm ring-2 ring-emerald-500/30 dark:bg-emerald-500/10"
              : "border-border/60 bg-muted/20 hover:bg-muted/40 opacity-85 hover:opacity-100"
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-1">
        {/* EMAIL ADDRESS */}
        <div className="space-y-1.5">
          <label className="text-foreground text-xs font-semibold tracking-wider uppercase">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="architect@studio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-border/60 bg-background/60 h-10 text-sm focus:border-emerald-500"
            required
            autoFocus
          />
        </div>

        {/* CARD NUMBER */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-foreground text-xs font-semibold tracking-wider uppercase">
              Card Number
            </label>
            <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> SSL Encrypted
            </span>
          </div>
          <div className="border-border/60 bg-background/60 relative rounded-lg border p-2.5 pl-10 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
            <CreditCard className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <CardNumberElement options={ELEMENT_STYLE} />
          </div>
        </div>

        {/* EXPIRY DATE & CVC */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-foreground text-xs font-semibold tracking-wider uppercase">
              Expiry Date
            </label>
            <div className="border-border/60 bg-background/60 relative rounded-lg border p-2.5 pl-10 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
              <Calendar className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <CardExpiryElement options={ELEMENT_STYLE} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-foreground text-xs font-semibold tracking-wider uppercase">
              CVC
            </label>
            <div className="border-border/60 bg-background/60 relative rounded-lg border p-2.5 pl-10 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <CardCvcElement options={ELEMENT_STYLE} />
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive flex items-start gap-2 rounded-xl border p-3 text-xs">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SUBMIT CTA */}
        <Button
          type="submit"
          size="lg"
          disabled={loading || !stripe}
          className="mt-1 h-12 w-full gap-2 bg-emerald-600 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-500 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
        >
          {loading ? (
            "Verifying Card & Starting Trial..."
          ) : (
            <>
              <Download className="h-4 w-4" />
              Start 14-Day Free Trial & Download (.rbz)
            </>
          )}
        </Button>

        <p className="text-muted-foreground text-center text-[11px] leading-relaxed">
          <Lock className="mr-1 inline-block h-3 w-3 text-emerald-500" />
          $0.00 charged today. 14 days free trial. Cancel anytime with 1 click.
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
      <DialogContent className="border-border bg-background max-w-[480px] overflow-hidden rounded-2xl p-0 shadow-2xl">
        {!done ? (
          <Elements stripe={getStripeClient()}>
            <UnifiedTrialForm onSuccess={handleSuccess} />
          </Elements>
        ) : (
          <div className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-foreground text-xl font-bold">
                14-Day Free Trial Activated!
              </h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                Your 14-day trial for{" "}
                <span className="text-foreground font-semibold">
                  {confirmedEmail}
                </span>{" "}
                has been set up with card securely on file. Your download of{" "}
                <code className="text-foreground font-mono">v6_render.rbz</code>{" "}
                has started.
              </p>
            </div>

            <div className="mt-2 w-full space-y-3">
              <Button
                onClick={handleManualDownload}
                variant="outline"
                className="border-border w-full gap-2"
              >
                <Download className="h-4 w-4" />
                Click here if download didn't start automatically
              </Button>

              <Button
                onClick={() => onOpenChange(false)}
                className="w-full font-bold"
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
