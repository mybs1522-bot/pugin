"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Zap,
  Download,
  Sliders,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Split,
  ChevronsLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// EXACT PLUGIN DATA STRUCTURES
const ROOMS_INTERIOR = [
  { v: "Living Room", e: "🛋️", d: "Lounge & sitting area" },
  { v: "Bedroom", e: "🛏️", d: "Private sleep retreat" },
  { v: "Bathroom", e: "🚿", d: "Wash & wellness" },
  { v: "Kitchen", e: "🍳", d: "Cooking & dining" },
  { v: "Dining Room", e: "🪑", d: "Formal dining space" },
  { v: "Home Office", e: "💻", d: "Work & study" },
  { v: "Kids Room", e: "🧸", d: "Playful children room" },
];

const ROOMS_EXTERIOR = [
  { v: "House", e: "🏡", d: "Single family residential" },
  { v: "Villa", e: "🏰", d: "Luxury estate & villa" },
  { v: "Apartment Building", e: "🏢", d: "Multi-family residential" },
  { v: "Office Building", e: "🏬", d: "Commercial office tower" },
  { v: "Commercial Facade", e: "🏪", d: "Retail storefront" },
  { v: "Garden / Landscape", e: "🌳", d: "Outdoor landscape & yard" },
  { v: "Entrance / Driveway", e: "🚗", d: "Approach & gate entry" },
];

const STYLES = [
  { v: "Modern", e: "🛋️", d: "Clean lines, open plan" },
  { v: "Minimalist", e: "🧊", d: "Essential elements only" },
  { v: "Scandinavian", e: "🌿", d: "Light wood, functional" },
  { v: "Industrial", e: "🧱", d: "Exposed brick & metal" },
  { v: "Bohemian", e: "🎨", d: "Eclectic, rich textures" },
  { v: "Traditional", e: "🏛️", d: "Classic moldings & detail" },
  { v: "Coastal", e: "🌊", d: "Breezy blues & sand" },
  { v: "Mid-Century Modern", e: "📻", d: "Retro 50s-60s aesthetic" },
];

const MOODS = [
  { v: "cozy", e: "☕", label: "Cozy", d: "Warm & intimate" },
  { v: "airy", e: "🌬️", label: "Airy", d: "Light & open" },
  { v: "dramatic", e: "🎭", label: "Dramatic", d: "Bold & contrasty" },
  { v: "serene", e: "🧘", label: "Serene", d: "Calm & tranquil" },
  { v: "energetic", e: "⚡", label: "Energetic", d: "Vibrant & lively" },
  { v: "luxurious", e: "💎", label: "Luxurious", d: "Opulent & refined" },
];

const PALETTES = [
  {
    v: "warm-neutrals",
    label: "Warm Neutrals",
    c: ["#FAF8F5", "#E8DFD8", "#C4B5A5", "#8C7A6B"],
    d: "Creams & sandy tones",
  },
  {
    v: "cool-neutrals",
    label: "Cool Neutrals",
    c: ["#FFFFFF", "#F1F5F9", "#94A3B8", "#475569"],
    d: "Whites, grays & pale blues",
  },
  {
    v: "bold",
    label: "Bold Accents",
    c: ["#0F172A", "#1E293B", "#3B82F6", "#EF4444"],
    d: "High contrast pops",
  },
  {
    v: "monochrome",
    label: "Monochrome",
    c: ["#FAFAFA", "#D4D4D4", "#737373", "#171717"],
    d: "Tonal depth",
  },
  {
    v: "earthy",
    label: "Earthy Tones",
    c: ["#FAF6F0", "#C87D55", "#6B705C", "#4A3B32"],
    d: "Terracotta & olive",
  },
  {
    v: "pastel",
    label: "Pastels",
    c: ["#FFF5F5", "#F0F4FF", "#FDF2F8", "#E6F4EA"],
    d: "Soft muted hues",
  },
];

const WALLS = [
  { v: "white", label: "White", color: "#FFFFFF", d: "Crisp bright white" },
  { v: "cream", label: "Cream", color: "#FAF6EE", d: "Warm soft cream" },
  {
    v: "light-gray",
    label: "Soft Gray",
    color: "#E2E8F0",
    d: "Cool neutral gray",
  },
  { v: "beige", label: "Warm Beige", color: "#E6DEC8", d: "Sandy warm beige" },
  { v: "dark", label: "Deep Dark", color: "#1E293B", d: "Moody dark gray" },
  {
    v: "textured",
    label: "Textured Stucco",
    color: "#DCD6CD",
    d: "Subtle plaster",
  },
  {
    v: "wood-paneled",
    label: "Wood Paneled",
    color: "#A87B51",
    d: "Timber accent",
  },
];

