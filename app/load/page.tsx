"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Trash2,
  Film,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { setAsset, getAsset } from "@/lib/storage";

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

// Helper to optimize large uploaded images using Canvas
function compressImageDataUrl(
  dataUrl: string,
  maxDimension = 2560
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !dataUrl.startsWith("data:image")) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (
        width <= maxDimension &&
        height <= maxDimension &&
        dataUrl.length < 3000000
      ) {
        resolve(dataUrl);
        return;
      }
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function LoadPluginImagesPage() {
  const router = useRouter();
  const [viewportImg, setViewportImg] = useState<string>("");
  const [renderImg, setRenderImg] = useState<string>("");
  const [renderVideo, setRenderVideo] = useState<string>("");
  const [sceneTitle, setSceneTitle] = useState<string>(
    "My SketchUp Project View"
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [draggingZone, setDraggingZone] = useState<
    "viewport" | "render" | "video" | null
  >(null);

  const viewportInputRef = useRef<HTMLInputElement>(null);
  const renderInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadSavedAssets() {
      // 1. Try IndexedDB first (no quota limits)
      const idbViewport = await getAsset("custom_viewport_img");
      const idbRender = await getAsset("custom_render_img");
      const idbVideo = await getAsset("custom_render_video");
      const idbTitle = await getAsset("custom_scene_title");

      if (idbViewport) setViewportImg(idbViewport);
      else {
        const lsViewport =
          localStorage.getItem("custom_viewport_img") ||
          sessionStorage.getItem("custom_viewport_img");
        if (lsViewport) setViewportImg(lsViewport);
      }

      if (idbRender) setRenderImg(idbRender);
      else {
        const lsRender =
          localStorage.getItem("custom_render_img") ||
          sessionStorage.getItem("custom_render_img");
        if (lsRender) setRenderImg(lsRender);
      }

      if (idbVideo) setRenderVideo(idbVideo);
      else {
        const lsVideo =
          localStorage.getItem("custom_render_video") ||
          sessionStorage.getItem("custom_render_video");
        if (lsVideo) setRenderVideo(lsVideo);
      }

      if (idbTitle) setSceneTitle(idbTitle);
      else {
        const lsTitle =
          localStorage.getItem("custom_scene_title") ||
          sessionStorage.getItem("custom_scene_title");
        if (lsTitle) setSceneTitle(lsTitle);
      }
    }

    loadSavedAssets();
  }, []);

  const processFile = (file: File, type: "viewport" | "render" | "video") => {
    if (!file) return;

    if (type === "video") {
      if (!file.type.startsWith("video/")) {
        alert("Please select or drop a valid video file (.mp4, .webm, etc.)");
        return;
      }
      const url = URL.createObjectURL(file);
      setRenderVideo(url);
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select or drop a valid image file (.png, .jpg, .webp, etc.)"
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawResult = event.target?.result as string;
      const optimized = await compressImageDataUrl(rawResult);
      if (type === "viewport") {
        setViewportImg(optimized);
      } else {
        setRenderImg(optimized);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "viewport" | "render" | "video"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, type);
    }
  };

  const handleDragOver = (
    e: React.DragEvent,
    type: "viewport" | "render" | "video"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingZone(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingZone(null);
  };

  const handleDrop = (
    e: React.DragEvent,
    type: "viewport" | "render" | "video"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingZone(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, type);
    }
  };

  const handleApplySample = (sample: (typeof DEFAULT_SAMPLES)[0]) => {
    setViewportImg(sample.viewport);
    setRenderImg(sample.render);
    setRenderVideo(sample.video);
    setSceneTitle(sample.title);
  };

  const handleLaunchStudio = async () => {
    if (!viewportImg || !renderImg) {
      alert(
        "Please upload both the SketchUp Viewport Image and the 4K Render Image before launching."
      );
      return;
    }

    setIsSubmitting(true);
    const videoToSave = renderVideo || DEFAULT_SAMPLE_VIDEO;
    const finalTitle = sceneTitle || "Custom SketchUp Render";

    try {
      // 1. Save to high-capacity IndexedDB (No 5MB storage limit)
      await setAsset("custom_viewport_img", viewportImg);
      await setAsset("custom_render_img", renderImg);
      await setAsset("custom_render_video", videoToSave);
      await setAsset("custom_scene_title", finalTitle);

      // 2. Safe non-blocking sync for short keys (swallow any QuotaExceededError)
      try {
        localStorage.setItem("custom_scene_title", finalTitle);
      } catch (_) {}

      router.push("/new");
    } catch (err) {
      console.error("Launch studio storage error:", err);
      router.push("/new");
    }
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
              className="h-6 w-6 object-contain drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            />
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
            Drag &amp; drop or click to upload your SketchUp screen capture,
            final render, and 3D video walkthrough.
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
              onDragOver={(e) => handleDragOver(e, "viewport")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "viewport")}
              className={cn(
                "group relative flex h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-zinc-950 transition-all duration-200",
                draggingZone === "viewport"
                  ? "scale-[1.02] border-white bg-zinc-900 ring-4 ring-white/10"
                  : viewportImg
                    ? "border-zinc-700 hover:border-zinc-500"
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
                      Drop or Click to Change
                    </span>
                  </div>
                  <div className="absolute top-2.5 left-2.5 rounded-md border border-white/10 bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                    📐 Viewport
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2.5 p-4 text-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition-all group-hover:text-white",
                      draggingZone === "viewport" &&
                        "scale-110 border-white bg-zinc-800 text-white"
                    )}
                  >
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {draggingZone === "viewport"
                        ? "Drop Viewport Image Here"
                        : "Upload Viewport"}
                    </div>
                    <div className="mt-0.5 text-[10px] text-zinc-500">
                      Drag &amp; drop or click to browse
                    </div>
                  </div>
                  <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-[10px] font-bold text-zinc-300">
                    Browse or Drop
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
              onDragOver={(e) => handleDragOver(e, "render")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "render")}
              className={cn(
                "group relative flex h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-zinc-950 transition-all duration-200",
                draggingZone === "render"
                  ? "scale-[1.02] border-white bg-zinc-900 ring-4 ring-white/10"
                  : renderImg
                    ? "border-zinc-700 hover:border-zinc-500"
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
                      Drop or Click to Change
                    </span>
                  </div>
                  <div className="absolute top-2.5 left-2.5 rounded-md border border-white/10 bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                    ✨ 4K Render
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2.5 p-4 text-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition-all group-hover:text-white",
                      draggingZone === "render" &&
                        "scale-110 border-white bg-zinc-800 text-white"
                    )}
                  >
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {draggingZone === "render"
                        ? "Drop 4K Render Image Here"
                        : "Upload 4K Render"}
                    </div>
                    <div className="mt-0.5 text-[10px] text-zinc-500">
                      Drag &amp; drop or click to browse
                    </div>
                  </div>
                  <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-[10px] font-bold text-zinc-300">
                    Browse or Drop
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
              onDragOver={(e) => handleDragOver(e, "video")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "video")}
              className={cn(
                "group relative flex h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-zinc-950 transition-all duration-200",
                draggingZone === "video"
                  ? "scale-[1.02] border-white bg-zinc-900 ring-4 ring-white/10"
                  : renderVideo
                    ? "border-zinc-700 hover:border-zinc-500"
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
                      Drop or Click to Change
                    </span>
                  </div>
                  <div className="absolute top-2.5 left-2.5 rounded-md border border-white/10 bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                    🎬 3D Walkthrough
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2.5 p-4 text-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition-all group-hover:text-white",
                      draggingZone === "video" &&
                        "scale-110 border-white bg-zinc-800 text-white"
                    )}
                  >
                    <Film className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {draggingZone === "video"
                        ? "Drop 3D Video Here"
                        : "Upload 3D Video"}
                    </div>
                    <div className="mt-0.5 text-[10px] text-zinc-500">
                      Drag &amp; drop MP4 or WebM walkthrough
                    </div>
                  </div>
                  <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-[10px] font-bold text-zinc-300">
                    Browse or Drop Video
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
            disabled={isSubmitting}
            onClick={handleLaunchStudio}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-black text-black shadow-2xl transition-all hover:bg-zinc-200 disabled:opacity-50 sm:w-auto"
          >
            <span>
              {isSubmitting
                ? "Loading Studio..."
                : "Launch Plugin Studio (/new)"}
            </span>
            <ArrowRight className="h-4 w-4 text-black" />
          </button>
        </div>
      </main>
    </div>
  );
}
