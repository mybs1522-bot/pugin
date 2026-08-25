"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Download,
  Maximize2,
  Sliders,
  Sun,
  Layers,
  Camera,
  RotateCcw,
  Settings,
  ChevronDown,
  Wand2,
  Check,
  Eye,
  RefreshCw,
  Share2,
  SlidersHorizontal,
  Split,
  Image as ImageIcon,
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample Architecture Showcase Scenes
const SAMPLE_GALLERY = [
  {
    id: "sample-1",
    title: "Minimalist Villa Living Room",
    category: "Interior",
    prompt:
      "Modern minimalist villa living room with double-height glass windows, warm travertine walls, oak flooring, soft afternoon golden hour light, photorealistic, 8k architectural digest.",
    preset: "Modern Luxury",
    model: "Flux 2 Pro",
    lighting: "Golden Hour",
    beforeImg:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    afterImg:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sample-2",
    title: "Cantilevered Forest House",
    category: "Exterior",
    prompt:
      "Contemporary cantilevered concrete and glass residential house nestled in a pine forest, rainy mist atmosphere, warm interior illumination glowing through floor-to-ceiling facade.",
    preset: "Architectural Photoreal",
    model: "Nano Banana Pro",
    lighting: "Cinematic Dusk",
    beforeImg:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    afterImg:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sample-3",
    title: "Scandinavian Kitchen & Dining",
    category: "Interior",
    prompt:
      "Nordic Scandinavian kitchen island, matte black faucets, fluted light oak cabinetry, marble waterfall countertop, ambient morning light, ultra photoreal, 4k.",
    preset: "Scandinavian Light",
    model: "Flux 2 Pro",
    lighting: "Natural Daylight",
    beforeImg:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
    afterImg:
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sample-4",
    title: "Modern Commercial Pavilion",
    category: "Architecture",
    prompt:
      "Curved parametric timber pavilion in an urban public plaza, lush green landscaping, cinematic dramatic sky, volumetric sunlight rays, archdaily feature render.",
    preset: "Conceptual Clay",
    model: "SDXL 4K Turbo",
    lighting: "Volumetric Sun",
    beforeImg:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    afterImg:
      "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80",
  },
];

const PRESETS = [
  { id: "photoreal", label: "Architectural Photoreal", icon: "✨" },
  { id: "luxury", label: "Modern Luxury Interior", icon: "💎" },
  { id: "nordic", label: "Scandinavian Light", icon: "🌿" },
  { id: "dusk", label: "Cinematic Dusk", icon: "🌆" },
  { id: "clay", label: "Clay / White Model", icon: "🏛️" },
  { id: "watercolor", label: "Artistic Watercolor", icon: "🎨" },
];

const LIGHTING_OPTIONS = [
  { id: "daylight", label: "Natural Daylight (Crisp Sun)" },
  { id: "golden", label: "Golden Hour (Warm Sunset)" },
  { id: "dusk", label: "Cinematic Twilight (Blue Hour)" },
  { id: "overcast", label: "Soft Overcast (Diffuse Shadow)" },
  { id: "studio", label: "Interior Architectural Studio Lights" },
  { id: "night", label: "Moody Night & Spotlights" },
];

const MODELS = [
  {
    id: "flux",
    name: "Flux 2 Pro",
    desc: "Ultra-sharp textures, reflection & PBR precision",
  },
  {
    id: "nano",
    name: "Nano Banana Pro",
    desc: "Fast geometry preservation for complex models",
  },
  {
    id: "sdxl",
    name: "SDXL 4K Turbo",
    desc: "Balanced speed & cinematic depth",
  },
];

