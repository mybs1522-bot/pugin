"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Download,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  Layers,
  Sliders,
  Film,
  ArrowRight,
  Check,
  Copy,
  Share2,
  Eye,
  Video,
  Image as ImageIcon,
  Split,
  Monitor,
  Smartphone,
  Square,
  Wand2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { getAsset, setAsset } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { ProcessRecorder } from "@/lib/process-recorder";
import { ProcessVideoPlayer } from "./process-video-player";

const DEFAULT_VIEWPORT = "/sketchup-design-sample.png";
const DEFAULT_RENDER = "/images/space-interior.jpg";
const DEFAULT_VIDEO = "/sample-walkthrough.mp4";

const AD_HOOKS = [
  {
    id: "hook-1",
    title: "Stop Wasting 4 Hours",
    text: "Stop wasting 4 hours rendering in V-Ray 🤯\nWatch SketchUp turn into photoreal 4K in 10s!",
    tag: "Viral Hook",
  },
  {
    id: "hook-2",
    title: "No $4,000 GPU",
    text: "No $4,000 GPU workstations needed. Unlimited 4K cloud rendering for SketchUp 🚀",
    tag: "High CTR",
  },
  {
    id: "hook-3",
    title: "Before vs After",
    text: "Before: Raw SketchUp Viewport\nAfter: Photoreal 4K Luxury Render in 1-Click ✨",
    tag: "Comparison",
  },
  {
    id: "hook-4",
    title: "Architect Secret",
    text: "The SketchUp AI plugin top architectural visualization studios don't want you to know 🏢",
    tag: "Curiosity",
  },
];

const CTA_OPTIONS = [
  "Start 14-Day Free Trial ($0 Due Today)",
  "Download SketchUp Plugin Free (.rbz)",
  "Try V6 Render in SketchUp 2024",
  "Render Your Active Viewport Now",
];

