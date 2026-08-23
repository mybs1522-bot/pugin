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
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Download,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";

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
  platform,
}: DownloadPricingModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmitTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-background max-w-[480px] rounded-2xl p-6 sm:p-8">
        {!submitted ? (
          <>
            <DialogHeader className="space-y-2 text-left">
              <div className="bg-primary/10 border-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-xl border">
                <Sparkles className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                Start 14-Day Free Trial
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                Enter your email to activate 14 days of unlimited SketchUp AI
                image renders & 3D video walkthroughs. No credit card required.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmitTrial}
              className="mt-4 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-foreground text-xs font-semibold tracking-wider uppercase">
                  Your Email Address
                </label>
                <Input
                  type="email"
                  placeholder="architect@studio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-border bg-muted/30 focus-visible:ring-primary h-11 px-3.5 text-sm"
                  required
                />
              </div>

              <div className="bg-muted/40 border-border/60 flex flex-col gap-2 rounded-xl border p-3.5 text-xs">
                <div className="text-foreground flex items-center gap-2 font-semibold">
                  <ShieldCheck className="text-primary h-4 w-4" />
                  What is included in your 14-Day Trial:
                </div>
                <ul className="text-muted-foreground list-disc space-y-1 pl-6">
                  <li>Full SketchUp Plugin (.rbz) extension</li>
                  <li>Unlimited 4K photorealistic image renders</li>
                  <li>Cinematic 3D video walkthroughs</li>
                  <li>No GPU or High RAM hardware required</li>
                </ul>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="mt-1 h-12 w-full gap-2 text-sm font-bold shadow-lg"
              >
                {loading ? (
                  "Activating 14-Day Trial..."
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Activate 14-Day Free Trial & Download Plugin
                  </>
                )}
              </Button>
              <p className="text-muted-foreground text-center text-[11px]">
                Instant download of{" "}
                <code className="text-foreground font-mono">
                  aisoft_render.rbz
                </code>
              </p>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-foreground text-xl font-bold">
                14-Day Free Trial Activated!
              </h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                Your 14-day unlimited trial for{" "}
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
