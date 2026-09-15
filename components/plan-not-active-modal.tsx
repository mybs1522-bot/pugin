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
import { Zap, Lock } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onActivated: () => void;
  hadTrial: boolean;
}

export function PlanNotActiveModal({
  open,
  onClose,
  onActivated,
  hadTrial,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleActivate() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/activate", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.activated) {
        onActivated();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm gap-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
            <Lock className="h-6 w-6 text-zinc-500" />
          </div>

          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">
              Plan Not Active
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
              {hadTrial
                ? "Activate your monthly plan to start generating renders."
                : "Start your 7-day free trial to unlock unlimited renders and downloads."}
            </DialogDescription>
          </DialogHeader>

          <div className="w-full space-y-3 pt-2">
            <Button
              className="w-full gap-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              disabled={loading}
              onClick={handleActivate}
            >
              <Zap className="h-4 w-4 fill-current" />
              {loading
                ? "Activating…"
                : hadTrial
                  ? "Activate Plan"
                  : "Start Free Trial"}
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-xl text-zinc-400 hover:text-zinc-600"
              onClick={onClose}
            >
              Maybe later
            </Button>
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            {hadTrial
              ? "Secured by Stripe · Cancel anytime"
              : "7-day free trial · No charge until trial ends · Cancel anytime"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