const FLOORS = [
  {
    v: "light-hardwood",
    label: "Light Hardwood",
    color: "#E2C4A2",
    d: "Blonde oak/ash",
  },
  {
    v: "dark-hardwood",
    label: "Dark Hardwood",
    color: "#4A3324",
    d: "Walnut timber",
  },
  {
    v: "marble",
    label: "Marble Stone",
    color: "#F8FAF9",
    d: "Luxurious stone",
  },
  {
    v: "concrete",
    label: "Polished Concrete",
    color: "#94A3B8",
    d: "Industrial gray",
  },
  {
    v: "carpet",
    label: "Plush Carpet",
    color: "#CBD5E1",
    d: "Soft woven textile",
  },
  {
    v: "tile",
    label: "Porcelain Tile",
    color: "#E2E8F0",
    d: "Large format tile",
  },
  {
    v: "herringbone",
    label: "Herringbone Parquet",
    color: "#B88E64",
    d: "Patterned wood",
  },
];

const WOODS = [
  { v: "light-ash", label: "Light Ash", color: "#E5D3B3" },
  { v: "medium-oak", label: "Medium Oak", color: "#B88E64" },
  { v: "dark-walnut", label: "Dark Walnut", color: "#4A3324" },
  { v: "painted-white", label: "Painted White", color: "#FFFFFF" },
  { v: "none", label: "None", color: "#334155" },
];

const METALS = [
  { v: "brushed-gold", label: "Brushed Gold", color: "#EAB308" },
  { v: "polished-silver", label: "Polished Silver", color: "#CBD5E1" },
  { v: "matte-black", label: "Matte Black", color: "#1E293B" },
  { v: "aged-bronze", label: "Aged Bronze", color: "#9A3412" },
  { v: "none", label: "None", color: "#334155" },
];

const LIGHTINGS = [
  { v: "bright-natural", label: "Bright Daylight", d: "Cool 6500K sunlight" },
  { v: "warm-ambient", label: "Warm Ambient", d: "Cozy 2700K lamp glow" },
  {
    v: "dramatic-spotlit",
    label: "Dramatic Spotlit",
    d: "High contrast pools",
  },
  { v: "soft-diffused", label: "Soft Diffused", d: "Gentle even shadows" },
];

const STEP_TABS = [
  { label: "Space", short: "1. Space" },
  { label: "Room", short: "2. Room" },
  { label: "Style", short: "3. Style" },
  { label: "Palette", short: "4. Color" },
  { label: "Finishes", short: "5. Finish" },
  { label: "Lighting", short: "6. Light" },
];

// Sample showcase scenes
const SAMPLE_GALLERY = [
  {
    id: "sample-1",
    title: "Minimalist Villa Living Room",
    category: "Interior",
    spaceType: "interior",
    roomType: "Living Room",
    primaryStyle: "Modern",
    mood: "serene",
    colorPalette: "warm-neutrals",
    wallFinish: "beige",
    floorMaterial: "light-hardwood",
    lightingMood: "bright-natural",
    beforeImg:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    afterImg:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "sample-2",
    title: "Cantilevered Forest House",
    category: "Exterior",
    spaceType: "exterior",
    roomType: "House",
    primaryStyle: "Minimalist",
    mood: "dramatic",
    colorPalette: "monochrome",
    wallFinish: "textured",
    floorMaterial: "concrete",
    lightingMood: "dramatic-spotlit",
    beforeImg:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
    afterImg:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "sample-3",
    title: "Scandinavian Kitchen & Dining",
    category: "Interior",
    spaceType: "interior",
    roomType: "Kitchen",
    primaryStyle: "Scandinavian",
    mood: "airy",
    colorPalette: "cool-neutrals",
    wallFinish: "white",
    floorMaterial: "light-hardwood",
    lightingMood: "soft-diffused",
    beforeImg:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=80",
    afterImg:
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=80",
  },
];

