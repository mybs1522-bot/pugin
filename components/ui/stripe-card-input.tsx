"use client";

import React, { useId } from "react";
import { CardElement } from "@stripe/react-stripe-js";
import { Lock, ShieldCheck } from "lucide-react";

export const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#ffffff",
      fontFamily: "'Inter', sans-serif",
      fontSmoothing: "antialiased",
      fontSize: "14px",
      "::placeholder": {
        color: "#71717a",
      },
      iconColor: "#a855f7",
    },
    invalid: {
      color: "#f87171",
      iconColor: "#f87171",
    },
  },
  hidePostalCode: false,
};

interface StripeCardInputProps {
  onChange?: (complete: boolean) => void;
}

export function StripeCardInput({ onChange }: StripeCardInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
          <Lock className="text-primary h-3 w-3" /> Card Details ($0 Today)
        </label>
        <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium">
          <ShieldCheck className="h-3 w-3 text-green-500" /> 256-Bit Encrypted
        </span>
      </div>

      <div className="border-border bg-muted/40 focus-within:border-primary focus-within:ring-primary rounded-xl border p-3.5 shadow-sm transition-colors focus-within:ring-1">
        <CardElement
          options={CARD_ELEMENT_OPTIONS}
          onChange={(e) => onChange?.(e.complete)}
        />
      </div>

      <div className="text-muted-foreground flex items-center justify-between pt-0.5 text-[11px]">
        <span>⚡ $0.00 charged today</span>
        <span>14-day free trial · Cancel anytime</span>
      </div>
    </div>
  );
}