export default function AdCreatorPage() {
  // Source Assets
  const [viewportImg, setViewportImg] = useState<string>(DEFAULT_VIEWPORT);
  const [renderImg, setRenderImg] = useState<string>(DEFAULT_RENDER);
  const [renderVideo, setRenderVideo] = useState<string>(DEFAULT_VIDEO);
  const [processVideoUrl, setProcessVideoUrl] = useState<string>("");
  const [isRecordingGenerating, setIsRecordingGenerating] =
    useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Ad Format & Config
  const [adFormat, setAdFormat] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const [mediaSource, setMediaSource] = useState<
    "process" | "walkthrough" | "compare" | "render"
  >("process");
  const [selectedHook, setSelectedHook] = useState<string>(AD_HOOKS[0].text);
  const [selectedCta, setSelectedCta] = useState<string>(CTA_OPTIONS[0]);
  const [showBadges, setShowBadges] = useState<boolean>(true);
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [customSubtitle, setCustomSubtitle] = useState<string>(
    "100% Cloud Rendered • 0 GPU Needed • 1-Click Install"
  );

  // Comparison slider position for compare mode
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(true);

  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // Load all assets from storage
  useEffect(() => {
    async function loadAssets() {
      try {
        const vp = await getAsset("custom_viewport_img");
        if (vp) setViewportImg(vp);

        const rnd = await getAsset("custom_render_img");
        if (rnd) setRenderImg(rnd);

        const vid = await getAsset("custom_render_video");
        if (vid) {
          if (vid instanceof Blob || vid instanceof File) {
            setRenderVideo(URL.createObjectURL(vid));
          } else if (typeof vid === "string") {
            setRenderVideo(vid);
          }
        }

        const proc = await getAsset("custom_process_recording");
        if (proc && (proc instanceof Blob || proc instanceof File)) {
          setProcessVideoUrl(URL.createObjectURL(proc));
        } else {
          generateProcessVideo(
            vp || DEFAULT_VIEWPORT,
            rnd || DEFAULT_RENDER,
            DEFAULT_VIDEO
          );
        }
      } catch (err) {
        console.error("Error loading assets for /ad:", err);
      }
    }
    loadAssets();
  }, []);

  // Listen for real-time recording completion from /new across browser tabs
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("v6_recordings");
        bc.onmessage = async (e) => {
          if (e.data?.type === "RECORDING_SAVED") {
            const proc = await getAsset("custom_process_recording");
            if (proc && (proc instanceof Blob || proc instanceof File)) {
              setProcessVideoUrl(URL.createObjectURL(proc));
              setIsRecordingGenerating(false);
            }
          }
        };
      } catch (_) {}
    }
    return () => {
      if (bc) bc.close();
    };
  }, []);

  // Active sync polling: ensure recorded video appears with 0 delay if saving was in flight
  useEffect(() => {
    if (processVideoUrl) return;
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts++;
      const proc = await getAsset("custom_process_recording");
      if (proc && (proc instanceof Blob || proc instanceof File)) {
        setProcessVideoUrl(URL.createObjectURL(proc));
        setIsRecordingGenerating(false);
        clearInterval(timer);
      } else if (attempts >= 10) {
        clearInterval(timer);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [processVideoUrl]);

  const generateProcessVideo = async (
    vpUrl: string,
    rndUrl: string,
    vidUrl: string
  ) => {
    setIsRecordingGenerating(true);
    try {
      const recorder = new ProcessRecorder({
        viewportUrl: vpUrl,
        renderUrl: rndUrl,
        videoUrl: vidUrl,
        onFinish: (blob) => {
          const url = URL.createObjectURL(blob);
          setProcessVideoUrl(url);
          setIsRecordingGenerating(false);
        },
      });
      await recorder.start();
      setTimeout(async () => {
        if (recorder.isRecording) {
          const finalBlob = await recorder.stop();
          if (finalBlob) {
            const url = URL.createObjectURL(finalBlob);
            setProcessVideoUrl(url);
          }
        }
        setIsRecordingGenerating(false);
      }, 4400);
    } catch (e) {
      console.warn("Process recording generator:", e);
      setIsRecordingGenerating(false);
    }
  };

  const handleCopyAdCopy = () => {
    const copyString = `${selectedHook}\n\n👉 ${selectedCta}\n\n#sketchup #archviz #architect #rendering #vray #interiordesign #lumion #enscape #v6render`;
    navigator.clipboard.writeText(copyString);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadActiveMedia = () => {
    let targetUrl = renderImg;
    let filename = "v6_ad_asset.jpg";

    if (mediaSource === "process") {
      targetUrl = processVideoUrl || renderVideo || DEFAULT_VIDEO;
      filename = "v6_process_recording_ad.webm";
    } else if (mediaSource === "walkthrough") {
      targetUrl = renderVideo || DEFAULT_VIDEO;
      filename = "v6_3d_walkthrough_ad.mp4";
    } else if (mediaSource === "render") {
      targetUrl = renderImg || DEFAULT_RENDER;
      filename = "v6_photoreal_4k_render.jpg";
    } else if (mediaSource === "compare") {
      targetUrl = renderImg || DEFAULT_RENDER;
      filename = "v6_comparison_ad.jpg";
    }

    const a = document.createElement("a");
    a.href = targetUrl;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#09090b] font-sans text-white select-none [&_*]:[scrollbar-width:none] [&_*::-webkit-scrollbar]:hidden">
      {/* HEADER */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#0e0e12] px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/v6-logo.png"
              alt="V6 Render"
              className="h-6 w-6 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />
            <span className="text-base font-black tracking-tight text-white">
              V6 Render
            </span>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              AD CREATOR STUDIO (/ad)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <Link
            href="/new"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <span>Back to Studio (/new)</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/load"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <span>Load Custom Assets (/load)</span>
          </Link>
        </div>
      </header>

      {/* TOP SOURCE ASSETS BAR */}
      <section className="border-b border-zinc-800/80 bg-zinc-950/60 p-4 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
              <Layers className="h-3.5 w-3.5 text-emerald-400" />
              <span>Loaded Studio Assets &amp; Process Recordings</span>
            </div>
            {isRecordingGenerating && (
              <span className="flex animate-pulse items-center gap-1.5 text-[11px] font-medium text-amber-400">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Synthesizing background process video...
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* 1. Viewport */}
            <div
              onClick={() => setMediaSource("compare")}
              className={cn(
                "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border p-2.5 transition-all",
                mediaSource === "compare"
                  ? "border-emerald-500 bg-emerald-950/20 shadow-md"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
              )}
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-zinc-950">
                <img
                  src={viewportImg}
                  alt="SketchUp Viewport"
                  className="h-full w-full object-contain"
                />
                <span className="absolute top-1.5 left-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300">
                  Raw Viewport
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="truncate font-bold text-zinc-200">
                  1. SketchUp Model
                </span>
                <span className="text-[10px] text-zinc-500">Source</span>
              </div>
            </div>

            {/* 2. 4K Render */}
            <div
              onClick={() => setMediaSource("render")}
              className={cn(
                "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border p-2.5 transition-all",
                mediaSource === "render"
                  ? "border-emerald-500 bg-emerald-950/20 shadow-md"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
              )}
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-zinc-950">
                <img
                  src={renderImg}
                  alt="4K Photoreal Render"
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-1.5 left-1.5 rounded bg-blue-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  4K Photoreal
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="truncate font-bold text-zinc-200">
                  2. Photoreal 4K
                </span>
                <span className="text-[10px] font-semibold text-emerald-400">
                  Output
                </span>
              </div>
            </div>

            {/* 3. 3D Video Walkthrough */}
            <div
              onClick={() => setMediaSource("walkthrough")}
              className={cn(
                "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border p-2.5 transition-all",
                mediaSource === "walkthrough"
                  ? "border-emerald-500 bg-emerald-950/20 shadow-md"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
              )}
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-zinc-950">
                <video
                  src={renderVideo}
                  muted
                  playsInline
                  loop
                  autoPlay
                  className="pointer-events-none h-full w-full object-cover"
                />
                <span className="absolute top-1.5 left-1.5 rounded bg-purple-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  3D Walkthrough
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="truncate font-bold text-zinc-200">
                  3. 3D Video
                </span>
                <span className="text-[10px] font-semibold text-purple-400">
                  60fps MP4
                </span>
              </div>
            </div>

            {/* 4. Process Recording Video */}
            <div
              onClick={() => setMediaSource("process")}
              className={cn(
                "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border p-2.5 transition-all",
                mediaSource === "process"
                  ? "border-emerald-500 bg-emerald-950/20 shadow-md"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
              )}
            >
              <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-lg bg-zinc-950">
                <ProcessVideoPlayer
                  isThumbnail={true}
                  viewportUrl={viewportImg}
                  renderUrl={renderImg}
                  videoUrl={renderVideo}
                  blobUrl={processVideoUrl}
                  className="pointer-events-none h-full w-full"
                />
                <span className="absolute top-1.5 left-1.5 rounded bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                  Process Recording
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="truncate font-bold text-zinc-200">
                  4. /new Process
                </span>
                <span className="text-[10px] font-semibold text-emerald-400">
                  Recorded
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN AD WORKSPACE */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:flex-row">
        {/* LEFT: AD PREVIEW CANVAS */}
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-4 shadow-xl sm:p-6">
          {/* FORMAT TABS */}
          <div className="mb-4 flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 p-1 text-xs">
            <button
              type="button"
              onClick={() => setAdFormat("9:16")}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all",
                adFormat === "9:16"
                  ? "bg-zinc-800 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>9:16 Reels / TikTok</span>
            </button>
            <button
              type="button"
              onClick={() => setAdFormat("1:1")}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all",
                adFormat === "1:1"
                  ? "bg-zinc-800 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Square className="h-3.5 w-3.5" />
              <span>1:1 Feed Post</span>
            </button>
            <button
              type="button"
              onClick={() => setAdFormat("16:9")}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all",
                adFormat === "16:9"
                  ? "bg-zinc-800 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>16:9 YouTube / Ad</span>
            </button>
          </div>

          {/* AD PREVIEW CONTAINER */}
          <div
            className={cn(
              "relative flex flex-col overflow-hidden rounded-2xl border border-zinc-700/80 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.85)] transition-all duration-300",
              adFormat === "9:16" &&
                "aspect-[9/16] w-full max-w-[340px] sm:max-w-[360px]",
              adFormat === "1:1" && "aspect-square w-full max-w-[440px]",
              adFormat === "16:9" && "aspect-[16/9] w-full max-w-[620px]"
            )}
          >
            {/* TOP HOOK BANNER */}
            <div className="relative z-20 flex flex-col border-b border-white/10 bg-gradient-to-b from-black/90 via-black/80 to-transparent p-3.5 text-center">
              {showLogo && (
                <div className="mb-1.5 flex items-center justify-center gap-1.5">
                  <img
                    src="/v6-logo.png"
                    alt="V6"
                    className="h-4 w-4 object-contain"
                  />
                  <span className="text-[11px] font-black tracking-wider text-zinc-300 uppercase">
                    V6 Render for SketchUp
                  </span>
                </div>
              )}
              <h2 className="text-xs leading-snug font-black tracking-tight whitespace-pre-line text-white sm:text-sm">
                {selectedHook}
              </h2>
            </div>

            {/* CENTER MEDIA PLAYER / CANVAS */}
            <div className="relative flex-1 overflow-hidden bg-[#09090b]">
              {/* Process Video */}
              {mediaSource === "process" && (
                <ProcessVideoPlayer
                  isThumbnail={false}
                  viewportUrl={viewportImg}
                  renderUrl={renderImg}
                  videoUrl={renderVideo}
                  blobUrl={processVideoUrl}
                  isPlaying={isPlayingPreview}
                  className="h-full w-full"
                />
              )}

              {/* 3D Walkthrough Video */}
              {mediaSource === "walkthrough" && (
                <video
                  ref={previewVideoRef}
                  src={renderVideo}
                  muted
                  playsInline
                  loop
                  autoPlay={isPlayingPreview}
                  className="h-full w-full object-cover"
                />
              )}

              {/* Static 4K Render */}
              {mediaSource === "render" && (
                <img
                  src={renderImg}
                  alt="4K Render"
                  className="h-full w-full object-cover"
                />
              )}

              {/* Interactive Compare Slider */}
              {mediaSource === "compare" && (
                <div className="relative h-full w-full overflow-hidden">
                  <img
                    src={renderImg}
                    alt="4K Render"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    className="absolute top-0 bottom-0 left-0 overflow-hidden border-r-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.7)]"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <img
                      src={viewportImg}
                      alt="SketchUp Viewport"
                      className="absolute top-0 left-0 h-full w-full max-w-none object-cover"
                      style={{
                        width:
                          adFormat === "9:16"
                            ? "360px"
                            : adFormat === "1:1"
                              ? "440px"
                              : "620px",
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
                  />
                </div>
              )}

              {/* Floating Badges */}
              {showBadges && (
                <div className="pointer-events-none absolute right-3 bottom-3 left-3 z-20 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="rounded-full border border-emerald-500/40 bg-black/80 px-2 py-0.5 font-bold text-emerald-400 backdrop-blur-md">
                    ⚡ 10s Cloud Render
                  </span>
                  <span className="rounded-full border border-blue-500/40 bg-black/80 px-2 py-0.5 font-bold text-blue-300 backdrop-blur-md">
                    0 GPU Required
                  </span>
                  <span className="rounded-full border border-white/20 bg-black/80 px-2 py-0.5 font-bold text-white backdrop-blur-md">
                    SketchUp 2024
                  </span>
                </div>
              )}
            </div>

            {/* BOTTOM CALL TO ACTION BANNER */}
            <div className="relative z-20 flex flex-col gap-1.5 border-t border-white/10 bg-gradient-to-t from-black via-black/90 to-transparent p-3.5 text-center">
              <div className="truncate text-[10px] text-zinc-400">
                {customSubtitle}
              </div>
              <button
                type="button"
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-black shadow-lg transition-all hover:bg-zinc-200 active:scale-95"
              >
                <span>{selectedCta}</span>
                <ArrowRight className="h-3.5 w-3.5 text-black" />
              </button>
            </div>
          </div>

          {/* Quick Ad Actions */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleDownloadActiveMedia}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-900/60 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Active Ad Media</span>
            </button>
            <button
              type="button"
              onClick={handleCopyAdCopy}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-200 transition-all hover:bg-zinc-700 hover:text-white"
            >
              {copiedText ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied Copy &amp; Tags!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Caption &amp; Hashtags</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT: AD CUSTOMIZER CONTROLS */}
        <div className="flex w-full flex-col gap-5 lg:w-[420px]">
          {/* MEDIA SOURCE SELECTOR */}
          <div className="space-y-2.5 rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-4 shadow-md">
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-zinc-300 uppercase">
              <Film className="h-3.5 w-3.5 text-emerald-400" />
              <span>Ad Video &amp; Media Source</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMediaSource("process")}
                className={cn(
                  "cursor-pointer rounded-xl border p-2.5 text-left transition-all",
                  mediaSource === "process"
                    ? "border-emerald-500 bg-emerald-950/30 text-white"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                )}
              >
                <div className="text-xs font-bold">Process Recording</div>
                <div className="text-[10px] text-zinc-500">
                  Recorded from /new
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMediaSource("walkthrough")}
                className={cn(
                  "cursor-pointer rounded-xl border p-2.5 text-left transition-all",
                  mediaSource === "walkthrough"
                    ? "border-emerald-500 bg-emerald-950/30 text-white"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                )}
              >
                <div className="text-xs font-bold">3D Walkthrough</div>
                <div className="text-[10px] text-zinc-500">
                  Cinematic 60fps MP4
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMediaSource("compare")}
                className={cn(
                  "cursor-pointer rounded-xl border p-2.5 text-left transition-all",
                  mediaSource === "compare"
                    ? "border-emerald-500 bg-emerald-950/30 text-white"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                )}
              >
                <div className="text-xs font-bold">Split Comparison</div>
                <div className="text-[10px] text-zinc-500">
                  Before/After Wiping
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMediaSource("render")}
                className={cn(
                  "cursor-pointer rounded-xl border p-2.5 text-left transition-all",
                  mediaSource === "render"
                    ? "border-emerald-500 bg-emerald-950/30 text-white"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                )}
              >
                <div className="text-xs font-bold">4K Master Render</div>
                <div className="text-[10px] text-zinc-500">
                  Static Photoreal Output
                </div>
              </button>
            </div>
          </div>

          {/* HOOK & HEADLINE EDITOR */}
          <div className="space-y-2.5 rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-4 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-zinc-300 uppercase">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Headline &amp; Viral Hook</span>
              </h3>
              <span className="text-[10px] text-zinc-500">Top Performing</span>
            </div>

            <div className="space-y-2">
              {AD_HOOKS.map((hook) => (
                <div
                  key={hook.id}
                  onClick={() => setSelectedHook(hook.text)}
                  className={cn(
                    "cursor-pointer rounded-xl border p-2.5 text-xs transition-all",
                    selectedHook === hook.text
                      ? "border-emerald-500 bg-emerald-950/20 text-white"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-bold text-zinc-200">
                      {hook.title}
                    </span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
                      {hook.tag}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed whitespace-pre-line text-zinc-400">
                    {hook.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <textarea
                value={selectedHook}
                onChange={(e) => setSelectedHook(e.target.value)}
                rows={2}
                placeholder="Or type your custom ad headline..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {/* CALL TO ACTION BUTTON SELECTOR */}
          <div className="space-y-2.5 rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-4 shadow-md">
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-zinc-300 uppercase">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span>Call to Action (CTA) Button</span>
            </h3>
            <div className="space-y-1.5">
              {CTA_OPTIONS.map((cta, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCta(cta)}
                  className={cn(
                    "w-full cursor-pointer rounded-lg border px-3 py-2 text-left text-xs font-bold transition-all",
                    selectedCta === cta
                      ? "border-white bg-zinc-800 text-white"
                      : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {cta}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <input
                type="text"
                value={customSubtitle}
                onChange={(e) => setCustomSubtitle(e.target.value)}
                placeholder="Sub-caption (e.g. 100% Cloud • 0 GPU Needed)"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {/* BADGE & BRANDING TOGGLES */}
          <div className="flex items-center justify-between rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-4 text-xs shadow-md">
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={showBadges}
                  onChange={(e) => setShowBadges(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span>Feature Pills</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span>V6 Logo Header</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                if (previewVideoRef.current) {
                  if (previewVideoRef.current.paused)
                    previewVideoRef.current.play();
                  else previewVideoRef.current.pause();
                  setIsPlayingPreview(!previewVideoRef.current.paused);
                }
              }}
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-zinc-300 hover:text-white"
            >
              {isPlayingPreview ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              <span>{isPlayingPreview ? "Pause Preview" : "Play Preview"}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