export default function SamplePluginRendererPage() {
  const [activeScene, setActiveScene] = useState(SAMPLE_GALLERY[0]);

  // 6-Step Selection Questionnaire
  const [spaceType, setSpaceType] = useState<"interior" | "exterior">(
    "interior"
  );
  const [roomType, setRoomType] = useState("Living Room");
  const [primaryStyle, setPrimaryStyle] = useState("Modern");
  const [mood, setMood] = useState("cozy");
  const [colorPalette, setColorPalette] = useState("warm-neutrals");
  const [accentColor, setAccentColor] = useState("#8B5CF6");
  const [wallFinish, setWallFinish] = useState("white");
  const [floorMaterial, setFloorMaterial] = useState("light-hardwood");
  const [woodTone, setWoodTone] = useState("medium-oak");
  const [metalAccent, setMetalAccent] = useState("brushed-gold");
  const [lightingMood, setLightingMood] = useState("bright-natural");

  // Step UI State
  const [currentStep, setCurrentStep] = useState(0);
  const [isRenderSettingsOpen, setIsRenderSettingsOpen] = useState(true);
  const [creativity, setCreativity] = useState(65);
  const [geometryStrength, setGeometryStrength] = useState(85);

  // Viewport comparison slider
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isComparing, setIsComparing] = useState(true);

  // Render status
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStepText, setRenderStepText] = useState("");
  const [renderCount, setRenderCount] = useState(8);

  const handleSpaceChange = (type: "interior" | "exterior") => {
    setSpaceType(type);
    if (type === "exterior") {
      setRoomType("House");
    } else {
      setRoomType("Living Room");
    }
  };

  const handleTriggerRender = () => {
    if (isRendering) return;
    setIsRendering(true);
    setRenderProgress(12);
    setRenderStepText("Capturing SketchUp 3D Viewport...");

    setTimeout(() => {
      setRenderProgress(40);
      setRenderStepText(
        `Applying ${primaryStyle} Style & ${lightingMood} PBR Lighting...`
      );
    }, 600);

    setTimeout(() => {
      setRenderProgress(75);
      setRenderStepText("Generating 4K Neural Photorealistic Render...");
    }, 1300);

    setTimeout(() => {
      setRenderProgress(95);
      setRenderStepText("Color Grading & Super-Resolution Upscaling...");
    }, 2000);

    setTimeout(() => {
      setRenderProgress(100);
      setRenderStepText("Render Complete!");
      setIsRendering(false);
      setRenderCount((c) => Math.max(0, c - 1));
    }, 2600);
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#09090b] font-sans text-white select-none [&_*]:[scrollbar-width:none] [&_*::-webkit-scrollbar]:hidden">
      {/* TOP PLUGIN HEADER */}
      <header className="flex h-13 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#0e0e12] px-4">
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

        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          <span>v6.2.4 Active</span>
        </div>
      </header>

      {/* MAIN PLUGIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT CONTROLS PANEL (EXACT 6-STEP PLUGIN ARCHITECTURE) */}
        <aside className="flex w-[400px] shrink-0 flex-col overflow-hidden border-r border-zinc-800 bg-[#0d0d11]">
          {/* Collapsible Header */}
          <div
            onClick={() => setIsRenderSettingsOpen(!isRenderSettingsOpen)}
            className="flex h-11 shrink-0 cursor-pointer items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 transition-colors hover:bg-zinc-800/60"
          >
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-zinc-400" />
              <span className="text-xs font-black tracking-wider text-zinc-200 uppercase">
                Render Settings
              </span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300">
                Step {currentStep + 1} of 6
              </span>
            </div>
            <span className="text-xs font-bold text-zinc-400">
              {isRenderSettingsOpen ? "▲ Close" : "▼ Open"}
            </span>
          </div>

          {isRenderSettingsOpen && (
            <>
              {/* STEP TABS: 6 EQUAL SIZED PILLS WITH ZERO HORIZONTAL OVERFLOW */}
              <div className="grid shrink-0 grid-cols-6 gap-1 border-b border-zinc-800/80 bg-[#0a0a0e] p-1.5">
                {STEP_TABS.map((tab, idx) => (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setCurrentStep(idx)}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-md py-1 text-center transition-all",
                      currentStep === idx
                        ? "bg-zinc-800 font-bold text-white shadow-sm ring-1 ring-white/20"
                        : "font-medium text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                    )}
                  >
                    <span className="truncate text-[10px]">{tab.short}</span>
                  </button>
                ))}
              </div>

              {/* QUICK PREV / NEXT BAR */}
              <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/60 bg-zinc-950/60 px-3.5 py-1.5 text-xs text-zinc-400">
                <button
                  type="button"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  className="flex cursor-pointer items-center gap-1 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <span className="text-xs font-bold text-zinc-200">
                  Step {currentStep + 1}: {STEP_TABS[currentStep].label}
                </span>
                <button
                  type="button"
                  disabled={currentStep === 5}
                  onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                  className="flex cursor-pointer items-center gap-1 hover:text-white disabled:opacity-30"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* SCROLLABLE STEP CONTENT BODY (VERTICAL ONLY, SCROLLBAR HIDDEN) */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {/* STEP 0: Space Type */}
                {currentStep === 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                      Space Type
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div
                        onClick={() => handleSpaceChange("interior")}
                        className={cn(
                          "flex cursor-pointer flex-col gap-1 rounded-xl border p-3 transition-all",
                          spaceType === "interior"
                            ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                            : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                        )}
                      >
                        <span className="text-2xl">🏠</span>
                        <span className="text-xs font-bold text-white">
                          Interior
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Inside a building — rooms, hallways, living spaces
                        </span>
                      </div>

                      <div
                        onClick={() => handleSpaceChange("exterior")}
                        className={cn(
                          "flex cursor-pointer flex-col gap-1 rounded-xl border p-3 transition-all",
                          spaceType === "exterior"
                            ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                            : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                        )}
                      >
                        <span className="text-2xl">🏡</span>
                        <span className="text-xs font-bold text-white">
                          Exterior
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Outside a building — façades, gardens, entrances
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 1: Room / Building Type */}
                {currentStep === 1 && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                      {spaceType === "exterior"
                        ? "Building & Site Type"
                        : "Room & Space Type"}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(spaceType === "exterior"
                        ? ROOMS_EXTERIOR
                        : ROOMS_INTERIOR
                      ).map((r) => (
                        <div
                          key={r.v}
                          onClick={() => setRoomType(r.v)}
                          className={cn(
                            "flex cursor-pointer flex-col gap-0.5 rounded-lg border p-2.5 transition-all",
                            roomType === r.v
                              ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                              : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                          )}
                        >
                          <span className="text-lg">{r.e}</span>
                          <span className="text-xs font-bold text-white">
                            {r.v}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {r.d}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: Style & Mood */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
                        Design Style
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {STYLES.map((s) => (
                          <div
                            key={s.v}
                            onClick={() => setPrimaryStyle(s.v)}
                            className={cn(
                              "flex cursor-pointer flex-col gap-0.5 rounded-lg border p-2.5 transition-all",
                              primaryStyle === s.v
                                ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                                : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                            )}
                          >
                            <span className="text-lg">{s.e}</span>
                            <span className="text-xs font-bold text-white">
                              {s.v}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {s.d}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
                        Atmospheric Mood
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {MOODS.map((m) => (
                          <div
                            key={m.v}
                            onClick={() => setMood(m.v)}
                            className={cn(
                              "flex cursor-pointer flex-col gap-0.5 rounded-lg border p-2.5 transition-all",
                              mood === m.v
                                ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                                : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                            )}
                          >
                            <span className="text-lg">{m.e}</span>
                            <span className="text-xs font-bold text-white">
                              {m.label}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {m.d}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Color Palette & Accent */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
                        Color Scheme
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {PALETTES.map((p) => (
                          <div
                            key={p.v}
                            onClick={() => setColorPalette(p.v)}
                            className={cn(
                              "flex cursor-pointer flex-col gap-1 rounded-lg border p-2.5 transition-all",
                              colorPalette === p.v
                                ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                                : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                            )}
                          >
                            <div className="flex h-3 w-full overflow-hidden rounded">
                              {p.c.map((hex, i) => (
                                <div
                                  key={i}
                                  className="h-full flex-1"
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                            <span className="mt-1 text-xs font-bold text-white">
                              {p.label}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {p.d}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
                        Custom Accent Color
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-2.5">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent"
                        />
                        <span className="font-mono text-xs font-bold text-zinc-300">
                          {accentColor}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Finishes & Materials */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
                        Wall Finish
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {WALLS.map((w) => (
                          <div
                            key={w.v}
                            onClick={() => setWallFinish(w.v)}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-all",
                              wallFinish === w.v
                                ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                                : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                            )}
                          >
                            <div
                              className="h-4 w-4 shrink-0 rounded-full border border-zinc-700"
                              style={{ backgroundColor: w.color }}
                            />
                            <div className="truncate">
                              <div className="text-xs font-bold text-white">
                                {w.label}
                              </div>
                              <div className="truncate text-[9px] text-zinc-400">
                                {w.d}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
                        Floor Material
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {FLOORS.map((f) => (
                          <div
                            key={f.v}
                            onClick={() => setFloorMaterial(f.v)}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-all",
                              floorMaterial === f.v
                                ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                                : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                            )}
                          >
                            <div
                              className="h-4 w-4 shrink-0 rounded-full border border-zinc-700"
                              style={{ backgroundColor: f.color }}
                            />
                            <div className="truncate">
                              <div className="text-xs font-bold text-white">
                                {f.label}
                              </div>
                              <div className="truncate text-[9px] text-zinc-400">
                                {f.d}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Furniture, Accents & Lighting */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
                        Wood Tone
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {WOODS.map((w) => (
                          <div
                            key={w.v}
                            onClick={() => setWoodTone(w.v)}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-all",
                              woodTone === w.v
                                ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                                : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                            )}
                          >
                            <div
                              className="h-4 w-4 shrink-0 rounded-full border border-zinc-700"
                              style={{ backgroundColor: w.color }}
                            />
                            <span className="text-xs font-bold text-white">
                              {w.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
                        Metal Accent
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {METALS.map((m) => (
                          <div
                            key={m.v}
                            onClick={() => setMetalAccent(m.v)}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-all",
                              metalAccent === m.v
                                ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                                : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                            )}
                          >
                            <div
                              className="h-4 w-4 shrink-0 rounded-full border border-zinc-700"
                              style={{ backgroundColor: m.color }}
                            />
                            <span className="text-xs font-bold text-white">
                              {m.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
                        Lighting Mood
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {LIGHTINGS.map((l) => (
                          <div
                            key={l.v}
                            onClick={() => setLightingMood(l.v)}
                            className={cn(
                              "flex cursor-pointer flex-col gap-0.5 rounded-lg border p-2.5 transition-all",
                              lightingMood === l.v
                                ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                                : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                            )}
                          >
                            <span className="text-xs font-bold text-white">
                              {l.label}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {l.d}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* BOTTOM FIXED BAR: CREATE RENDER ACTION */}
          <div className="shrink-0 border-t border-zinc-800 bg-[#0b0b0f] p-4">
            <button
              type="button"
              onClick={handleTriggerRender}
              disabled={isRendering}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white text-sm font-black text-black shadow-xl transition-all hover:bg-zinc-200 disabled:opacity-75"
            >
              {isRendering ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  <span>Rendering ({renderProgress}%)...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-black text-black" />
                  <span>Create Render</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* RIGHT PREVIEW & VIEWPORT WORKSPACE */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-[#070709]">
          {/* Viewport Action Bar */}
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#0c0c10] px-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-300">
                1. SketchUp Viewport vs 2. Render & Walkthrough
              </span>
              <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400">
                4K Photoreal Output
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
                <span>
                  {isComparing ? "Hide Split View" : "Show Split View"}
                </span>
              </button>

              <a
                href={activeScene.afterImg}
                download="v6_render_4k.jpg"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Image</span>
              </a>
            </div>
          </div>

          {/* MAIN INTERACTIVE CANVAS VIEW */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
            <div className="relative h-full max-h-[640px] w-full max-w-[960px] overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-2xl select-none">
              {/* After (Photorealistic AI Render) */}
              <img
                src={activeScene.afterImg}
                alt="AI Photorealistic Render"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              />

              {/* Before (SketchUp Raw Viewport) Clipped with CSS Polygon */}
              {isComparing && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                  }}
                >
                  <img
                    src={activeScene.beforeImg}
                    alt="SketchUp Raw Viewport"
                    className="h-full w-full object-cover brightness-90 contrast-105 grayscale"
                  />
                  <div className="absolute top-3 left-3 rounded-md border border-white/10 bg-black/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md">
                    SketchUp Viewport (Original)
                  </div>
                </div>
              )}

              {/* After Label */}
              <div className="pointer-events-none absolute top-3 right-3 rounded-md border border-white/10 bg-black/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md">
                AI Photorealistic Render
              </div>

              {/* Interactive Divider Handle */}
              {isComparing && (
                <div
                  className="pointer-events-none absolute top-0 bottom-0 z-10 flex w-0.5 items-center justify-center bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-black/90 text-white shadow-xl">
                    <ChevronsLeftRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              {/* Range Input for dragging */}
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

              {/* Rendering Overlay */}
              {isRendering && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 p-6 backdrop-blur-md">
                  <div className="flex w-full max-w-md flex-col items-center gap-3.5 text-center">
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
                      Processing PBR lighting & materials
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM GALLERY & RENDER HISTORY STRIP (CLEAN, NO SCROLLBAR) */}
          <div className="flex h-24 shrink-0 items-center gap-3 overflow-x-auto border-t border-zinc-800 bg-[#0a0a0e] px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="shrink-0 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              Past Renders
            </span>
            <div className="flex items-center gap-2.5">
              {SAMPLE_GALLERY.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => {
                    setActiveScene(scene);
                    setSpaceType(scene.spaceType as "interior" | "exterior");
                    setRoomType(scene.roomType);
                    setPrimaryStyle(scene.primaryStyle);
                    setMood(scene.mood);
                    setColorPalette(scene.colorPalette);
                    setWallFinish(scene.wallFinish);
                    setFloorMaterial(scene.floorMaterial);
                    setLightingMood(scene.lightingMood);
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
