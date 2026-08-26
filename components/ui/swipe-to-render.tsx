import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronsRight, RefreshCw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeToRenderProps {
  onSwipeComplete: () => void;
  isRendering?: boolean;
  renderProgress?: number;
  disabled?: boolean;
  className?: string;
}

export function SwipeToRender({
  onSwipeComplete,
  isRendering = false,
  renderProgress = 0,
  disabled = false,
  className = "",
}: SwipeToRenderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragX, setDragX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const maxDragRef = useRef<number>(0);

  // Measure track width dynamically
  const updateMaxDrag = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const knobWidth = 42; // knob width + padding
      maxDragRef.current = Math.max(0, containerWidth - knobWidth - 8);
    }
  }, []);

  useEffect(() => {
    updateMaxDrag();
    window.addEventListener("resize", updateMaxDrag);
    return () => window.removeEventListener("resize", updateMaxDrag);
  }, [updateMaxDrag]);

  // Reset upon render completion
  useEffect(() => {
    if (!isRendering && isComplete) {
      setIsComplete(false);
      setDragX(0);
    }
  }, [isRendering, isComplete]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || isRendering || isComplete) return;
    updateMaxDrag();
    setIsDragging(true);
    startXRef.current = e.clientX - dragX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled || isRendering || isComplete) return;
    const currentX = e.clientX - startXRef.current;
    const clampedX = Math.max(0, Math.min(currentX, maxDragRef.current));
    setDragX(clampedX);

    // If dragged >= 86% of track, trigger swipe complete
    if (maxDragRef.current > 0 && clampedX >= maxDragRef.current * 0.86) {
      setIsDragging(false);
      setIsComplete(true);
      setDragX(maxDragRef.current);
      onSwipeComplete();
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!isComplete) {
      // Spring back to start
      setDragX(0);
    }
  };

  const progressFraction =
    maxDragRef.current > 0 ? Math.min(1, dragX / maxDragRef.current) : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-12 w-full overflow-hidden rounded-full border border-white/20 bg-gradient-to-r from-zinc-950 via-[#0e0e14] to-zinc-950 p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 select-none",
        isRendering &&
          "border-cyan-500/40 bg-zinc-950 shadow-[0_0_24px_rgba(34,211,238,0.2)]",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
      style={{ touchAction: "none" }}
    >
      {/* Glowing Filled Trail */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500/25 via-indigo-500/35 to-white/30 transition-all"
        style={{
          width: isRendering ? "100%" : `${dragX + 44}px`,
          opacity: isRendering ? 0.35 : progressFraction * 0.9,
        }}
      />

      {/* Shimmering Center Label */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
        {isRendering ? (
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
            <span className="tracking-wide">
              Rendering 4K ({renderProgress}%)...
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-zinc-300 uppercase transition-opacity duration-200"
            style={{
              opacity: Math.max(0.12, 1 - progressFraction * 1.6),
            }}
          >
            <span className="bg-gradient-to-r from-zinc-300 via-white to-zinc-300 bg-clip-text text-transparent">
              Slide to Render
            </span>
            {/* Animated Pulsing Arrows Asking to Swipe */}
            <span className="ml-1 inline-flex items-center gap-0.5 text-sm">
              <span className="animate-[pulse_1.2s_ease-in-out_infinite] font-bold text-cyan-400">
                ›
              </span>
              <span className="animate-[pulse_1.2s_ease-in-out_infinite_200ms] font-bold text-white">
                ›
              </span>
              <span className="animate-[pulse_1.2s_ease-in-out_infinite_400ms] font-bold text-zinc-500">
                ›
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Luxury Glossy White Swiper Knob */}
      {!isRendering && (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={cn(
            "relative z-10 flex h-10 w-10 cursor-grab items-center justify-center rounded-full border border-white/90 bg-white text-zinc-950 shadow-[0_2px_14px_rgba(255,255,255,0.4),0_0_20px_rgba(99,102,241,0.25)] transition-shadow duration-200 hover:scale-105 active:scale-95 active:cursor-grabbing",
            isDragging && "scale-105 shadow-[0_0_25px_rgba(255,255,255,0.85)]"
          )}
          style={{
            transform: `translateX(${dragX}px)`,
            transition: isDragging
              ? "none"
              : "transform 0.35s cubic-bezier(0.2, 1, 0.3, 1)",
          }}
        >
          {/* Animated Chevrons inside Knob */}
          <div className="relative flex items-center justify-center">
            <ChevronsRight className="h-5 w-5 text-zinc-950 transition-transform duration-200 group-hover:translate-x-0.5" />
            <span className="pointer-events-none absolute -inset-1 animate-pulse rounded-full bg-cyan-400/25 blur-xs" />
          </div>
        </div>
      )}
    </div>
  );
}

export default SwipeToRender;
