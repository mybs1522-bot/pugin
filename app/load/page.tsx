"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Image as ImageIcon,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Trash2,
  Layers,
  RotateCcw,
  Video,
  Film,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_SAMPLE_VIDEO =
  "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-architecture-and-interior-design-41484-large.mp4";

const DEFAULT_SAMPLES = [
  {
    title: "Minimalist Living Room Villa",
    viewport:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    render:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
    video:
      "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-architecture-and-interior-design-41484-large.mp4",
  },
  {
    title: "Cantilevered Forest House",
    viewport:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
    render:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
    video:
      "https://assets.mixkit.co/videos/preview/mixkit-living-room-with-modern-furniture-41487-large.mp4",
  },
];

export default function LoadPluginImagesPage() {
  const router = useRouter();
  const [viewportImg, setViewportImg] = useState<string>("");
  const [renderImg, setRenderImg] = useState<string>("");
  const [renderVideo, setRenderVideo] = useState<string>("");
  const [sceneTitle, setSceneTitle] = useState<string>(
    "My SketchUp Project View"
  );

  const viewportInputRef = useRef<HTMLInputElement>(null);
  const renderInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load existing items if available
    const savedViewport =
      localStorage.getItem("custom_viewport_img") ||
      sessionStorage.getItem("custom_viewport_img");
    const savedRender =
      localStorage.getItem("custom_render_img") ||
      sessionStorage.getItem("custom_render_img");
    const savedVideo =
      localStorage.getItem("custom_render_video") ||
      sessionStorage.getItem("custom_render_video");
    const savedTitle =
      localStorage.getItem("custom_scene_title") ||
      sessionStorage.getItem("custom_scene_title");

    if (savedViewport) setViewportImg(savedViewport);
    if (savedRender) setRenderImg(savedRender);
    if (savedVideo) setRenderVideo(savedVideo);
    if (savedTitle) setSceneTitle(savedTitle);
  }, []);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "viewport" | "render" | "video"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "video") {
      // Create an object URL or data URL for video
      const url = URL.createObjectURL(file);
      setRenderVideo(url);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (type === "viewport") {
        setViewportImg(result);
      } else {
        setRenderImg(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplySample = (sample: (typeof DEFAULT_SAMPLES)[0]) => {
    setViewportImg(sample.viewport);
    setRenderImg(sample.render);
    setRenderVideo(sample.video);
    setSceneTitle(sample.title);
  };

  const handleLaunchStudio = () => {
    if (!viewportImg || !renderImg) {
      alert(
        "Please upload both the SketchUp Viewport Image and the 4K Render Image before launching."
      );
      return;
    }

    const videoToSave = renderVideo || DEFAULT_SAMPLE_VIDEO;

    try {
      localStorage.setItem("custom_viewport_img", viewportImg);
      localStorage.setItem("custom_render_img", renderImg);
      localStorage.setItem("custom_render_video", videoToSave);
      localStorage.setItem(
        "custom_scene_title",
        sceneTitle || "Custom SketchUp Render"
      );
    } catch (err) {
      sessionStorage.setItem("custom_viewport_img", viewportImg);
      sessionStorage.setItem("custom_render_img", renderImg);
      sessionStorage.setItem("custom_render_video", videoToSave);
      sessionStorage.setItem(
        "custom_scene_title",
        sceneTitle || "Custom SketchUp Render"
      );
    }

    router.push("/new");
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#09090b] font-sans text-white select-none [&_*]:[scrollbar-width:none] [&_*::-webkit-scrollbar]:hidden">
      {/* HEADER */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#0e0e12] px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black tracking-tight text-white">
              V6 Render
            </span>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
              SCENE &amp; VIDEO LOADER
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span>Step 1: Upload Viewport, Render &amp; 3D Video</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-6 p-6">
        {/* TOP TITLE */}
        <div className="space-y-1.5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-3 py-1 text-xs font-semibold text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span>Interactive Custom Simulation Setup</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
            Upload Viewport, 4K Render &amp; 3D Video
          </h1>
          <p className="mx-auto max-w-lg text-xs text-zinc-400 md:text-sm">
            Upload your raw SketchUp screen capture, final render, and optional
            3D video walkthrough.
          </p>
        </div>

        {/* 3 UPLOAD DROPZONES */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* 1. SKETCHUP VIEWPORT IMAGE */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-zinc-300 uppercase">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-white">
                  1
                </span>
                <span>SketchUp Viewport</span>
              </label>
              {viewportImg && (
                <button
                  type="button"
                  onClick={() => setViewportImg("")}
                  className="flex cursor-pointer items-center gap-1 text-xs text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={viewportInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "viewport")}
            />

            <div
              onClick={() => viewportInputRef.current?.click()}
              className={cn(
                "group relative flex h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-zinc-950 transition-all",
                viewportImg
                  ? "border-zinc-700"
                  : "border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/40"
              )}
            >
              {viewportImg ? (
                <>
                  <img
                    src={viewportImg}
                    alt="SketchUp Viewport"
                    className="h-full w-full object-contain p-2"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Upload className="h-5 w-5 text-white" />
                    <span className="text-xs font-bold text-white">
                      Change Viewport
                    </span>
                  </div>
                  <div className="absolute top-2.5 left-2.5 rounded-md border border-white/10 bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                    📐 Viewport
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2.5 p-4 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors group-hover:text-white">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Upload Viewport
                    </div>
                    <div className="mt-0.5 text-[10px] text-zinc-500">
                      Raw SketchUp screen
                    </div>
                  </div>
                  <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-[10px] font-bold text-zinc-300">
                    Browse
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. RENDERED 4K IMAGE */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-zinc-300 uppercase">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-white">
                  2
                </span>
                <span>Final 4K Render</span>
              </label>
              {renderImg && (
                <button
                  type="button"
                  onClick={() => setRenderImg("")}
                  className="flex cursor-pointer items-center gap-1 text-xs text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={renderInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "render")}
            />

            <div
              onClick={() => renderInputRef.current?.click()}
              className={cn(
                "group relative flex h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-zinc-950 transition-all",
                renderImg
                  ? "border-zinc-700"
                  : "border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/40"
              )}
            >
              {renderImg ? (
                <>
                  <img
                    src={renderImg}
                    alt="Target 4K Render"
                    className="h-full w-full object-contain p-2"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Upload className="h-5 w-5 text-white" />
                    <span className="text-xs font-bold text-white">
                      Change Render
                    </span>
                  </div>
                  <div className="absolute top-2.5 left-2.5 rounded-md border border-white/10 bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                    ✨ 4K Render
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2.5 p-4 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors group-hover:text-white">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Upload 4K Render
                    </div>
                    <div className="mt-0.5 text-[10px] text-zinc-500">
                      Target output image
                    </div>
                  </div>
                  <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-[10px] font-bold text-zinc-300">
                    Browse
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3. 3D VIDEO WALKTHROUGH */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-zinc-300 uppercase">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-white">
                  3
                </span>
                <span>3D Video Walkthrough</span>
              </label>
              {renderVideo && (
                <button
                  type="button"
                  onClick={() => setRenderVideo("")}
                  className="flex cursor-pointer items-center gap-1 text-xs text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "video")}
            />

            <div
              onClick={() => videoInputRef.current?.click()}
              className={cn(
                "group relative flex h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-zinc-950 transition-all",
                renderVideo
                  ? "border-zinc-700"
                  : "border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/40"
              )}
            >
              {renderVideo ? (
                <>
                  <video
                    src={renderVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-contain p-2"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Upload className="h-5 w-5 text-white" />
                    <span className="text-xs font-bold text-white">
                      Change Video
                    </span>
                  </div>
                  <div className="absolute top-2.5 left-2.5 rounded-md border border-white/10 bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                    🎬 3D Walkthrough
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2.5 p-4 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors group-hover:text-white">
                    <Film className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Upload 3D Video
                    </div>
                    <div className="mt-0.5 text-[10px] text-zinc-500">
                      MP4 or WebM walkthrough
                    </div>
                  </div>
                  <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-[10px] font-bold text-zinc-300">
                    Browse Video
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QUICK SAMPLES ROW */}
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:flex-row sm:items-center">
          <div className="text-xs text-zinc-400">
            <span className="font-bold text-white">Sample Project Packs:</span>{" "}
            Pre-loaded viewport, render &amp; 3D video
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {DEFAULT_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplySample(sample)}
                className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* LAUNCH BUTTON */}
        <div className="flex flex-col items-center gap-4 pt-1 sm:flex-row">
          <div className="w-full flex-1">
            <input
              type="text"
              value={sceneTitle}
              onChange={(e) => setSceneTitle(e.target.value)}
              placeholder="Project / Scene Title (e.g. Modern Living Room)"
              className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleLaunchStudio}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-black text-black shadow-2xl transition-all hover:bg-zinc-200 sm:w-auto"
          >
            <span>Launch Plugin Studio (/new)</span>
            <ArrowRight className="h-4 w-4 text-black" />
          </button>
        </div>
      </main>
    </div>
  );
}
