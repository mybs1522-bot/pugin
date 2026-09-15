import React, { useState, useRef, useCallback } from 'react';
import { ChevronsLeftRight, Sparkles, Box } from 'lucide-react';

interface SplitCompareProps {
  originalUrl: string;
  renderedUrl: string;
}

export function SplitCompare({ originalUrl, renderedUrl }: SplitCompareProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      className="relative h-full w-full select-none overflow-hidden rounded-xl bg-zinc-950 flex items-center justify-center cursor-ew-resize"
    >
      {/* After / Rendered Image (Base) */}
      <img
        src={renderedUrl}
        alt="AI Rendered View"
        className="h-full w-full object-contain pointer-events-none"
      />

      {/* Before / CAD Viewport (Clipped by slider position) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={originalUrl}
          alt="Original CAD Viewport"
          className="absolute top-0 left-0 h-full w-full object-contain max-w-none pointer-events-none"
          style={{ width: containerRef.current?.clientWidth || '100%' }}
        />
      </div>

      {/* Split Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.75)] z-20"
        style={{ left: `${sliderPos}%` }}
        onMouseDown={handleMouseDown}
      >
        {/* Handle Knob */}
        <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-950 shadow-xl ring-2 ring-black/40">
          <ChevronsLeftRight className="h-4 w-4" />
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold tracking-wider text-zinc-300 uppercase backdrop-blur-md">
        <Box className="h-3 w-3 text-zinc-400" />
        <span>CAD Viewport</span>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-400 uppercase backdrop-blur-md">
        <Sparkles className="h-3 w-3 text-emerald-400" />
        <span>4K AI Render</span>
      </div>
    </div>
  );
}
