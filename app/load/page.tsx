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
  Eye,
  X,
  Maximize2,
  Minimize2,
  Check,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { setAsset, getAsset } from "@/lib/storage";

const DEFAULT_SAMPLE_VIDEO = "/sample-walkthrough.mp4";

const DEFAULT_SAMPLES = [
  {
    title: "SketchUp Dining & Kitchen (Your Shared Viewport)",
    viewport: "/sketchup-design-sample.png",
    render:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
    video: "/sample-walkthrough.mp4",
  },
  {
    title: "Minimalist Living Room Villa",
    viewport:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    render:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
    video: "/sample-walkthrough.mp4",
  },
  {
    title: "Cantilevered Forest House",
    viewport:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
    render:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
    video: "/sample-walkthrough.mp4",
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
  const [videoBlob, setVideoBlob] = useState<Blob | File | null>(null);
  const [sceneTitle, setSceneTitle] = useState<string>(
    "My SketchUp Project View"
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [draggingZone, setDraggingZone] = useState<
    "viewport" | "render" | "video" | null
  >(null);
  const [showSketchupPreview, setShowSketchupPreview] =
    useState<boolean>(false);

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

      if (idbVideo) {
        if (idbVideo instanceof Blob || idbVideo instanceof File) {
          setVideoBlob(idbVideo);
          setRenderVideo(URL.createObjectURL(idbVideo));
        } else if (typeof idbVideo === "string") {
          setRenderVideo(idbVideo);
        }
      } else {
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
      setVideoBlob(file);
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
    setVideoBlob(null);
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
    const videoToSave = videoBlob || renderVideo || DEFAULT_SAMPLE_VIDEO;
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
          <button
            type="button"
            onClick={() => setShowSketchupPreview(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-500/50 bg-indigo-600/20 px-3 py-1.5 text-xs font-bold text-indigo-200 shadow-sm transition-all hover:border-indigo-400 hover:bg-indigo-600/35 hover:text-white active:scale-95"
          >
            <Eye className="h-3.5 w-3.5 text-indigo-300" />
            <span>Show SketchUp Preview</span>
          </button>
          <span className="hidden sm:inline">
            Step 1: Upload Viewport, Render &amp; 3D Video
          </span>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSketchupPreview(true)}
                  className="flex cursor-pointer items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-500/15 px-2 py-0.5 text-[11px] font-bold text-indigo-300 transition-colors hover:bg-indigo-500/25 hover:text-white"
                  title="Show SketchUp Preview"
                >
                  <Eye className="h-3 w-3" />
                  <span>Preview</span>
                </button>
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

            {/* Direct button to launch SketchUp preview */}
            <button
              type="button"
              onClick={() => setShowSketchupPreview(true)}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-950/40 py-2.5 text-xs font-bold text-indigo-200 transition-all hover:border-indigo-400/80 hover:bg-indigo-900/60 hover:text-white active:scale-[0.99]"
            >
              <Eye className="h-3.5 w-3.5 text-indigo-400" />
              <span>Show SketchUp Preview</span>
            </button>
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

        {/* INLINE SKETCHUP PREVIEW SECTION */}
        <section className="space-y-3 rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-4 shadow-xl sm:p-5">
          <div className="flex flex-col justify-between gap-2 border-b border-zinc-800/80 pb-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/90 text-[11px] font-black text-white shadow-sm">
                SKP
              </div>
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                  <span>SketchUp Live Viewport Preview</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    Design Replaced
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Toolbars, menus &amp; Default Tray preserved · Viewport canvas
                  displays your uploaded design
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
                Aspect Ratio Locked · Plain White
              </span>

              <button
                type="button"
                onClick={() => setShowSketchupPreview(true)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-500/50 bg-indigo-600/20 px-3 py-1.5 text-xs font-bold text-indigo-200 shadow-sm transition-all hover:border-indigo-400 hover:bg-indigo-600/35 hover:text-white"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Fullscreen Preview</span>
              </button>
            </div>
          </div>

          {/* Authentic SketchUp Frame with Replaced Viewport */}
          <div className="relative mx-auto aspect-[1024/555] w-full max-w-4xl overflow-hidden rounded-xl border border-zinc-700/70 bg-white shadow-2xl">
            {/* Dynamically Replaced Viewport Design Screen - Plain White Canvas & Preserved Image Ratio */}
            <div className="absolute top-[5.586%] left-0 flex h-[92.432%] w-[84.766%] items-center justify-center overflow-hidden bg-white">
              <img
                src={viewportImg || "/sketchup-design-sample.png"}
                alt="Active SketchUp Viewport Design"
                className="h-full w-full object-contain select-none"
              />
            </div>

            {/* Authentic SketchUp Chrome Frame (Menu, Toolbars, Tray, Status Bar) */}
            <img
              src="/sketchup-frame-cutout.png"
              alt="SketchUp UI Frame"
              className="pointer-events-none absolute inset-0 h-full w-full select-none"
            />
          </div>
        </section>

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

      {/* FULL SKETCHUP PREVIEW MODAL */}
      {showSketchupPreview && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md duration-200 sm:p-6">
          <div className="relative flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-xs font-black text-white shadow-sm">
                  SKP
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                    <span>SketchUp 2024 Viewport Preview</span>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      Live Screen Replaced
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Menus, toolbars &amp; Default Tray preserved · Canvas
                    rendered with your uploaded design
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 sm:inline-flex">
                  Aspect Ratio Locked · Plain White Canvas
                </span>

                <button
                  type="button"
                  onClick={() => viewportInputRef.current?.click()}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-white"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Change Design</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSketchupPreview(false)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Canvas Body */}
            <div className="relative flex flex-1 items-center justify-center overflow-auto bg-[#141417] p-4 sm:p-6">
              <div className="relative aspect-[1024/555] w-full max-w-4xl overflow-hidden rounded-xl border border-zinc-700/80 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                {/* Dynamically Replaced Viewport Design Screen - Plain White Canvas & Preserved Image Ratio */}
                <div className="absolute top-[5.586%] left-0 flex h-[92.432%] w-[84.766%] items-center justify-center overflow-hidden bg-white">
                  <img
                    src={viewportImg || "/sketchup-design-sample.png"}
                    alt="Active Design Screen"
                    className="h-full w-full object-contain select-none"
                  />
                </div>

                {/* Exact Authentic SketchUp Chrome Frame (Menu, Toolbars, Tray, Status) */}
                <img
                  src="/sketchup-frame-cutout.png"
                  alt="SketchUp UI Frame"
                  className="pointer-events-none absolute inset-0 h-full w-full select-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950 px-4 py-3 sm:flex-row">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span>
                  Active design:{" "}
                  <strong className="text-white">
                    {viewportImg
                      ? "Your Uploaded Viewport"
                      : "Default Kitchen Scene"}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSketchupPreview(false)}
                  className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSketchupPreview(false);
                    handleLaunchStudio();
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-5 py-2 text-xs font-black text-black shadow-lg transition-all hover:bg-zinc-200"
                >
                  <span>Launch Studio with this Design</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
