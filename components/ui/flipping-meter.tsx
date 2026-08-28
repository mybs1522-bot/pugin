"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";

function SplitFlapDigit({ digit }: { digit: string }) {
  if (digit === ",") {
    return (
      <div className="flex h-4.5 w-1 items-end justify-center pb-0.5 sm:h-5">
        <span className="font-mono text-[10px] font-black text-zinc-400 sm:text-[11px]">
          ,
        </span>
      </div>
    );
  }

  return (
    <div className="relative inline-flex h-4.5 w-3.5 flex-col items-center justify-center overflow-hidden rounded-[2.5px] border border-zinc-600/80 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black font-mono text-[10px] font-black text-white shadow-[0_1px_2px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.3)] sm:h-5 sm:w-4 sm:text-[11px]">
      {/* Subtle top metallic reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />

      {/* Subtle hairline split line */}
      <div className="pointer-events-none absolute top-1/2 left-0 z-20 h-[1px] w-full -translate-y-1/2 bg-black/40" />

      {/* 3D Flip Digit Display */}
      <div
        className="relative flex h-full w-full items-center justify-center"
        style={{ perspective: "250px" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={digit}
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: -90, opacity: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.23, 1, 0.32, 1],
            }}
            className="flex h-full w-full items-center justify-center select-none"
            style={{ transformStyle: "preserve-3d" }}
          >
            <span className="leading-none text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
              {digit}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function FlippingMeter() {
  const [count, setCount] = useState(8776);
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();

  // Stays fully visible in hero (0-400px), then smoothly fades away (400px-700px)
  const opacity = useTransform(scrollY, [0, 400, 700], [1, 1, 0]);
  const y = useTransform(scrollY, [0, 400, 700], [0, 0, 14]);
  const scale = useTransform(scrollY, [0, 400, 700], [1, 1, 0.94]);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      // Increase by 1-2 every 8 seconds
      const increment = Math.floor(Math.random() * 2) + 1; // 1 or 2
      setCount((prev) => prev + increment);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const formatted = count.toLocaleString("en-US");

  return (
    <motion.aside
      style={{ opacity, y, scale }}
      aria-label="Users Counter"
      className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transition-all select-none sm:bottom-6"
    >
      {/* Micro Floating Metallic Counter Pill */}
      <div className="flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-950/90 px-2 py-0.5 text-white shadow-xl backdrop-blur-md">
        {/* Metallic Frame Box */}
        <div className="flex items-center gap-[2px] rounded-[3px] border border-zinc-600/90 bg-zinc-900/90 px-1 py-[1.5px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.15)]">
          {formatted.split("").map((char, index) => (
            <SplitFlapDigit key={index} digit={char} />
          ))}
        </div>

        {/* Text After Meter */}
        <span className="pr-0.5 text-[9.5px] font-black tracking-wider text-zinc-200 uppercase sm:text-[10px]">
          Users
        </span>
      </div>
    </motion.aside>
  );
}
