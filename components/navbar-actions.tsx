"use client";

import { useState } from "react";
import Link from "next/link";
import { DownloadPricingModal } from "@/components/ui/download-pricing-modal";

export function NavbarActions() {
  const [pricingOpen, setPricingOpen] = useState(false);

  return (
    <>
      <DownloadPricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/auth/signin"
          className="text-muted-foreground hover:text-foreground hidden text-xs font-medium transition-colors sm:inline-block sm:text-sm"
        >
          Sign In
        </Link>
        <button
          onClick={() => setPricingOpen(true)}
          className="hidden cursor-pointer items-center justify-center rounded-lg border border-b-[2px] border-zinc-700/80 border-b-black bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110 active:translate-y-[1px] sm:inline-flex sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs"
        >
          Download Plugin
        </button>
      </div>
    </>
  );
}
