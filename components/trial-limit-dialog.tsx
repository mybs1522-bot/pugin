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
import { CreditCard, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpgraded: () => void;
}

export function TrialLimitDialog({ open, onClose, onUpgraded }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleActivate() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/upgrade", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to activate paid plan");
        return;
      }

      toast.success("Paid plan activated! Generating your design…");
      onClose();
      onUpgraded();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm gap-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-white">
              Trial renders used up
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
              You&apos;ve used all 10 free trial renders.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white">
              <CreditCard className="h-4 w-4 text-zinc-400" />
              Your saved card will be charged now
            </div>
            <p className="pl-6 text-xs text-zinc-500 dark:text-zinc-400">
              No need to re-enter card details. We&apos;ll activate your paid
              plan immediately using the card you provided when starting the
              trial.
            </p>
          </div>

          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
            Cancel anytime from account settings · No hidden fees
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <Button
            className="w-full gap-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            disabled={loading}
            onClick={handleActivate}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Activating…" : "Activate paid plan & generate"}
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            disabled={loading}
            onClick={onClose}
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
