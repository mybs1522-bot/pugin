"use client";

import React, { useEffect, useRef, useState } from "react";

export interface ProcessVideoPlayerProps {
  viewportUrl?: string;
  renderUrl?: string;
  videoUrl?: string;
  blobUrl?: string | null;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  className?: string;
  isThumbnail?: boolean;
}

const DEFAULT_VIEWPORT = "/sketchup-design-sample.png";
const DEFAULT_RENDER = "/images/space-interior.jpg";
const DEFAULT_VIDEO = "/sample-walkthrough.mp4";

export function ProcessVideoPlayer({
  viewportUrl = DEFAULT_VIEWPORT,
  renderUrl = DEFAULT_RENDER,
  videoUrl = DEFAULT_VIDEO,
  blobUrl = null,
  isPlaying = true,
  onTogglePlay,
  className = "h-full w-full",
  isThumbnail = false,
}: ProcessVideoPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoCanPlay, setVideoCanPlay] = useState<boolean>(false);
  const [phaseText, setPhaseText] = useState<string>(
    "Initializing Viewport..."
  );

  // Asset images for the canvas player
  const vpImgRef = useRef<HTMLImageElement | null>(null);
  const rndImgRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const intervalRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());
  const isPausedRef = useRef<boolean>(!isPlaying);

  isPausedRef.current = !isPlaying;

  // Preload images safely
  useEffect(() => {
    let active = true;

    const loadSafe = (
      url: string,
      fallback: string
    ): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => {
          const fb = new Image();
          fb.src = fallback;
          fb.onload = () => resolve(fb);
          fb.onerror = () => resolve(img);
        };
        img.src = url || fallback;
      });
    };

    Promise.all([
      loadSafe(viewportUrl, DEFAULT_VIEWPORT),
      loadSafe(renderUrl, DEFAULT_RENDER),
    ]).then(([vp, rnd]) => {
      if (!active) return;
      vpImgRef.current = vp;
      rndImgRef.current = rnd;
    });

    return () => {
      active = false;
    };
  }, [viewportUrl, renderUrl]);

  // Handle blobUrl change
  useEffect(() => {
    if (!blobUrl) {
      setVideoCanPlay(false);
      return;
    }
    setVideoCanPlay(false);
  }, [blobUrl]);

  // Main Canvas Render Loop (0.0s to 9.2s loop)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    startTimeRef.current = Date.now();

    const TOTAL_DURATION = 9.2; // seconds

    const render = () => {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      const elapsed =
        ((Date.now() - startTimeRef.current) / 1000) % TOTAL_DURATION;

      // 1. Clear background
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, w, h);

      const vp = vpImgRef.current;
      const rnd = rndImgRef.current;

      // PHASE 1: Splash Loader (0.0s..1.4s)
      if (elapsed < 1.4) {
        setPhaseText("1/4: Initializing V6 Engine");
        const p = elapsed / 1.4;

        // Radial glow
        const grad = ctx.createRadialGradient(
          w / 2,
          h / 2,
          20,
          w / 2,
          h / 2,
          w / 1.6
        );
        grad.addColorStop(0, "#181827");
        grad.addColorStop(1, "#09090b");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Logo circle
        const cx = w / 2;
        const cy = h / 2 - (isThumbnail ? 15 : 35);
        const radius = isThumbnail ? 22 : 44;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
        ctx.fill();
        ctx.strokeStyle = "rgba(16, 185, 129, 0.7)";
        ctx.lineWidth = isThumbnail ? 1.5 : 2.5;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = `900 ${isThumbnail ? "18px" : "32px"} sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("V6", cx, cy);
        ctx.restore();

        if (!isThumbnail) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 20px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("V6 Render for SketchUp", cx, cy + 65);

          ctx.fillStyle = "#94a3b8";
          ctx.font = "12px sans-serif";
          ctx.fillText(
            p < 0.5
              ? "Connecting to SketchUp Active Viewport..."
              : "Syncing Model Surfaces & Photoreal Shaders...",
            cx,
            cy + 92
          );

          // Progress Bar
          const barW = Math.min(280, w - 80);
          const barH = 5;
          const barX = cx - barW / 2;
          const barY = cy + 115;

          ctx.fillStyle = "#27272a";
          ctx.beginPath();
          ctx.roundRect(barX, barY, barW, barH, 3);
          ctx.fill();

          ctx.fillStyle = "#10b981";
          ctx.beginPath();
          ctx.roundRect(barX, barY, barW * Math.min(p * 1.15, 1), barH, 3);
          ctx.fill();
        }
      }
      // PHASE 2: Raw SketchUp Viewport (1.4s..3.2s)
      else if (elapsed < 3.2) {
        setPhaseText("2/4: SketchUp Viewport Sync");
        const p = (elapsed - 1.4) / 1.8;

        if (vp && vp.complete && vp.naturalWidth > 0) {
          drawContain(ctx, vp, 0, 0, w, h);
        } else {
          drawPlaceholder(ctx, w, h, "Raw SketchUp Model");
        }

        if (!isThumbnail) {
          drawBadge(ctx, 24, 24, "Raw Viewport", "#3b82f6");
          drawBadge(ctx, w - 170, 24, "Active Camera Sync", "#10b981");
        }
      }
      // PHASE 3: 4K Raytracing AI Passes (3.2s..5.6s)
      else if (elapsed < 5.6) {
        setPhaseText("3/4: 4K OptiX Raytracing");
        const p = (elapsed - 3.2) / 2.4;

        if (p < 0.35 && vp && vp.complete) {
          drawContain(ctx, vp, 0, 0, w, h);
        } else if (rnd && rnd.complete && rnd.naturalWidth > 0) {
          drawContain(ctx, rnd, 0, 0, w, h);
        } else if (vp && vp.complete) {
          drawContain(ctx, vp, 0, 0, w, h);
        }

        // Raytracing bucket scanning grid
        const cols = isThumbnail ? 4 : 8;
        const rows = isThumbnail ? 3 : 5;
        const cellW = w / cols;
        const cellH = h / rows;
        const total = cols * rows;
        const activeIdx = Math.floor(p * total);

        ctx.save();
        for (let i = 0; i <= activeIdx; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const tx = col * cellW;
          const ty = row * cellH;

          if (i === activeIdx) {
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = isThumbnail ? 1.5 : 2.5;
            ctx.strokeRect(tx, ty, cellW, cellH);
            ctx.fillStyle = "rgba(56, 189, 248, 0.3)";
            ctx.fillRect(tx, ty, cellW, cellH);
          }
        }
        ctx.restore();

        if (!isThumbnail) {
          const pass = Math.min(64, Math.floor(p * 64) + 1);
          drawBadge(ctx, 24, 24, `4K Path Tracing: Pass ${pass}/64`, "#38bdf8");
          drawBadge(ctx, w - 185, 24, "AI OptiX Denoise (RTX)", "#ec4899");
        }
      }
      // PHASE 4: Interactive Split Slider (5.6s..9.2s)
      else {
        setPhaseText("4/4: Photoreal Before vs After");
        const p = (elapsed - 5.6) / 3.6;

        // Under layer: 4K photoreal render
        if (rnd && rnd.complete && rnd.naturalWidth > 0) {
          drawContain(ctx, rnd, 0, 0, w, h);
        } else {
          drawPlaceholder(ctx, w, h, "4K Photoreal Render");
        }

        // Over layer: Raw viewport clipped to slider position
        const sliderPct = 15 + 70 * (0.5 - 0.5 * Math.cos(p * Math.PI * 2));
        const splitX = (sliderPct / 100) * w;

        if (vp && vp.complete && vp.naturalWidth > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, splitX, h);
          ctx.clip();
          drawContain(ctx, vp, 0, 0, w, h);
          ctx.restore();
        }

        // Split line
        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = isThumbnail ? 2 : 3;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, h);
        ctx.stroke();

        // Split circle knob
        const cy = h / 2;
        const knobR = isThumbnail ? 10 : 18;
        ctx.fillStyle = "#09090b";
        ctx.beginPath();
        ctx.arc(splitX, cy, knobR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = isThumbnail ? 1.5 : 2.5;
        ctx.stroke();

        if (!isThumbnail) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("❮ ❯", splitX, cy);

          drawBadge(ctx, 24, 24, "Raw SketchUp", "#3b82f6");
          drawBadge(ctx, w - 170, 24, "4K Photoreal", "#10b981");
        }
        ctx.restore();
      }

      // Live Watermark Tag
      if (!isThumbnail) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.beginPath();
        ctx.roundRect(16, h - 34, 280, 24, 6);
        ctx.fill();
        ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#10b981";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("● RECORDED PROCESS FROM /new", 26, h - 18);
        ctx.restore();
      }

      if (!isPausedRef.current) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    // Fallback interval to keep animation running even in inactive tabs
    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current && (!animFrameRef.current || isThumbnail)) {
        render();
      }
    }, 45);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isThumbnail]);

  function drawContain(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    try {
      const nw = img.naturalWidth || img.width || 1280;
      const nh = img.naturalHeight || img.height || 720;
      const r = Math.max(w / nw, h / nh);
      const dw = nw * r;
      const dh = nh * r;
      const dx = x + (w - dw) / 2;
      const dy = y + (h - dh) / 2;
      ctx.drawImage(img, 0, 0, nw, nh, dx, dy, dw, dh);
    } catch (_) {
      drawPlaceholder(ctx, w, h, "Active Viewport");
    }
  }

  function drawPlaceholder(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    label: string
  ) {
    ctx.save();
    ctx.fillStyle = "#121217";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#52525b";
    ctx.font = `bold ${isThumbnail ? "10px" : "14px"} sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, w / 2, h / 2);
    ctx.restore();
  }

  function drawBadge(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    color: string
  ) {
    ctx.save();
    ctx.font = "bold 11px sans-serif";
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.beginPath();
    ctx.roundRect(x, y, tw + 18, 22, 5);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.fillText(text, x + 9, y + 15);
    ctx.restore();
  }

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {/* Real Video element if valid blob exists and can play */}
      {blobUrl && (
        <video
          ref={videoRef}
          src={blobUrl}
          muted
          playsInline
          loop
          autoPlay={isPlaying}
          onCanPlay={() => setVideoCanPlay(true)}
          onError={() => setVideoCanPlay(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            videoCanPlay ? "z-10 opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
      )}

      {/* Guaranteed Canvas Animation Engine (Always 100% active) */}
      <canvas
        ref={canvasRef}
        width={isThumbnail ? 480 : 1280}
        height={isThumbnail ? 270 : 720}
        className={`h-full w-full object-cover ${
          videoCanPlay ? "pointer-events-none" : "relative z-0"
        }`}
      />

      {/* Real-time Status Badge Overlay */}
      {!isThumbnail && (
        <div className="pointer-events-none absolute top-3 left-3 z-20 flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-black/85 px-2.5 py-1 text-[10px] font-bold text-emerald-400 shadow-lg backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span>{phaseText}</span>
          </div>
        </div>
      )}
    </div>
  );
}
