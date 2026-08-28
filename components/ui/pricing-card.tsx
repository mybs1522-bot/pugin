"use client";

import { AnimatePresence, motion, LayoutGroup } from "motion/react";
import { useState } from "react";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MONTHLY_PRICE = 20;
const MONTHLY_ORIGINAL = 40;
const YEARLY_PRICE = 15;
const YEARLY_ORIGINAL = 30;

const FEATURES = [
  { label: "Unlimited 4K Renders & 3D Video Walkthroughs", highlight: true },
  { label: "100% Geometry & Camera Perspective Lock (Zero Drift)" },
  { label: "Native SketchUp .rbz Extension (Windows & Mac)" },
  { label: "Dedicated Cloud Rendering · Zero GPU or High RAM Needed" },
  { label: "Physical PBR Lighting, Materials & Realistic Reflections" },
];

const TRANSITION = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

interface PricingCardProps {
  onStartTrial?: (plan: "monthly" | "yearly") => void;
}

export function PricingCard({ onStartTrial }: PricingCardProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const price = billing === "monthly" ? MONTHLY_PRICE : YEARLY_PRICE;
  const original = billing === "monthly" ? MONTHLY_ORIGINAL : YEARLY_ORIGINAL;

  return (
    <div className="border-border bg-background flex w-full max-w-[460px] flex-col gap-6 rounded-2xl border p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Zap className="text-primary h-5 w-5" />
          <h2 className="text-2xl font-semibold tracking-tight">Pro Plan</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Activate your 14-day free trial to unlock the download.
        </p>
      </div>

      {/* Billing toggle */}
      <LayoutGroup>
        <div className="bg-muted ring-border flex h-10 w-full rounded-xl p-1 ring-1">
          {(["monthly", "yearly"] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBilling(cycle)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors duration-300",
                billing === cycle
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {billing === cycle && (
                <motion.div
                  layoutId="billing-bg"
                  className="bg-background ring-border absolute inset-0 rounded-lg shadow-sm ring-1"
                  transition={TRANSITION}
                />
              )}
              <span className="relative z-10 capitalize">{cycle}</span>
              {cycle === "yearly" && (
                <span className="bg-primary text-primary-foreground relative z-10 rounded-full px-1.5 py-0.5 text-[10px] font-black tracking-tight uppercase">
                  25% OFF
                </span>
              )}
            </button>
          ))}
        </div>
      </LayoutGroup>

      {/* Price */}
      <div className="flex items-end gap-2">
        <AnimatePresence mode="wait">
          <motion.span
            key={price}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="text-5xl font-black tracking-tight"
          >
            ${price}
          </motion.span>
        </AnimatePresence>
        <div className="mb-1.5 flex flex-col">
          <span className="text-muted-foreground text-sm line-through">
            ${original}/mo
          </span>
          <span className="text-muted-foreground text-sm">
            {billing === "yearly" ? "per month, billed yearly" : "per month"}
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-col gap-3">
        {FEATURES.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                f.highlight
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              )}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </div>
            <span
              className={cn(
                "text-sm",
                f.highlight
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {f.label}
              {f.highlight && (
                <span className="bg-primary/10 text-primary ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                  Unlimited
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full text-base font-bold"
          onClick={() => onStartTrial?.(billing)}
        >
          Activate 14-Day Free Trial & Download
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          Cancel anytime
        </p>
      </div>
    </div>
  );
}
