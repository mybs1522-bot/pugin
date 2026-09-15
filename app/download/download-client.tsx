"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Download,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  FolderDown,
  Monitor,
  Apple,
  ArrowRight,
  Laptop,
  Check,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadPricingModal } from "@/components/ui/download-pricing-modal";

export function DownloadClient() {
  const searchParams = useSearchParams();
  const platformParam = (
    searchParams.get("platform") === "mac" ? "mac" : "windows"
  ) as "windows" | "mac";

  const [isPaid, setIsPaid] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [downloadTriggered, setDownloadTriggered] = useState(false);
  const [copied, setCopied] = useState(false);

  const triggerDownload = () => {
    try {
      const a = document.createElement("a");
      a.href = "/v6_render.rbz";
      a.download = "v6_render.rbz";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadTriggered(true);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  useEffect(() => {
    const paidInStorage = localStorage.getItem("v6_is_paid") === "true";
    const paidInParam =
      searchParams.get("paid") === "true" ||
      searchParams.get("download") === "1";
    const alreadyPaid = paidInStorage || paidInParam;
    setIsPaid(alreadyPaid);

    if (!alreadyPaid) {
      setPricingOpen(true);
    } else {
      const timer = setTimeout(() => {
        triggerDownload();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handlePrimaryAction = () => {
    if (isPaid) {
      triggerDownload();
    } else {
      setPricingOpen(true);
    }
  };

  const copyUrl = () => {
    try {
      navigator.clipboard.writeText("https://www.v6render.com/download");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="selection:bg-primary min-h-screen bg-zinc-950 text-zinc-100 selection:text-white">
      <DownloadPricingModal
        open={pricingOpen}
        onOpenChange={(open) => {
          setPricingOpen(open);
          if (
            !open &&
            typeof window !== "undefined" &&
            localStorage.getItem("v6_is_paid") === "true"
          ) {
            setIsPaid(true);
            setDownloadTriggered(true);
          }
        }}
        platform={platformParam}
      />
      {/* Top Simple Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base font-black text-zinc-950 shadow-sm">
              V6
            </div>
            <span className="text-base font-extrabold tracking-tight text-white">
              V6 Render
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-zinc-400 transition-colors hover:text-white"
            >
              ← Back to Home
            </Link>
            <a
              href="mailto:support@avada.space"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:text-white"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Need Help?</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Hero / Download Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>
              {isPaid
                ? "7-Day Free Trial Active · Plugin Ready"
                : "7-Day Free Trial · $0 Due Today"}
            </span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
            Install V6 Render for SketchUp
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {isPaid
              ? "Your download should start automatically. Follow the 3 quick steps below to load the extension into SketchUp and start photorealistic cloud rendering."
              : "Start your 7-day free trial ($0 due today) to download the v6_render.rbz extension and unlock unlimited photorealistic cloud rendering in SketchUp."}
          </p>

          {/* Primary Download Button & File Info */}
          <div className="flex flex-col items-center justify-center gap-3 pt-2 pb-4">
            <Button
              size="lg"
              onClick={handlePrimaryAction}
              className="h-14 cursor-pointer gap-3 rounded-xl bg-white px-8 text-base font-extrabold text-zinc-950 shadow-xl transition-all hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.99]"
            >
              {isPaid ? (
                <>
                  <Download
                    className="h-5 w-5 text-zinc-950"
                    strokeWidth={2.5}
                  />
                  <span>Download v6_render.rbz</span>
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5 text-zinc-950" strokeWidth={2.5} />
                  <span>Start 7-Day Free Trial &amp; Download</span>
                </>
              )}
              <span className="rounded-md bg-zinc-200 px-2 py-0.5 text-xs font-bold text-zinc-800">
                710 KB
              </span>
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="h-3.5 w-3.5" /> Universal .rbz package
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Monitor className="h-3.5 w-3.5 text-zinc-400" /> Windows
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Apple className="h-3.5 w-3.5 text-zinc-400" /> macOS (Apple
                Silicon &amp; Intel)
              </span>
              <span>•</span>
              <span>SketchUp 2021 – 2026</span>
            </div>

            {downloadTriggered && (
              <p className="animate-fade-in text-xs text-zinc-500">
                ✓ Download triggered. Check your browser’s Downloads folder if
                not visible.
              </p>
            )}
          </div>
        </div>

        {/* Mobile Device Callout Banner */}
        <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200/90 sm:flex-row sm:items-center sm:text-sm">
          <div className="flex items-start gap-2.5">
            <Laptop className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold text-white">
                Reading this on your phone?
              </span>{" "}
              SketchUp plugins must be installed on your desktop computer. Tap
              copy link below and open it on your PC or Mac.
            </div>
          </div>
          <button
            onClick={copyUrl}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 transition-all hover:bg-amber-500/20"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied!
              </>
            ) : (
              <>Copy Link to Computer</>
            )}
          </button>
        </div>

        {/* 3-Step Installation Visual Guide */}
        <section className="mt-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-white sm:text-xl">
              <Sparkles className="text-primary h-5 w-5" />
              <span>3-Step Installation Guide in SketchUp</span>
            </h2>
            <span className="text-xs text-zinc-500">Takes ~60 seconds</span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative space-y-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-sm font-black text-white">
                  1
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                  Menu Bar
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Open Extension Manager
              </h3>
              <p className="text-xs leading-relaxed text-zinc-400">
                Open SketchUp on your computer. In the top application menu,
                click:
              </p>
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950 p-2.5 font-mono text-xs text-zinc-200">
                Extensions → Extension Manager
              </div>
              <p className="text-[11px] text-zinc-500 italic">
                (On older SketchUp versions: Window → Extension Manager)
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative space-y-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-sm font-black text-white">
                  2
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                  Install .rbz
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Install Extension
              </h3>
              <p className="text-xs leading-relaxed text-zinc-400">
                In the bottom-left corner of Extension Manager, click the blue
                button:
              </p>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950 p-2.5 text-xs font-semibold text-emerald-400">
                <span>&quot;Install Extension&quot;</span>
                <span className="text-[11px] font-normal text-zinc-400">
                  Select v6_render.rbz
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Browse to your computer’s <strong>Downloads</strong> folder and
                select <code className="text-zinc-300">v6_render.rbz</code>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative space-y-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-sm font-black text-white">
                  3
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                  Start Rendering
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Sign In &amp; Render
              </h3>
              <p className="text-xs leading-relaxed text-zinc-400">
                The <strong>V6 Render</strong> toolbar will instantly appear in
                SketchUp.
              </p>
              <div className="space-y-1 rounded-lg border border-zinc-800/80 bg-zinc-950 p-2.5 text-xs text-zinc-300">
                <p>1. Enter your registered account email</p>
                <p>2. Type the 4-digit code sent to your inbox</p>
              </div>
              <p className="text-[11px] text-zinc-500">
                You now have unlimited 4K cloud rendering unlocked!
              </p>
            </div>
          </div>
        </section>

        {/* FAQ / Troubleshooting Section */}
        <section className="mt-10 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="flex items-center gap-2 text-base font-bold text-white">
            <HelpCircle className="h-4 w-4 text-zinc-400" />
            <span>Frequently Asked Questions &amp; Troubleshooting</span>
          </h3>

          <div className="grid gap-4 text-xs text-zinc-400 sm:grid-cols-2">
            <div className="space-y-1.5 rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-3.5">
              <h4 className="font-bold text-zinc-200">
                Where did the downloaded file go?
              </h4>
              <p className="leading-relaxed">
                By default, your browser saves files to your computer’s{" "}
                <strong className="text-zinc-300">Downloads</strong> folder.
                Look for <code className="text-zinc-300">v6_render.rbz</code>.
              </p>
            </div>

            <div className="space-y-1.5 rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-3.5">
              <h4 className="font-bold text-zinc-200">
                Did Safari or Mac rename it to .zip?
              </h4>
              <p className="leading-relaxed">
                Some macOS browsers automatically rename `.rbz` to `.zip`. If
                so, simply rename the extension back to{" "}
                <code className="text-zinc-300">.rbz</code> before installing in
                SketchUp.
              </p>
            </div>

            <div className="space-y-1.5 rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-3.5">
              <h4 className="font-bold text-zinc-200">
                Does it work on Mac M1 / M2 / M3 / M4?
              </h4>
              <p className="leading-relaxed">
                Yes! V6 Render is 100% universal and runs natively on both Apple
                Silicon and Intel Macs, as well as Windows 10 &amp; 11.
              </p>
            </div>

            <div className="space-y-1.5 rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-3.5">
              <h4 className="font-bold text-zinc-200">
                Still have questions or need help?
              </h4>
              <p className="leading-relaxed">
                Reply directly to your welcome email or reach our 24/7 technical
                team at{" "}
                <a
                  href="mailto:support@avada.space"
                  className="text-white underline hover:text-zinc-200"
                >
                  support@avada.space
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-zinc-900 pt-6 text-center text-xs text-zinc-600">
          <p>© 2026 V6 Render. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
