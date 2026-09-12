"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rocket, Lock, AlertCircle, Check } from "lucide-react";
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

export function DownloadPricingModal({
  open,
  onOpenChange,
  defaultEmail = "",
  mode = "download",
}: DownloadPricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    setErrorMessage(null);

    // Validate email before redirecting
    if (!email || !email.includes("@") || !email.includes(".")) {
      setErrorMessage("Please enter a valid email address to continue.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          plan: selectedPlan,
          mode: mode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to initialize checkout.");
      }

      try {
        localStorage.setItem("v6_pending_plan", selectedPlan);
        localStorage.setItem("v6_pending_email", email.trim().toLowerCase());
      } catch {}

      // Track conversion event for Meta Ads optimization
      fbEvent("InitiateCheckout", {
        value: selectedPlan === "yearly" ? 180 : 20,
        currency: "USD",
        content_name: `V6 Render ${selectedPlan} trial`,
        content_category: "subscription",
      });

      window.location.href = data.url;
    } catch (err: any) {
      console.error("Checkout redirection error:", err);
      setErrorMessage(
        err.message || "Failed to start checkout. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[440px] overflow-hidden rounded-2xl border-zinc-800/80 bg-[#09090b] p-0 text-white shadow-2xl focus:outline-none">
        <DialogTitle className="sr-only">Start Free Trial</DialogTitle>
        <div className="flex flex-col gap-4 p-5 text-white sm:p-6">
          {/* Header with spinning SketchUp logo */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                {mode === "activate_pro"
                  ? "Activate Pro Plan"
                  : "Start Free Trial"}
              </h3>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9">
                <Image
                  src="/sketchup-logo.png"
                  alt="SketchUp Logo"
                  width={48}
                  height={48}
                  className="h-8 w-8 object-contain sm:h-9 sm:w-9"
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
                  <span className="text-[10px] font-normal text-zinc-400">
                    /mo
                  </span>
                </span>
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-emerald-400">
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
              <span className="mt-1.5 text-[11px] font-medium text-emerald-400">
                14 Days Free
              </span>
            </button>
          </div>

          {/* Simple Features List */}
          <div className="space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-3">
            {[
              "Photorealistic 4K SketchUp renders",
              "100% geometry & camera preservation",
              "3D video walkthrough generator",
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs text-zinc-300"
              >
                <Check
                  className="h-3.5 w-3.5 shrink-0 text-emerald-400"
                  strokeWidth={2.5}
                />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-400">
              Your email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 focus:outline-none"
            />
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary CTA Button */}
          <Button
            type="button"
            size="lg"
            disabled={loading}
            onClick={handleCheckout}
            className="h-12 w-full cursor-pointer gap-2 bg-white text-sm font-extrabold text-black shadow-lg transition-all hover:bg-zinc-200 active:scale-[0.99]"
          >
            {loading ? (
              "Redirecting to Checkout..."
            ) : (
              <>
                <Rocket className="h-4 w-4 text-black" strokeWidth={2.5} />
                <span>Start 14-Day Free Trial</span>
              </>
            )}
          </Button>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 text-center text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-zinc-400" /> 256-Bit SSL
            </span>
            <span>•</span>
            <span>Cancel Anytime</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
