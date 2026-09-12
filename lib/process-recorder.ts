/**
 * Background Process Recorder for V6 Render (/new)
 * Silently records the end-to-end rendering journey without browser permissions or UI indicators.
 * Saves the resulting video blob to IndexedDB for use in /ad.
 */

import { setAsset } from "./storage";

export interface ProcessRecorderOptions {
  viewportUrl: string;
  renderUrl: string;
  videoUrl?: string;
  roomType?: string;
  style?: string;
  onFinish?: (blob: Blob) => void;
}

export class ProcessRecorder {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  public isRecording = false;
  private animFrameId: number | null = null;
  private startTime = 0;
  private options: ProcessRecorderOptions;
  private isStopped = false;

  private imgVp: HTMLImageElement | null = null;
  private imgRnd: HTMLImageElement | null = null;
  private videoEl: HTMLVideoElement | null = null;

  constructor(options: ProcessRecorderOptions) {
    this.options = options;
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1280;
    this.canvas.height = 720;
    this.ctx = this.canvas.getContext("2d");
  }

  public async start(): Promise<void> {
    if (this.isRecording || this.isStopped || typeof window === "undefined")
      return;

    // Draw initial frame immediately to initialize canvas stream
    this.drawFrame(0);

    const stream = this.canvas.captureStream
      ? this.canvas.captureStream(30)
      : null;
    if (!stream || typeof MediaRecorder === "undefined") {
      console.warn("[ProcessRecorder] Stream capture unavailable");
      return;
    }

    let mimeType = "video/webm;codecs=vp9";
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/webm";
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/mp4";

    try {
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      this.recordedChunks = [];
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.isRecording = true;
      this.startTime = Date.now();
      // Request data chunks every 250ms so chunks are continuously collected
      this.mediaRecorder.start(250);
      this.renderLoop();

      // Load images in background without blocking recording start
      this.loadAssetsAsync();
    } catch (e) {
      console.warn("[ProcessRecorder] Start error:", e);
    }
  }

