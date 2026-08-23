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
import { Download, CheckCircle2, ArrowLeft } from "lucide-react";

interface DownloadPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform?: "windows" | "mac";
  windowsHref?: string;
  macHref?: string;
}

export function DownloadPricingModal({
  open,
  onOpenChange,
}: DownloadPricingModalProps) {
  const [step, setStep] = useState<"pricing" | "email" | "done">("pricing");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStartTrialClick = () => {
    setStep("email");
  };

  const handleConfirmEmailTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep("done");

      // Trigger automatic download of the SketchUp Plugin archive (.rbz)
      const downloadLink = document.createElement("a");
      downloadLink.href = "/aisoft_render.rbz";
      downloadLink.download = "aisoft_render.rbz";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }, 600);
  };

  const handleManualDownload = () => {
    const downloadLink = document.createElement("a");
    downloadLink.href = "/aisoft_render.rbz";
    downloadLink.download = "aisoft_render.rbz";
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
          <div className="flex flex-col gap-4 p-6 sm:p-8">
            <button
              type="button"
              onClick={() => setStep("pricing")}
              className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to plans
            </button>

            <DialogHeader className="space-y-1.5 p-0 text-left">
              <DialogTitle className="text-2xl font-black tracking-tight">
                Enter your email
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                We'll activate your 14-day free trial and start your SketchUp
                plugin download immediately.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleConfirmEmailTrial}
              className="mt-2 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-foreground text-xs font-semibold tracking-wider uppercase">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="architect@studio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-border bg-muted/30 focus-visible:ring-primary h-11 px-3.5 text-sm"
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="mt-2 h-12 w-full gap-2 text-sm font-bold shadow-lg"
              >
                {loading ? (
                  "Activating Trial & Downloading..."
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Confirm & Download SketchUp Plugin (.rbz)
                  </>
                )}
              </Button>
            </form>
          </div>
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
                <span className="text-foreground font-semibold">{email}</span>{" "}
                is active. Your download of{" "}
                <code className="text-foreground font-mono">
                  aisoft_render.rbz
                </code>{" "}
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
