"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlatformBadge } from "@/components/ui/platform-icons";

interface SectionCTAProps {
  className?: string;
  subtext?: string;
}

export function SectionCTA({
  className = "",
  subtext = "7-Day Free Trial · Cancel anytime",
}: SectionCTAProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-3 sm:py-5 ${className}`}
    >
      {/* Windows & Mac icons */}
      <PlatformBadge className="mb-2" />

      {/* 3D Rectangular Tactile CTA Button */}
      <Link href="/download">
        <motion.button
          animate={{ scale: [1, 1.02, 1] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ y: 2, scale: 0.99 }}
          className="group relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-b-[4px] border-zinc-700/80 border-b-black bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 px-6 py-2.5 text-xs font-bold tracking-wide text-white shadow-[0_6px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all select-none hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] hover:brightness-110 active:border-b-[2px] active:shadow-[0_2px_8px_rgba(0,0,0,0.2)] sm:rounded-2xl sm:px-8 sm:py-3 sm:text-sm"
        >
          <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            Download Plugin
          </span>
        </motion.button>
      </Link>

      {/* Subtext */}
      {subtext && (
        <p className="text-muted-foreground mt-2 text-center text-[11px] font-medium sm:text-xs">
          {subtext}
        </p>
      )}
    </div>
  );
}