  private async loadAssetsAsync() {
    const loadImg = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => {
          const fb = new Image();
          fb.src = src;
          fb.onload = () => resolve(fb);
          fb.onerror = () => resolve(img);
        };
        img.src = src;
      });
    };

    try {
      const [vp, rnd] = await Promise.all([
        loadImg(this.options.viewportUrl),
        loadImg(this.options.renderUrl),
      ]);
      this.imgVp = vp;
      this.imgRnd = rnd;
    } catch (_) {}

    if (this.options.videoUrl) {
      try {
        const v = document.createElement("video");
        v.crossOrigin = "anonymous";
        v.muted = true;
        v.playsInline = true;
        v.src = this.options.videoUrl;
        v.load();
        v.play().catch(() => {});
        this.videoEl = v;
      } catch (_) {}
    }
  }

  private renderLoop = () => {
    if (!this.isRecording || !this.ctx) return;

    const elapsed = (Date.now() - this.startTime) / 1000;
    this.drawFrame(elapsed);

    // Auto-complete at 4.2 seconds to produce a fast, punchy ad sequence
    if (elapsed >= 4.2) {
      this.stop();
      return;
    }

    this.animFrameId = requestAnimationFrame(this.renderLoop);
  };

  private drawFrame(t: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, w, h);

    // Sequence timing (4.2 seconds total):
    // 0.0s..0.8s: Splash Screen Loader (0% to 100%)
    // 0.8s..1.8s: Raw SketchUp Viewport Scene
    // 1.8s..3.0s: GPU 4K Path-Tracing Passes & Telemetry
    // 3.0s..4.2s: Interactive Split Slider & 3D Walkthrough
    if (t < 0.8) {
      this.drawSplashPhase(ctx, w, h, t / 0.8);
    } else if (t < 1.8) {
      this.drawViewportPhase(ctx, w, h, (t - 0.8) / 1.0);
    } else if (t < 3.0) {
      this.drawRenderPhase(ctx, w, h, (t - 1.8) / 1.2);
    } else {
      this.drawSliderPhase(ctx, w, h, (t - 3.0) / 1.2);
    }

    // Discreet watermark
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("V6 RENDER • AUTOMATED 4K PIPELINE", w - 24, h - 16);
    ctx.restore();
  }

  private drawSplashPhase(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    progressRatio: number
  ) {
    const grad = ctx.createRadialGradient(
      w / 2,
      h / 2,
      20,
      w / 2,
      h / 2,
      w / 1.5
    );
    grad.addColorStop(0, "#181824");
    grad.addColorStop(1, "#09090b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 - 40;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "rgba(99, 102, 241, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 36px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("V6", cx, cy);
    ctx.restore();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("V6 Render for SketchUp", cx, cy + 80);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "14px sans-serif";
    const status =
      progressRatio < 0.4
        ? "Connecting to SketchUp 2024 Viewport..."
        : progressRatio < 0.8
          ? "Syncing Camera & Model Geometry..."
          : "Initializing AI Neural Denoising Pipeline...";
    ctx.fillText(status, cx, cy + 110);

    const barW = 340;
    const barH = 6;
    const barX = cx - barW / 2;
    const barY = cy + 135;

    ctx.fillStyle = "#27272a";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 3);
    ctx.fill();

    const filledW = Math.min(barW, barW * Math.min(progressRatio * 1.15, 1));
    ctx.fillStyle = "#6366f1";
    ctx.beginPath();
    ctx.roundRect(barX, barY, filledW, barH, 3);
    ctx.fill();
  }

  private drawViewportPhase(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    p: number
  ) {
    if (this.imgVp) {
      this.drawImageContain(ctx, this.imgVp, 40, 60, w - 80, h - 120);
    } else {
      this.drawPlaceholderGrid(
        ctx,
        40,
        60,
        w - 80,
        h - 120,
        "Raw SketchUp Model"
      );
    }
    this.drawFloatingTag(ctx, 40, 24, "1. SketchUp Viewport (Raw)", "#3b82f6");
    this.drawFloatingTag(ctx, w - 240, 24, "Active Camera Sync", "#10b981");
  }

  private drawRenderPhase(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    p: number
  ) {
    if (this.imgVp && this.imgRnd) {
      this.drawImageContain(
        ctx,
        p < 0.5 ? this.imgVp : this.imgRnd,
        40,
        60,
        w - 80,
        h - 120
      );
    } else if (this.imgRnd) {
      this.drawImageContain(ctx, this.imgRnd, 40, 60, w - 80, h - 120);
    } else {
      this.drawPlaceholderGrid(
        ctx,
        40,
        60,
        w - 80,
        h - 120,
        "4K Raytracing Pipeline"
      );
    }

    // Raytracing bucket animation
    const gridCols = 8;
    const gridRows = 5;
    const tileW = (w - 80) / gridCols;
    const tileH = (h - 120) / gridRows;
    const totalTiles = gridCols * gridRows;
    const activeTileIdx = Math.floor(p * totalTiles);

    ctx.save();
    for (let i = 0; i < totalTiles; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const tx = 40 + col * tileW;
      const ty = 60 + row * tileH;

      if (i === activeTileIdx) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.strokeRect(tx, ty, tileW, tileH);
        ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
        ctx.fillRect(tx, ty, tileW, tileH);
      }
    }
    ctx.restore();

    const currentPass = Math.min(64, Math.floor(p * 64) + 1);
    const spp = Math.floor(p * 1024);
    const rays = (p * 68.4).toFixed(1);

    this.drawFloatingTag(
      ctx,
      40,
      24,
      `Pass ${currentPass}/64 • SPP: ${spp} • Rays: ${rays}M`,
      "#f59e0b"
    );
    this.drawFloatingTag(
      ctx,
      w - 280,
      24,
      p > 0.8 ? "OptiX AI Denoising..." : "Path Tracing 4K...",
      "#8b5cf6"
    );
  }

  private drawSliderPhase(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    p: number
  ) {
    const marginX = 40;
    const marginY = 60;
    const viewW = w - marginX * 2;
    const viewH = h - marginY * 2;

    if (this.imgRnd) {
      this.drawImageContain(ctx, this.imgRnd, marginX, marginY, viewW, viewH);
    }

    if (this.imgVp) {
      const sliderPercent = 20 + 60 * (0.5 - 0.5 * Math.cos(p * Math.PI * 2));
      const splitX = marginX + (sliderPercent / 100) * viewW;

      ctx.save();
      ctx.beginPath();
      ctx.rect(marginX, marginY, splitX - marginX, viewH);
      ctx.clip();
      this.drawImageContain(ctx, this.imgVp, marginX, marginY, viewW, viewH);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(splitX, marginY);
      ctx.lineTo(splitX, marginY + viewH);
      ctx.stroke();

      const cy = marginY + viewH / 2;
      ctx.fillStyle = "#09090b";
      ctx.beginPath();
      ctx.arc(splitX, cy, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("❮ ❯", splitX, cy);
      ctx.restore();
    }

    this.drawFloatingTag(ctx, marginX, 24, "Raw SketchUp Viewport", "#3b82f6");
    this.drawFloatingTag(ctx, w - 240, 24, "4K Photoreal Output", "#10b981");
  }

  private drawPlaceholderGrid(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    title: string
  ) {
    ctx.save();
    ctx.fillStyle = "#121217";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#27272a";
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = "#71717a";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, x + w / 2, y + h / 2);
    ctx.restore();
  }

  private drawImageContain(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    try {
      const nw = img.naturalWidth || img.width || 1024;
      const nh = img.naturalHeight || img.height || 555;
      const r = Math.min(w / nw, h / nh);
      const dw = nw * r;
      const dh = nh * r;
      const dx = x + (w - dw) / 2;
      const dy = y + (h - dh) / 2;

      ctx.drawImage(img, 0, 0, nw, nh, dx, dy, dw, dh);
    } catch (_) {
      this.drawPlaceholderGrid(ctx, x, y, w, h, "Active Viewport");
    }
  }

  private drawFloatingTag(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    accentColor: string
  ) {
    ctx.save();
    ctx.font = "bold 12px sans-serif";
    const textW = ctx.measureText(text).width;
    const padX = 12;
    const boxW = textW + padX * 2 + 10;
    const boxH = 26;

    ctx.fillStyle = "rgba(18, 18, 22, 0.85)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(x + 14, y + boxH / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + 24, y + boxH / 2);
    ctx.restore();
  }

  public updateAssets(
    viewportUrl?: string,
    renderUrl?: string,
    videoUrl?: string
  ) {
    if (viewportUrl) this.options.viewportUrl = viewportUrl;
    if (renderUrl) this.options.renderUrl = renderUrl;
    if (videoUrl) this.options.videoUrl = videoUrl;
    this.loadAssetsAsync();
  }

  public stop(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (this.isStopped) {
        resolve(null);
        return;
      }
      this.isStopped = true;
      this.isRecording = false;

      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      if (this.videoEl) {
        try {
          this.videoEl.pause();
        } catch (_) {}
        this.videoEl = null;
      }

      const notifyAdStudio = () => {
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          try {
            const bc = new BroadcastChannel("v6_recordings");
            bc.postMessage({ type: "RECORDING_SAVED" });
            bc.close();
          } catch (_) {}
        }
      };

      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.onstop = async () => {
          const finalBlob = new Blob(this.recordedChunks, {
            type: this.mediaRecorder?.mimeType || "video/webm",
          });
          try {
            await setAsset("custom_process_recording", finalBlob);
            const meta = {
              duration: Date.now() - this.startTime,
              createdAt: Date.now(),
              roomType: this.options.roomType || "Living Room",
              style: this.options.style || "Modern",
            };
            await setAsset("custom_process_recording_meta", meta);
            notifyAdStudio();
            if (this.options.onFinish) {
              this.options.onFinish(finalBlob);
            }
          } catch (_) {}
          resolve(finalBlob);
        };
        try {
          this.mediaRecorder.stop();
        } catch (_) {
          resolve(null);
        }
      } else if (this.recordedChunks.length > 0) {
        const finalBlob = new Blob(this.recordedChunks, {
          type: "video/webm",
        });
        setAsset("custom_process_recording", finalBlob)
          .then(() => {
            notifyAdStudio();
          })
          .catch(() => {});
        if (this.options.onFinish) {
          this.options.onFinish(finalBlob);
        }
        resolve(finalBlob);
      } else {
        resolve(null);
      }
    });
  }
}
