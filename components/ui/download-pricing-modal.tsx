"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PricingCard } from "@/components/ui/pricing-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  CheckCircle2,
  ArrowLeft,
  Lock,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Calendar,
  User,
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
      color: "#18181b",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      fontSmoothing: "antialiased",
      fontSize: "14px",
      "::placeholder": {
        color: "#a1a1aa",
      },
      iconColor: "#7c3aed",
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
};

function TrialCheckoutForm({
  selectedPlan,
  onBack,
  onSuccess,
}: {
  selectedPlan: "monthly" | "yearly";
  onBack: () => void;
  onSuccess: (email: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
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
        "Stripe payment gateway is still initializing. Please wait a moment."
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

      // 2. Confirm Card Setup with Stripe ($0 charged today)
      const confirmResult = await stripe.confirmCardSetup(
        setupData.clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              email: normEmail,
              name: cardholderName || undefined,
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
          paymentMode: "Stripe 14-Day Free Trial (Card Saved)",
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

      // 5. Trigger download of .rbz
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
          "Something went wrong while verifying your card. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 sm:p-7">
      <button
        type="button"
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs font-semibold transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to plans
      </button>

      <div className="space-y-1 text-left">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-xl font-bold tracking-tight">
            Payment Details
          </h3>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            $0.00 Due Today
          </span>
        </div>
        <p className="text-muted-foreground text-xs">
          Complete your 14-day free trial setup securely with card on file
        </p>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: "card", label: "Credit Card", icon: CreditCard },
          { id: "paypal", label: "PayPal", text: "Pay" },
          { id: "apple", label: "Apple Pay", text: "Pay" },
        ].map((method) => {
          const Icon = method.icon;
          const isSelected = paymentMethod === method.id;
          return (
            <button
              type="button"
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`flex h-11 items-center justify-center gap-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary ring-primary/40 shadow-sm ring-1"
                  : "border-border/50 bg-background/50 text-muted-foreground hover:bg-background/80"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {method.text && <span className="font-bold">{method.text}</span>}
              {method.id === "card" && <span>Card</span>}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
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
            className="border-border/60 bg-background/60 focus:border-primary h-10 text-sm"
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
          <div className="border-border/60 bg-background/60 focus-within:border-primary focus-within:ring-primary relative rounded-lg border p-2.5 pl-10 focus-within:ring-1">
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
            <div className="border-border/60 bg-background/60 focus-within:border-primary focus-within:ring-primary relative rounded-lg border p-2.5 pl-10 focus-within:ring-1">
              <Calendar className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <CardExpiryElement options={ELEMENT_STYLE} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-foreground text-xs font-semibold tracking-wider uppercase">
              CVC
            </label>
            <div className="border-border/60 bg-background/60 focus-within:border-primary focus-within:ring-primary relative rounded-lg border p-2.5 pl-10 focus-within:ring-1">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <CardCvcElement options={ELEMENT_STYLE} />
            </div>
          </div>
        </div>

        {/* CARDHOLDER NAME */}
        <div className="space-y-1.5">
          <label className="text-foreground text-xs font-semibold tracking-wider uppercase">
            Cardholder Name
          </label>
          <div className="relative">
            <Input
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="border-border/60 bg-background/60 focus:border-primary h-10 pl-10 text-sm"
            />
            <User className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
          </div>
        </div>

        {errorMessage && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive flex items-start gap-2 rounded-xl border p-3 text-xs">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loading || !stripe}
          className="mt-1 h-12 w-full gap-2 text-sm font-bold shadow-lg"
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
  const [step, setStep] = useState<"pricing" | "email" | "done">("pricing");
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [confirmedEmail, setConfirmedEmail] = useState("");

  const handleStartTrialClick = (plan?: "monthly" | "yearly") => {
    if (plan) setSelectedPlan(plan);
    setStep("email");
  };

  const handleSuccess = (email: string) => {
    setConfirmedEmail(email);
    setStep("done");
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
          setTimeout(() => setStep("pricing"), 300);
        }
      }}
    >
      <DialogContent className="border-border bg-background max-w-[500px] overflow-hidden rounded-2xl p-0">
        {step === "pricing" && (
          <>
            <DialogHeader className="px-6 pt-6 pb-0 text-left">
              <DialogTitle className="text-xl font-bold">
                Activate 14-Day Free Trial
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Get 14 days of unlimited SketchUp AI rendering & 3D video
                walkthroughs.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <PricingCard onStartTrial={handleStartTrialClick} />
            </div>
          </>
        )}

        {step === "email" && (
          <Elements stripe={getStripeClient()}>
            <TrialCheckoutForm
              selectedPlan={selectedPlan}
              onBack={() => setStep("pricing")}
              onSuccess={handleSuccess}
            />
          </Elements>
        )}

        {step === "done" && (
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
