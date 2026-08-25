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
      iconColor: "#a855f7",
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
  email?: string;
  onEmailChange?: (email: string) => void;
  onSubmitTrial?: (email: string, cardholderName: string) => Promise<void>;
  loading?: boolean;
  errorMessage?: string | null;
}

export function GlassCheckoutCard({
  amount = 20,
  className,
  selectedPlan = "monthly",
  email: propEmail,
  onEmailChange,
  onSubmitTrial,
  loading: propLoading,
  errorMessage: propError,
}: GlassCheckoutCardProps) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [localEmail, setLocalEmail] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const stripe = useStripe();
  const elements = useElements();

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
      await onSubmitTrial(normEmail, cardholderName);
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

      // 2. Confirm card setup with Stripe ($0 charged today)
      const confirmResult = await stripe.confirmCardSetup(
        setupData.clientSecret,
        {
          payment_method: {
            card: cardNumber,
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
      className={cn("mx-auto w-full max-w-[460px]", className)}
    >
      <Card className="group border-border/60 bg-card/60 hover:border-primary/50 hover:shadow-primary/10 relative overflow-hidden rounded-2xl p-0 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl">
        <form onSubmit={handleFormSubmit} className="p-6 sm:p-7">
          <div className="mb-5">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-xl font-bold tracking-tight">
                Payment Details
              </h3>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-500">
                14 Days Free · $0 Today
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Complete your 14-day free trial setup securely with card on file
            </p>
          </div>

          {/* Payment Methods Tabs */}
          <div className="mb-5 grid grid-cols-3 gap-2">
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
                  className={cn(
                    "border-border/50 bg-background/50 hover:bg-background/80 flex h-11 items-center justify-center gap-1.5 rounded-xl border text-xs font-semibold transition-all",
                    isSelected &&
                      "border-primary bg-primary/15 text-primary ring-primary/40 shadow-sm ring-1"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {method.text && (
                    <span className="font-bold">{method.text}</span>
                  )}
                  {method.id === "card" && <span>Card</span>}
                </button>
              );
            })}
          </div>

          <div className="space-y-3.5">
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
                className="border-border/60 bg-background/60 focus:border-primary focus:bg-background/90 h-10 text-sm backdrop-blur-sm"
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
              <div className="border-border/60 bg-background/60 focus-within:border-primary focus-within:ring-primary relative rounded-lg border p-2.5 pl-10 backdrop-blur-sm focus-within:ring-1">
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
                <div className="border-border/60 bg-background/60 focus-within:border-primary focus-within:ring-primary relative rounded-lg border p-2.5 pl-10 backdrop-blur-sm focus-within:ring-1">
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
                <div className="border-border/60 bg-background/60 focus-within:border-primary focus-within:ring-primary relative rounded-lg border p-2.5 pl-10 backdrop-blur-sm focus-within:ring-1">
                  <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                  <CardCvcElement options={ELEMENT_STYLE} />
                </div>
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-foreground text-xs font-semibold tracking-wider uppercase"
              >
                Cardholder Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="border-border/60 bg-background/60 focus:border-primary focus:bg-background/90 h-10 text-sm backdrop-blur-sm"
              />
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
            className="bg-primary text-primary-foreground shadow-primary/25 hover:shadow-primary/45 mt-5 h-11 w-full gap-2 font-bold shadow-lg transition-all"
          >
            {isLoading ? (
              "Setting up trial..."
            ) : (
              <>
                <Download className="h-4 w-4" />
                Start 14-Day Free Trial ($0 Today)
              </>
            )}
          </Button>

          <div className="text-muted-foreground mt-3.5 flex items-center justify-center gap-1.5 text-center text-xs">
            <Lock className="text-muted-foreground h-3.5 w-3.5" />
            <span>256-bit encrypted · Auto-downloads SketchUp plugin</span>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
