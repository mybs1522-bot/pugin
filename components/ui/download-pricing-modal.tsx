"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Lock, AlertCircle, Check, Zap } from "lucide-react";
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
  mode = "download",
}: DownloadPricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: defaultEmail || undefined,
          plan: selectedPlan,
          mode: mode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to initialize checkout.");
      }

      // Store chosen plan for sync on return
      try {
        localStorage.setItem("v6_pending_plan", selectedPlan);
      } catch {}

      // Fast direct redirect to hosted checkout
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
        <DialogTitle className="sr-only">Download Plugin Free</DialogTitle>
        <div className="flex flex-col gap-4 p-5 text-white sm:p-6">
          {/* Header */}
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/90 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {mode === "activate_pro"
                ? "Native SketchUp Extension • Pro Access"
                : "14-Day Free Trial • Full Access"}
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">
                  {mode === "activate_pro"
                    ? "Activate Pro Plan"
                    : "Start Free Trial"}
                </h3>
                <div className="relative h-6 w-6 shrink-0">
                  <Image
                    src="/sketchup-logo.png"
                    alt="SketchUp Logo"
                    width={24}
                    height={24}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                $0.00 Due Today
              </span>
            </div>

            <p className="text-xs leading-relaxed text-zinc-400">
              {mode === "activate_pro"
                ? "Unlock 3D Video Walkthroughs & Photorealistic 4K Renders."
                : "Full access to all 20+ architectural styles. No charge until your 14-day trial ends."}
            </p>
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
                  Pay Monthly
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
                  Pay Yearly
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

          {/* Key Features List */}
          <div className="space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-3">
            {[
              "Photorealistic 4K SketchUp renders",
              "100% geometry & camera preservation",
              "3D video walkthrough generator",
              "14-day free trial · Cancel anytime in 1-click",
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
              "Starting Download & Trial..."
            ) : (
              <>
                <Download className="h-4 w-4 text-black" strokeWidth={2.5} />
                <span>Download Plugin Free</span>
              </>
            )}
          </Button>

          {/* Footer Security Badges */}
          <div className="flex items-center justify-center gap-2.5 text-center text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-zinc-400" /> 256-Bit SSL
            </span>
            <span>•</span>
            <span>Apple Pay & Google Pay</span>
            <span>•</span>
            <span>Cancel Anytime</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
