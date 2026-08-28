"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  "Unlimited photorealistic renders",
  "All 20+ architectural design styles",
  "Photorealistic DSLR-quality output",
  "Instant auto-download",
  "Interior & exterior redesign",
  "Priority generation queue",
];

interface Props {
  open: boolean;
  onClose: () => void;
  hadTrial?: boolean;
}

export function PricingModal({ open, onClose, hadTrial = false }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

  async function handleSubscribe(plan: "monthly" | "yearly") {
    if (!session?.user) return;
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header */}
        <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
          <DialogHeader className="space-y-0.5">
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">
              Unlock Photorealistic Studio Rendering
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
              {hadTrial
                ? "Choose a plan to continue generating designs."
                : "7-day free trial · unlimited renders · No charge until the trial ends — cancel anytime."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Plan cards */}
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {/* Monthly */}
          <div className="relative flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
            <div>
              <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
                Monthly
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  $20
                </span>
                <span className="text-sm text-zinc-400 dark:text-zinc-500">
                  / month
                </span>
              </div>
              {!hadTrial && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400">
                  <Zap className="h-3 w-3 fill-current" />
                  7-day free trial · unlimited renders
                </div>
              )}
            </div>

            <ul className="flex-1 space-y-2.5">
              {FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"
                >
                  <Check
                    className="h-4 w-4 shrink-0 text-green-500"
                    strokeWidth={2.5}
                  />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              className="w-full gap-2 rounded-xl border-zinc-200 text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
              disabled={loading !== null}
              onClick={() => handleSubscribe("monthly")}
            >
              <Sparkles className="h-4 w-4" />
              {loading === "monthly"
                ? "Redirecting…"
                : hadTrial
                  ? "Subscribe now"
                  : "Start free trial"}
            </Button>
          </div>

          {/* Yearly */}
          <div className="relative flex flex-col gap-4 rounded-2xl border border-zinc-300 bg-zinc-100 p-5 dark:border-zinc-600 dark:bg-zinc-800">
            {/* Save badge */}
            <div className="absolute -top-px right-4 rounded-b-xl bg-zinc-900 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
              Save 17%
            </div>

            <div>
              <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
                Yearly
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  $200
                </span>
                <span className="text-sm text-zinc-400 dark:text-zinc-500">
                  / year
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                ≈ $16.67 / mo
              </p>
              {!hadTrial && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400">
                  <Zap className="h-3 w-3 fill-current" />
                  7-day free trial · unlimited renders
                </div>
              )}
            </div>

            <ul className="flex-1 space-y-2.5">
              {FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"
                >
                  <Check
                    className="h-4 w-4 shrink-0 text-green-500"
                    strokeWidth={2.5}
                  />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              className={cn(
                "w-full gap-2 rounded-xl",
                "bg-zinc-900 text-white hover:bg-zinc-800",
                "dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              )}
              disabled={loading !== null}
              onClick={() => handleSubscribe("yearly")}
            >
              <Sparkles className="h-4 w-4" />
              {loading === "yearly"
                ? "Redirecting…"
                : hadTrial
                  ? "Subscribe now"
                  : "Start free trial"}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 px-6 py-3 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          {hadTrial
            ? "Secured by Stripe · No trial — billed immediately · Cancel anytime"
            : "Secured by Stripe · Cancel anytime · No hidden fees"}
        </div>
      </DialogContent>
    </Dialog>
  );
}
