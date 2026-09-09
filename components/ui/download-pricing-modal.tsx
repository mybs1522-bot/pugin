"use client";

import { useState, useEffect } from "react";
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
  Sparkles,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export function DownloadPricingModal({
  open,
  onOpenChange,
  defaultEmail = "",
  hideEmail = false,
  mode = "download",
}: DownloadPricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [email, setEmail] = useState(defaultEmail || "");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep email in sync if defaultEmail changes
  useEffect(() => {
    if (defaultEmail && !email) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail, email]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const normEmail = (email || defaultEmail || "").trim().toLowerCase();
    if (!normEmail || !normEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normEmail,
          plan: selectedPlan,
          mode: mode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to initialize Stripe checkout.");
      }

      // Store intent/email in local storage for seamless sync upon return
      try {
        localStorage.setItem("v6_pending_checkout_email", normEmail);
        localStorage.setItem("v6_pending_plan", selectedPlan);
      } catch {}

      // Redirect user directly to Stripe Hosted Checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Stripe checkout redirection error:", err);
      setErrorMessage(
        err.message || "Failed to connect to Stripe. Please try again."
      );
      setLoading(false);
    }
  };

  const shouldHideEmailInput =
    hideEmail || (!!defaultEmail && mode === "activate_pro");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] overflow-hidden rounded-2xl border-zinc-800 bg-[#09090b] p-0 text-white shadow-2xl">
        <div className="flex flex-col gap-4 bg-[#09090b] p-6 text-white sm:p-7">
          {/* Top Badge & Header */}
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/90 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {mode === "activate_pro"
                ? "Native SketchUp Extension • Unlimited Renders"
                : "14-Day Free Trial • Unlimited Renders"}
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <h3 className="text-base font-black tracking-tight whitespace-nowrap text-white sm:text-lg md:text-xl">
                  {mode === "activate_pro"
                    ? "Activate Pro Plan"
                    : "Start Free Trial & Download"}
                </h3>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9">
                  <Image
                    src="/sketchup-logo.png"
                    alt="SketchUp Logo"
                    width={48}
                    height={48}
                    className="h-8 w-8 animate-[spin_8s_linear_infinite] object-contain sm:h-9 sm:w-9"
                  />
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-emerald-400">
                $0.00 Due Today
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {mode === "activate_pro"
                ? "Unlock 3D Video Walkthroughs & Unlimited 4K Photorealistic Renders."
                : "Full access to all 20+ architectural styles. No charge until your 14-day trial ends."}
            </p>
          </div>

          {/* Plan Selector */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 sm:gap-3">
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
              <div className="flex w-full items-center justify-between gap-1">
                <span className="text-[11px] font-bold tracking-wider whitespace-nowrap text-white uppercase sm:text-xs">
                  Pay Monthly
                </span>
                <span className="text-sm font-black whitespace-nowrap text-white">
                  $20
                  <span className="text-[10px] font-normal text-zinc-400">
                    /mo
                  </span>
                </span>
              </div>
              <span className="mt-1.5 text-[11px] font-medium whitespace-nowrap text-emerald-400">
                14 Days Free
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
                <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black tracking-wider whitespace-nowrap text-black uppercase shadow-sm">
                  Save 25%
                </span>
              </div>
              <div className="flex w-full items-center justify-between gap-1">
                <span className="text-[11px] font-bold tracking-wider whitespace-nowrap text-white uppercase sm:text-xs">
                  Pay Yearly
                </span>
                <div className="flex items-baseline gap-1 whitespace-nowrap">
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
              <span className="mt-1.5 text-[11px] font-medium whitespace-nowrap text-emerald-400">
                14 Days Free
              </span>
            </button>
          </div>

          {/* Key Features List */}
          <div className="space-y-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
            {[
              "Unlimited 4K photorealistic SketchUp renders",
              "100% geometry & camera preservation",
              "3D video walkthrough generator",
              "14-day free trial · Cancel anytime with 1-click",
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs text-zinc-300"
              >
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCheckout}
            className="flex flex-col gap-3.5 pt-1"
          >
            {/* EMAIL ADDRESS */}
            {!shouldHideEmailInput ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                  Email Address for Account
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
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span>👤</span>
                  <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                    Account Email
                  </span>
                </span>
                <span className="font-mono font-semibold text-white">
                  {email || defaultEmail}
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TRUST BADGE / STRIPE NOTICE */}
            <div className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950 px-3 py-2 text-xs text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>
                Checkout is securely hosted on <strong>Stripe</strong>
              </span>
            </div>

            {/* SUBMIT CTA */}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="mt-1 h-12 w-full cursor-pointer gap-2 bg-white text-sm font-extrabold text-black shadow-xl transition-all hover:bg-zinc-200"
            >
              {loading ? (
                "Redirecting to Stripe..."
              ) : (
                <>
                  <span>Continue to Secure Stripe Checkout</span>
                  <ArrowRight className="h-4 w-4 text-black" />
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-zinc-400" /> 256-Bit SSL
                Encryption
              </span>
              <span>•</span>
              <span>Apple Pay & Google Pay Supported</span>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