export default function SamplePluginRendererPage() {
  const [activeScene, setActiveScene] = useState(SAMPLE_GALLERY[0]);
  const [prompt, setPrompt] = useState(SAMPLE_GALLERY[0].prompt);
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, low quality, deformed geometry, overexposed, noise"
  );
  const [selectedPreset, setSelectedPreset] = useState("photoreal");
  const [selectedLighting, setSelectedLighting] = useState("golden");
  const [selectedModel, setSelectedModel] = useState("flux");
  const [creativity, setCreativity] = useState(65);
  const [geometryStrength, setGeometryStrength] = useState(85);
  const [aspectRatio, setAspectRatio] = useState("16:9");

  // Interactive Split Slider
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isComparing, setIsComparing] = useState(true);

  // Rendering Simulation State
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStepText, setRenderStepText] = useState("");
  const [renderCount, setRenderCount] = useState(8);

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    if (presetId === "luxury") {
      setPrompt(
        "Ultra-luxury penthouse master bedroom with floor-to-ceiling glass, Italian leather bed, brass accents, panoramic skyline view, dusk lighting, 8k."
      );
      setSelectedLighting("dusk");
    } else if (presetId === "nordic") {
      setPrompt(
        "Nordic light-filled living area with light oak finishes, linen furniture, indoor plants, soft morning shadows, minimal interior decor."
      );
      setSelectedLighting("daylight");
    } else if (presetId === "clay") {
      setPrompt(
        "Monochromatic white clay architectural scale model, clean bevels, studio softbox ambient occlusion, architectural concept render."
      );
      setSelectedLighting("overcast");
    } else if (presetId === "watercolor") {
      setPrompt(
        "Architectural watercolor concept sketch with pencil outlines, soft pastel washes, architectural concept presentation rendering."
      );
      setSelectedLighting("daylight");
    } else {
      setPrompt(
        "Photorealistic architectural render, high precision materials, PBR textures, depth of field, architectural photography standard."
      );
      setSelectedLighting("golden");
    }
  };

  const handleEnhancePrompt = () => {
    setPrompt(
      (prev) =>
        `${prev.trim()}, photorealistic 8k architectural digest, depth of field, raytraced reflections, PBR materials, unreal engine 5 render, global illumination.`
    );
  };

  const handleTriggerRender = () => {
    if (isRendering) return;
    setIsRendering(true);
    setRenderProgress(10);
    setRenderStepText("Exporting SketchUp Camera & Viewport Mesh...");

    const timer1 = setTimeout(() => {
      setRenderProgress(35);
      setRenderStepText("Analyzing Geometry & Lighting Map...");
    }, 600);

    const timer2 = setTimeout(() => {
      setRenderProgress(65);
      setRenderStepText(
        `Generating 4K Render with ${MODELS.find((m) => m.id === selectedModel)?.name}...`
      );
    }, 1300);

    const timer3 = setTimeout(() => {
      setRenderProgress(90);
      setRenderStepText("Applying AI Super-Resolution & Color Grade...");
    }, 2000);

    const timer4 = setTimeout(() => {
      setRenderProgress(100);
      setRenderStepText("Render Complete!");
      setIsRendering(false);
      setRenderCount((c) => Math.max(0, c - 1));
    }, 2600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0a0a0c] font-sans text-zinc-100 select-none">
      {/* TOP PLUGIN HEADER */}
      <header className="flex h-13 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#0e0e12] px-4">
        {/* Brand & SketchUp Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/sketchup-logo.png"
              alt="SketchUp Logo"
              width={26}
              height={26}
              className="h-6 w-6 animate-[spin_10s_linear_infinite] object-contain"
            />
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black tracking-tight text-white">
                V6 RENDER
              </span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-zinc-300">
                PRO EXTENSION
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-2 border-l border-zinc-800 pl-3 sm:flex">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live SketchUp Link Active
            </span>
          </div>
        </div>

        {/* Action Controls & Trial Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-1 text-xs">
            <span className="text-zinc-400">Trial Left:</span>
            <span className="font-bold text-white">
              {renderCount} / 10 Renders
            </span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-black transition-all hover:bg-zinc-200"
          >
            <Zap className="h-3.5 w-3.5 fill-black text-black" />
            <span>Unlock Pro ($20/mo)</span>
          </Link>
        </div>
      </header>

      {/* MAIN PLUGIN WORKSPACE (SIDEBAR + PREVIEW CANAVS) */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT CONTROLS PANEL */}
        <aside className="custom-scrollbar flex w-[380px] shrink-0 flex-col overflow-y-auto border-r border-zinc-800/80 bg-[#0d0d11]">
          <div className="space-y-4.5 p-4">
            {/* Quick Render Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                  Style Presets
                </label>
                <span className="text-[10px] text-zinc-500">6 Curated</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset.id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-left text-xs font-medium transition-all",
                      selectedPreset === preset.id
                        ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                        : "border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    )}
                  >
                    <span className="text-sm">{preset.icon}</span>
                    <span className="truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Builder */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                  Scene Description (Prompt)
                </label>
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-400 transition-colors hover:text-amber-300"
                >
                  <Wand2 className="h-3 w-3" />
                  <span>Enhance AI</span>
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe materials, lighting, atmosphere..."
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950/80 p-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-white focus:ring-1 focus:ring-white focus:outline-none"
              />
            </div>

            {/* Negative Prompt */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                Negative Prompt (Exclude)
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 p-2 text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-white focus:outline-none"
              />
            </div>

            {/* Environment & Lighting */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                Atmosphere & Lighting
              </label>
              <div className="relative">
                <select
                  value={selectedLighting}
                  onChange={(e) => setSelectedLighting(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 pr-8 text-xs text-white focus:border-white focus:outline-none"
                >
                  {LIGHTING_OPTIONS.map((opt) => (
                    <option
                      key={opt.id}
                      value={opt.id}
                      className="bg-zinc-900 text-white"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-3 right-2.5 h-4 w-4 text-zinc-400" />
              </div>
            </div>

            {/* AI Engine Model */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                AI Engine
              </label>
              <div className="space-y-1.5">
                {MODELS.map((model) => (
                  <label
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg border p-2 text-xs transition-all",
                      selectedModel === model.id
                        ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                        : "border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    )}
                  >
                    <div>
                      <div className="font-bold text-white">{model.name}</div>
                      <div className="text-[10px] text-zinc-400">
                        {model.desc}
                      </div>
                    </div>
                    {selectedModel === model.id && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Creativity & Geometry Controls */}
            <div className="space-y-3 rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">
                    AI Creativity (Denoiser)
                  </span>
                  <span className="font-bold text-white">{creativity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={creativity}
                  onChange={(e) => setCreativity(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-zinc-800 accent-white"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">
                    Geometry Strictness
                  </span>
                  <span className="font-bold text-white">
                    {geometryStrength}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={geometryStrength}
                  onChange={(e) => setGeometryStrength(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-zinc-800 accent-white"
                />
              </div>
            </div>

            {/* Aspect Ratio Options */}
            <div className="flex items-center gap-2">
              {["16:9", "1:1", "9:16", "4:3"].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={cn(
                    "flex-1 cursor-pointer rounded-lg border py-1.5 text-center text-xs font-semibold transition-all",
                    aspectRatio === ratio
                      ? "border-white bg-zinc-800 text-white"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {ratio}
                </button>
              ))}
            </div>

            {/* PRIMARY RENDER BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTriggerRender}
                disabled={isRendering}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white text-sm font-black text-black shadow-xl transition-all hover:bg-zinc-200 disabled:opacity-75"
              >
                {isRendering ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-black" />
                    <span>Rendering Scene ({renderProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 fill-black text-black" />
                    <span>Render Current View (4K)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT PREVIEW & VIEWPORT WORKSPACE */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-[#070709]">
          {/* Viewport Action Bar */}
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#0c0c10] px-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-300">
                {activeScene.title}
              </span>
              <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400">
                4K Ultra Photoreal
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsComparing(!isComparing)}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all",
                  isComparing
                    ? "border-white bg-zinc-800 text-white"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                )}
              >
                <Split className="h-3.5 w-3.5" />
                <span>Split Compare</span>
              </button>

              <a
                href={activeScene.afterImg}
                download="v6_render_4k.jpg"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save 4K</span>
              </a>
            </div>
          </div>

          {/* MAIN INTERACTIVE CANVAS VIEW */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
            {/* Interactive Before & After Comparison */}
            <div className="relative h-full max-h-[640px] w-full max-w-[960px] overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-2xl">
              {/* After (Rendered) Image */}
              <img
                src={activeScene.afterImg}
                alt="AI Photorealistic Render"
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Before (SketchUp Clay) Image Clipped */}
              {isComparing && (
                <div
                  className="absolute inset-0 overflow-hidden border-r-2 border-white shadow-2xl"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={activeScene.beforeImg}
                    alt="SketchUp Model Wireframe"
                    className="absolute inset-0 h-full w-full max-w-none object-cover brightness-90 grayscale"
                    style={{ width: "100%", height: "100%" }}
                  />
                  <div className="absolute top-3 left-3 rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                    SketchUp Raw Viewport
                  </div>
                </div>
              )}

              {/* After Label */}
              <div className="absolute top-3 right-3 rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                V6 AI 4K Render
              </div>

              {/* Interactive Draggable Slider Handle */}
              {isComparing && (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
                />
              )}

              {/* Live Rendering Progress Overlay */}
              {isRendering && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 p-6 backdrop-blur-md">
                  <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-white" />
                    <div className="text-base font-bold text-white">
                      {renderStepText}
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-white transition-all duration-300"
                        style={{ width: `${renderProgress}%` }}
                      />
                    </div>
                    <div className="text-xs text-zinc-400">
                      Processing with GPU Acceleration (Flux 2 Pro)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM GALLERY & RENDER HISTORY STRIP */}
          <div className="custom-scrollbar flex h-24 shrink-0 items-center gap-3 overflow-x-auto border-t border-zinc-800/80 bg-[#0a0a0e] px-4 py-2.5">
            <span className="shrink-0 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              Sample Scenes
            </span>
            <div className="flex items-center gap-2.5">
              {SAMPLE_GALLERY.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => {
                    setActiveScene(scene);
                    setPrompt(scene.prompt);
                  }}
                  className={cn(
                    "group relative h-18 w-28 shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-all",
                    activeScene.id === scene.id
                      ? "border-white ring-2 ring-white"
                      : "border-zinc-800 opacity-60 hover:opacity-100"
                  )}
                >
                  <img
                    src={scene.afterImg}
                    alt={scene.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-1">
                    <span className="truncate text-[9px] font-bold text-white">
                      {scene.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
