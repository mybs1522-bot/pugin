import { GLSLHills } from "@/components/ui/glsl-hills";
("use client");

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Download,
  Sliders,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Split,
  Columns2,
  ChevronsLeftRight,
  Film,
  Building2,
  DoorOpen,
  Brush,
  Droplets,
  PaintBucket,
  Lightbulb,
  Cpu,
  Crosshair,
  Scan,
  Box,
  User,
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InteractiveFolderGallery,
  GalleryPhoto,
} from "@/components/ui/interactive-folder-gallery";

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

// PREMIUM STEP DOCK ITEMS WITH ICONS & TOOLTIPS
const STEP_ITEMS = [
  {
    step: 0,
    title: "Step 1: Space Type",
    subtitle: "Interior vs Exterior Architecture",
    icon: Building2,
  },
  {
    step: 1,
    title: "Step 2: Room & Building Type",
    subtitle: "Living Room, Bedroom, Villa, Facade...",
    icon: DoorOpen,
  },
  {
    step: 2,
    title: "Step 3: Design Style & Mood",
    subtitle: "Minimalist, Modern, Scandinavian, Cozy...",
    icon: Brush,
  },
  {
    step: 3,
    title: "Step 4: Color Palette & Accent",
    subtitle: "Warm Neutrals, Earthy, Monochrome...",
    icon: Droplets,
  },
  {
    step: 4,
    title: "Step 5: Finishes & Materials",
    subtitle: "Plaster, Hardwood, Marble, Tile...",
    icon: Box,
  },
  {
    step: 5,
    title: "Step 6: Lighting Mood",
    subtitle: "Bright Daylight, Warm Ambient, Spotlit...",
    icon: Lightbulb,
  },
];

// 4x4 GPU Render Tiles (16 total) with progressive multi-pass state
const TOTAL_TILES = 16;
const TILE_ORDER = [5, 6, 9, 10, 1, 2, 4, 7, 8, 11, 13, 14, 0, 3, 12, 15];

const DEFAULT_VIEWPORT =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80";
const DEFAULT_RENDER =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80";
const DEFAULT_VIDEO =
  "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-architecture-and-interior-design-41484-large.mp4";

export default function SamplePluginRendererPage() {
  // User Authentication & Session
  const [userEmail, setUserEmail] = useState<string>("user@v6render.com");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authInputEmail, setAuthInputEmail] = useState<string>("");
  const [authOtpCode, setAuthOtpCode] = useState<string>("");
  const [authStep, setAuthStep] = useState<1 | 2>(1);
  const [authStatusText, setAuthStatusText] = useState<string>("");

  // Support Modal State
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [supportCategory, setSupportCategory] =
    useState<string>("General Question");
  const [supportMessage, setSupportMessage] = useState<string>("");
  const [supportStatusText, setSupportStatusText] = useState<string>("");
  const [supportChatList, setSupportChatList] = useState<
    Array<{ sender: string; text: string; time: string }>
  >([
    {
      sender: "Admin Support",
      text: "Welcome to V6 Render! Let us know if you need help with SketchUp rendering, lighting, or materials.",
      time: "Just now",
    },
  ]);

  // Loaded images & video state (from /load or default)
  const [viewportImg, setViewportImg] = useState<string>(DEFAULT_VIEWPORT);
  const [renderImg, setRenderImg] = useState<string>(DEFAULT_RENDER);
  const [renderVideo, setRenderVideo] = useState<string>(DEFAULT_VIDEO);
  const [sceneTitle, setSceneTitle] = useState<string>(
    "SketchUp Active Viewport"
  );
  const [statusMessage, setStatusMessage] = useState<string>(
    "Viewport updated! Ready to render."
  );

  // Gallery Photos for bottom-right folder
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([
    { id: 1, image: DEFAULT_RENDER, title: "Initial 4K Master" },
  ]);
  const [isFolderOpen, setIsFolderOpen] = useState(false);

  // Flying snapshot animation state
  const [isFlyingToFolder, setIsFlyingToFolder] = useState(false);
  const [flyingImage, setFlyingImage] = useState<string>("");

  // Render status (Image)
  const [hasRendered, setHasRendered] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderStepText, setRenderStepText] = useState<string>("");

  // REALISTIC GPU PATH-TRACING STATE
  const [tileStages, setTileStages] = useState<number[]>(new Array(16).fill(0));
  const [activeBuckets, setActiveBuckets] = useState<number[]>([]);
  const [blueprintPhase, setBlueprintPhase] = useState<
    "cad" | "noise_init" | "progressive_buckets" | "optix_denoise" | "idle"
  >("idle");
  const [gpuTelemetry, setGpuTelemetry] = useState({
    pass: 0,
    totalPasses: 64,
    spp: 0,
    rays: "0.0M",
    vram: "3.2 GB / 12.0 GB",
    timeElapsed: "0.0s",
  });

  // 3D Video Walkthrough Status
  const [hasRenderedVideo, setHasRenderedVideo] = useState<boolean>(false);
  const [isVideoRendering, setIsVideoRendering] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [videoStepText, setVideoStepText] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<"image" | "video">("image");

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

  // Viewport mode: Split Slider (true) vs Side-by-Side Dual (false)
  const [isComparing, setIsComparing] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  // Load custom images & video from /load or storage
  useEffect(() => {
    const savedEmail =
      localStorage.getItem("v6_user_email") ||
      sessionStorage.getItem("v6_user_email");
    if (savedEmail) {
      setUserEmail(savedEmail);
    }

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
    if (savedRender) {
      setRenderImg(savedRender);
      setGalleryPhotos([
        {
          id: Date.now(),
          image: savedRender,
          title: savedTitle || "4K Master Render",
        },
      ]);
    }
    if (savedVideo) setRenderVideo(savedVideo);
    if (savedTitle) setSceneTitle(savedTitle);
  }, []);

  const handleSpaceChange = (type: "interior" | "exterior") => {
    setSpaceType(type);
    if (type === "exterior") {
      setRoomType("House");
    } else {
      setRoomType("Living Room");
    }
  };

  const handleRefreshViewport = () => {
    setStatusMessage("Capturing latest SketchUp camera view...");
    setTimeout(() => {
      setStatusMessage("Viewport updated! Ready to render.");
    }, 600);
  };

  // Auth Handlers
  const handleSendOtp = () => {
    if (!authInputEmail || !authInputEmail.includes("@")) {
      setAuthStatusText("Please enter a valid email address.");
      return;
    }
    setAuthStatusText("Sending 4-digit verification code...");
    setTimeout(() => {
      setAuthStep(2);
      setAuthStatusText("✓ 4-digit code sent to your email!");
    }, 700);
  };

  const handleVerifyOtp = () => {
    if (!authOtpCode || authOtpCode.length < 4) {
      setAuthStatusText("Please enter the 4-digit code.");
      return;
    }
    setUserEmail(authInputEmail);
    localStorage.setItem("v6_user_email", authInputEmail);
    sessionStorage.setItem("v6_user_email", authInputEmail);
    setIsAuthModalOpen(false);
    setAuthStep(1);
    setAuthStatusText("");
    setStatusMessage(`Logged in as ${authInputEmail}`);
  };

  const handleSignOut = () => {
    setIsAuthModalOpen(true);
    setAuthStep(1);
    setAuthInputEmail(userEmail);
    setAuthStatusText("");
  };

  // Support Message Submit
  const handleSendSupportMessage = () => {
    if (!supportMessage.trim()) return;
    const newMsg = {
      sender: "You",
      text: supportMessage,
      time: "Just now",
    };
    setSupportChatList((prev) => [...prev, newMsg]);
    setSupportMessage("");
    setSupportStatusText("✓ Message sent! Support will respond shortly.");
    setTimeout(() => {
      setSupportStatusText("");
    }, 3000);
  };

  // REALISTIC SLOWER PROGRESSIVE GPU RENDER PIPELINE (~7.5 SECONDS)
  const handleTriggerRender = () => {
    if (isRendering) return;
    setIsRendering(true);
    setHasRendered(false);
    setTileStages(new Array(16).fill(0));
    setActiveBuckets([]);
    setBlueprintPhase("cad");
    setRenderProgress(2);
    setRenderStepText(
      "Pass 1/64: Initializing CUDA Cores & BVH Spatial Hierarchy..."
    );
    setStatusMessage("Rendering 4K photorealistic image on GPU...");
    setGpuTelemetry({
      pass: 1,
      totalPasses: 64,
      spp: 16,
      rays: "1.4M",
      vram: "4.1 GB / 12.0 GB",
      timeElapsed: "0.4s",
    });

    // Step 1: CAD Blueprint Wireframe & Ray Cast Matrix (0s -> 1.4s)
    setTimeout(() => {
      setRenderProgress(12);
      setRenderStepText(
        "Pass 4/64: Raycasting Primary Surface Intersections & PBR Normal Map..."
      );
      setGpuTelemetry({
        pass: 4,
        totalPasses: 64,
        spp: 32,
        rays: "6.8M",
        vram: "5.4 GB / 12.0 GB",
        timeElapsed: "1.2s",
      });
    }, 1000);

    // Step 2: Coarse Noisy Monte-Carlo Preview Pass (1.6s -> 2.8s)
    setTimeout(() => {
      setBlueprintPhase("noise_init");
      setRenderProgress(24);
      setRenderStepText(
        "Pass 12/64: Monte-Carlo Path Tracing (Coarse Direct Light & Shadows)..."
      );
      setTileStages(new Array(16).fill(1));
      setGpuTelemetry({
        pass: 12,
        totalPasses: 64,
        spp: 64,
        rays: "18.2M",
        vram: "6.8 GB / 12.0 GB",
        timeElapsed: "2.2s",
      });
    }, 1800);

    // Step 3: Progressive Segmented GPU Bucket Rendering (2.8s -> 6.0s)
    setTimeout(() => {
      setBlueprintPhase("progressive_buckets");
      setRenderStepText(
        "Pass 32/64: Multi-Threaded GPU Bucket Raytracing & Secondary Bounces..."
      );

      TILE_ORDER.forEach((tileIdx, i) => {
        const pairedTile = TILE_ORDER[(i + 8) % TOTAL_TILES];

        setTimeout(() => {
          setActiveBuckets([tileIdx, pairedTile]);

          setTileStages((prev) => {
            const next = [...prev];
            next[tileIdx] = Math.max(next[tileIdx], 2);
            next[pairedTile] = Math.max(next[pairedTile], 2);
            return next;
          });

          setTimeout(() => {
            setTileStages((prev) => {
              const next = [...prev];
              next[tileIdx] = 3;
              next[pairedTile] = 3;
              return next;
            });
          }, 180);

          const progress = Math.round(26 + ((i + 1) / TOTAL_TILES) * 58);
          setRenderProgress(progress);
          setGpuTelemetry({
            pass: Math.min(60, 20 + Math.round((i / TOTAL_TILES) * 40)),
            totalPasses: 64,
            spp: 128 + i * 56,
            rays: `${(22.0 + i * 2.8).toFixed(1)}M`,
            vram: "7.9 GB / 12.0 GB",
            timeElapsed: `${(2.8 + i * 0.2).toFixed(1)}s`,
          });
        }, i * 190);
      });
    }, 2800);

    // Step 4: OptiX AI Neural Denoising & Super-Resolution Pass (6.2s -> 7.2s)
    setTimeout(() => {
      setBlueprintPhase("optix_denoise");
      setActiveBuckets([]);
      setTileStages(new Array(16).fill(3));
      setRenderProgress(94);
      setRenderStepText(
        "Pass 64/64: OptiX AI Neural Denoising & 4K Specular Reconstruction..."
      );
      setGpuTelemetry({
        pass: 64,
        totalPasses: 64,
        spp: 1024,
        rays: "68.4M",
        vram: "8.4 GB / 12.0 GB",
        timeElapsed: "6.4s",
      });
    }, 6200);

    // Step 5: Render Fully Finished & Glides into Folder (7.4s)
    setTimeout(() => {
      setRenderProgress(100);
      setRenderStepText("4K Photorealistic Render Complete!");
      setIsRendering(false);
      setHasRendered(true);
      setBlueprintPhase("idle");
      setPreviewMode("image");
      setStatusMessage("Render complete! Saved in project renders gallery.");

      setFlyingImage(renderImg);
      setIsFlyingToFolder(true);

      setTimeout(() => {
        const newPhoto: GalleryPhoto = {
          id: Date.now(),
          image: renderImg,
          title: `${roomType} - ${primaryStyle}`,
        };
        setGalleryPhotos((prev) => [newPhoto, ...prev.slice(0, 5)]);
        setIsFlyingToFolder(false);
      }, 1300);
    }, 7400);
  };

  const handleTriggerVideoWalkthrough = () => {
    if (isVideoRendering) return;
    setIsVideoRendering(true);
    setVideoProgress(15);
    setVideoStepText("Interpolating 3D Camera Bezier Path...");
    setStatusMessage("Rendering 3D camera walkthrough...");

    setTimeout(() => {
      setVideoProgress(45);
      setVideoStepText("Synthesizing 60fps Volumetric Frames...");
    }, 800);

    setTimeout(() => {
      setVideoProgress(78);
      setVideoStepText("Raytracing Dynamic Lighting & Reflections...");
    }, 1600);

    setTimeout(() => {
      setVideoProgress(95);
      setVideoStepText("Encoding 4K Cinema MP4 Video...");
    }, 2400);

    setTimeout(() => {
      setVideoProgress(100);
      setVideoStepText("Video Walkthrough Ready!");
      setIsVideoRendering(false);
      setHasRenderedVideo(true);
      setPreviewMode("video");
      setStatusMessage("3D Video Walkthrough Ready!");
    }, 3000);
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#09090b] font-sans text-white select-none [&_*]:[scrollbar-width:none] [&_*::-webkit-scrollbar]:hidden">
      {/* TOP PLUGIN HEADER WITH USER ACCOUNT PILL & LIVE SUPPORT */}
      <header className="flex h-13 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#0e0e12] px-4">
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
          </div>

          <div className="hidden items-center gap-2 border-l border-zinc-800 pl-3 sm:flex">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live SketchUp Link Active
            </span>
          </div>
        </div>

        {/* HEADER RIGHT: USER EMAIL PILL + LIVE SUPPORT BUTTON + VERSION */}
        <div className="flex items-center gap-2.5">
          {/* USER ACCOUNT BADGE */}
          {userEmail ? (
            <div className="flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/80 px-3 py-1 text-xs text-zinc-200 shadow-sm">
              <User className="h-3.5 w-3.5 text-zinc-400" />
              <span className="font-semibold">{userEmail}</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="ml-1 cursor-pointer text-[10px] text-red-400 underline hover:text-red-300"
              >
                Switch
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/80 px-3 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
            >
              <User className="h-3.5 w-3.5 text-zinc-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* LIVE SUPPORT CHAT BUTTON WITH 1 NEW BADGE */}
          <button
            type="button"
            onClick={() => setIsSupportModalOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1 text-xs font-medium text-zinc-200 transition-all hover:bg-zinc-800 hover:text-white"
          >
            <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
            <span>Support</span>
            <span className="py-0.2 rounded-full bg-red-500/90 px-1.5 text-[9px] font-bold text-white shadow-xs">
              1 New
            </span>
          </button>

          {/* VERSION TAG */}
          <span className="pl-1 text-xs font-medium text-zinc-500">
            v6.2.4 Active
          </span>
        </div>
      </header>

      {/* MAIN PLUGIN WORKSPACE */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* FAR LEFT: VERTICAL PREMIUM ICON DOCK WITH HOVER TOOLTIPS */}
        <div className="z-40 flex w-14 shrink-0 flex-col items-center gap-2.5 border-r border-zinc-800 bg-[#0a0a0d] py-3">
          {STEP_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentStep === item.step;
            return (
              <div key={item.step} className="group relative">
                <button
                  type="button"
                  onClick={() => setCurrentStep(item.step)}
                  className={cn(
                    "flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all",
                    isActive
                      ? "bg-white text-black shadow-lg ring-2 shadow-white/10 ring-white/30"
                      : "text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </button>

                {/* PREMIUM FLOATING TOOLTIP ON HOVER */}
                <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 origin-left -translate-y-1/2 scale-95 rounded-lg border border-zinc-700/80 bg-zinc-900/95 px-3 py-1.5 whitespace-nowrap opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span>{item.title}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {item.subtitle}
                  </div>
                  <div className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-zinc-900/95" />
                </div>
              </div>
            );
          })}
        </div>

        {/* CONTROLS CONTENT PANEL (ACTIVE STEP CONTROLS) */}
        <aside className="flex w-[350px] shrink-0 flex-col overflow-hidden border-r border-zinc-800 bg-[#0d0d11]">
          {/* Active Step Header Bar */}
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-zinc-200 uppercase">
                {STEP_ITEMS[currentStep].title}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-20"
                title="Previous step"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={currentStep === 5}
                onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-20"
                title="Next step"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* SCROLLABLE STEP CONTENT BODY */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* STEP 0: Space Type */}
            {currentStep === 0 && (
              <div className="space-y-3">
                <div className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                  Space Type
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  <div
                    onClick={() => handleSpaceChange("interior")}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all",
                      spaceType === "interior"
                        ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                        : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                    )}
                  >
                    <span className="text-3xl">🏠</span>
                    <div>
                      <div className="text-sm font-bold text-white">
                        Interior
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Inside a building — rooms, hallways, living spaces
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleSpaceChange("exterior")}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all",
                      spaceType === "exterior"
                        ? "border-white bg-zinc-800/90 text-white ring-1 ring-white"
                        : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                    )}
                  >
                    <span className="text-3xl">🏡</span>
                    <div>
                      <div className="text-sm font-bold text-white">
                        Exterior
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Outside a building — façades, gardens, entrances
                      </div>
                    </div>
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
                      <span className="text-[10px] text-zinc-400">{r.d}</span>
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
                        <span className="text-[10px] text-zinc-400">{s.d}</span>
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
                        <span className="text-[10px] text-zinc-400">{m.d}</span>
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
                        <span className="text-[10px] text-zinc-400">{p.d}</span>
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
                      className="h-8 w-12 cursor-pointer border-0 bg-transparent"
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
                        <span className="text-[10px] text-zinc-400">{l.d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM FIXED BAR: CREATE RENDER & REFRESH VIEWPORT */}
          <div className="shrink-0 space-y-2 border-t border-zinc-800 bg-[#0b0b0f] p-3.5">
            <button
              type="button"
              onClick={handleTriggerRender}
              disabled={isRendering || isVideoRendering}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white text-sm font-black text-black shadow-xl transition-all hover:bg-zinc-200 disabled:opacity-75"
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

            {/* REFRESH VIEWPORT BUTTON */}
            <button
              type="button"
              onClick={handleRefreshViewport}
              className="flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white"
            >
              <RefreshCw className="h-3 w-3 text-zinc-400" />
              <span>Refresh Viewport</span>
            </button>

            {/* LIVE STATUS INDICATOR */}
            <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-zinc-400">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-400" />
              <span className="truncate">{statusMessage}</span>
            </div>
          </div>
        </aside>

        {/* RIGHT PREVIEW & VIEWPORT WORKSPACE */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-[#070709]">
          {/* GLSL ANIMATED HILLS BACKGROUND */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40 select-none">
            <GLSLHills
              width="100%"
              height="100%"
              cameraZ={125}
              planeSize={256}
              speed={0.4}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(7,7,9,0.85)_80%,#070709_100%)]" />
          </div>

          {/* Viewport Action Bar */}
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#0c0c10] px-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-300">
                {sceneTitle}
              </span>
              <span className="rounded bg-zinc-800/80 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                {hasRendered
                  ? previewMode === "video"
                    ? "3D Video Walkthrough"
                    : "4K Photoreal Output"
                  : isRendering
                    ? `CUDA Core Pass: ${gpuTelemetry.pass}/${gpuTelemetry.totalPasses}`
                    : "Raw Viewport Loaded"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* IMAGE VS VIDEO TOGGLE */}
              {hasRendered && (
                <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/80 p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("image")}
                    className={cn(
                      "cursor-pointer rounded-md px-2 py-1 text-xs font-semibold transition-all",
                      previewMode === "image"
                        ? "bg-zinc-800 text-white shadow-xs"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    🖼️ Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasRenderedVideo) {
                        handleTriggerVideoWalkthrough();
                      } else {
                        setPreviewMode("video");
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all",
                      previewMode === "video"
                        ? "bg-zinc-800 text-white shadow-xs"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    <Film className="h-3 w-3" />
                    <span>🎬 3D Video</span>
                  </button>
                </div>
              )}

              {/* TOGGLE SPLIT SLIDER VS SIDE-BY-SIDE VIEW (IMAGE MODE ONLY) */}
              {previewMode === "image" && (
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
                  {isComparing ? (
                    <>
                      <Columns2 className="h-3.5 w-3.5" />
                      <span>Side-by-Side View</span>
                    </>
                  ) : (
                    <>
                      <Split className="h-3.5 w-3.5" />
                      <span>Split Compare Slider</span>
                    </>
                  )}
                </button>
              )}

              {hasRendered && (
                <a
                  href={previewMode === "video" ? renderVideo : renderImg}
                  download={
                    previewMode === "video"
                      ? "v6_walkthrough.mp4"
                      : "v6_render_4k.jpg"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>
                    {previewMode === "video"
                      ? "Download MP4"
                      : "Download Image"}
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* MAIN CANVAS AREA */}
          <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-4">
            {!isComparing ? (
              <div className="grid h-full max-h-[640px] w-full max-w-[1100px] grid-cols-2 gap-4">
                {/* LEFT CARD: 1. SKETCHUP VIEWPORT */}
                <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-2xl">
                  <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-3.5">
                    <span className="text-xs font-bold text-zinc-300">
                      1. SketchUp Viewport
                    </span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400">
                      Original
                    </span>
                  </div>
                  <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-zinc-950">
                    <img
                      src={viewportImg}
                      alt="SketchUp Viewport Capture"
                      className="h-full w-full object-contain p-1.5"
                    />
                  </div>
                </div>

                {/* RIGHT CARD: 2. RENDER OUTPUT & GPU PROGRESSIVE BLUEPRINT CANVAS */}
                <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-2xl">
                  <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-300">
                        {previewMode === "video"
                          ? "2. 3D Video Walkthrough"
                          : "2. Render Output"}
                      </span>
                      {isRendering && (
                        <span className="flex items-center gap-1 font-mono text-[10px] text-cyan-400">
                          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-cyan-400" />
                          CUDA Active
                        </span>
                      )}
                    </div>
                    <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-indigo-300">
                      {hasRendered
                        ? previewMode === "video"
                          ? "60 FPS 4K"
                          : "4K Output"
                        : isRendering
                          ? `${renderProgress}%`
                          : "Standby"}
                    </span>
                  </div>

                  <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-zinc-950">
                    {/* VIDEO MODE */}
                    {previewMode === "video" && hasRenderedVideo ? (
                      <video
                        src={renderVideo}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : isVideoRendering ? (
                      <div className="flex max-w-sm flex-col items-center justify-center p-6 text-center">
                        <RefreshCw className="mb-3 h-8 w-8 animate-spin text-white" />
                        <div className="mb-1 text-sm font-bold text-white">
                          {videoStepText}
                        </div>
                        <div className="mb-3 text-xs text-zinc-400">
                          Rendering 3D Camera Walkthrough
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-white transition-all duration-300"
                            style={{ width: `${videoProgress}%` }}
                          />
                        </div>
                        <div className="mt-2 font-mono text-xs font-bold text-zinc-400">
                          {videoProgress}%
                        </div>
                      </div>
                    ) : isRendering ? (
                      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#030712] select-none">
                        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                          <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-1.5">
                            <img
                              src={renderImg}
                              alt="Rendering Target"
                              className={cn(
                                "h-full w-full object-contain transition-all duration-700",
                                blueprintPhase === "cad"
                                  ? "scale-[1.02] opacity-20 blur-xl contrast-200 grayscale"
                                  : blueprintPhase === "noise_init"
                                    ? "opacity-60 blur-md contrast-150 saturate-150"
                                    : blueprintPhase === "optix_denoise"
                                      ? "blur-0 opacity-100 contrast-100 saturate-100"
                                      : "opacity-90"
                              )}
                            />

                            {/* CAD BLUEPRINT OVERLAY */}
                            {blueprintPhase === "cad" && (
                              <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between bg-cyan-950/40 p-3 backdrop-blur-xs">
                                <div
                                  className="absolute inset-0 opacity-40"
                                  style={{
                                    backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.25) 1px, transparent 1px),
                                                       linear-gradient(to bottom, rgba(6, 182, 212, 0.25) 1px, transparent 1px)`,
                                    backgroundSize: "20px 20px",
                                  }}
                                />
                                <motion.div
                                  className="absolute right-0 left-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_#22d3ee]"
                                  initial={{ top: "0%" }}
                                  animate={{ top: "100%" }}
                                  transition={{
                                    duration: 1.4,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                />
                                <div className="relative z-30 flex items-center justify-between rounded border border-cyan-500/30 bg-cyan-950/80 px-2.5 py-1 font-mono text-[10px] text-cyan-400 backdrop-blur-md">
                                  <span className="flex items-center gap-1.5 font-bold">
                                    <Cpu className="h-3.5 w-3.5 animate-spin text-cyan-300" />
                                    <span>BVH_VOXELIZE // PASS 01</span>
                                  </span>
                                  <span>RAY_WARPS: 1024</span>
                                </div>
                                <div className="relative z-30 flex items-center justify-center">
                                  <div className="flex h-16 w-16 animate-ping items-center justify-center rounded-full border border-cyan-400/40">
                                    <Crosshair className="h-6 w-6 text-cyan-400" />
                                  </div>
                                </div>
                                <div className="relative z-30 flex justify-between font-mono text-[9px] text-cyan-300/80">
                                  <span>STAGE: GEOMETRY_VOXEL_EXTRACTION</span>
                                  <span>CUDA_CORES: 16384 ACTIVE</span>
                                </div>
                              </div>
                            )}

                            {/* GPU TILES / BUCKETS */}
                            {(blueprintPhase === "noise_init" ||
                              blueprintPhase === "progressive_buckets") && (
                              <div className="pointer-events-none absolute inset-0 z-20 grid grid-cols-4 grid-rows-4 gap-0.5 p-1.5">
                                {Array.from({ length: TOTAL_TILES }).map(
                                  (_, idx) => {
                                    const stage = tileStages[idx] || 0;
                                    const isBucketActive =
                                      activeBuckets.includes(idx);

                                    return (
                                      <div
                                        key={idx}
                                        className={cn(
                                          "relative h-full w-full overflow-hidden transition-all duration-500",
                                          stage === 0
                                            ? "border border-cyan-500/20 bg-cyan-950/80 backdrop-blur-xl"
                                            : stage === 1
                                              ? "border border-cyan-500/15 bg-black/40 backdrop-blur-md"
                                              : stage === 2
                                                ? "border border-white/10 bg-transparent backdrop-blur-xs"
                                                : "border border-white/5 bg-transparent"
                                        )}
                                      >
                                        {stage === 1 && (
                                          <div
                                            className="absolute inset-0 opacity-40 mix-blend-overlay"
                                            style={{
                                              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
                                                               linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                                              backgroundSize: "6px 6px",
                                            }}
                                          />
                                        )}

                                        {isBucketActive && (
                                          <div className="absolute inset-0 z-30 flex flex-col justify-between border-2 border-emerald-400 bg-emerald-500/15 p-1 shadow-[0_0_15px_#34d399]">
                                            <div className="flex justify-between font-mono text-[7px] font-bold text-emerald-200">
                                              <span>
                                                [{(idx % 4) + 1},
                                                {Math.floor(idx / 4) + 1}]
                                              </span>
                                              <span className="animate-pulse">
                                                512 SPP
                                              </span>
                                            </div>
                                            <div className="text-right font-mono text-[6px] font-bold text-emerald-300">
                                              PASS {gpuTelemetry.pass}
                                            </div>
                                          </div>
                                        )}

                                        {stage === 3 && (
                                          <motion.div
                                            initial={{
                                              opacity: 0.5,
                                              scale: 1.05,
                                            }}
                                            animate={{ opacity: 0, scale: 1 }}
                                            transition={{ duration: 0.5 }}
                                            className="pointer-events-none absolute inset-0 bg-cyan-400/25"
                                          />
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}

                            {/* OPTIX DENOISE */}
                            {blueprintPhase === "optix_denoise" && (
                              <motion.div
                                className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                  duration: 0.8,
                                  ease: "easeInOut",
                                }}
                              />
                            )}
                          </div>
                        </div>

                        {/* BOTTOM TELEMETRY */}
                        <div className="z-30 flex h-10 shrink-0 items-center justify-between border-t border-zinc-800 bg-[#07090e] px-3.5">
                          <div className="flex items-center gap-2 truncate font-mono text-[11px] text-zinc-300">
                            <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin text-cyan-400" />
                            <span className="truncate font-bold text-cyan-100">
                              {renderStepText}
                            </span>
                          </div>

                          <div className="hidden shrink-0 items-center gap-3 font-mono text-[10px] text-zinc-400 sm:flex">
                            <span>
                              SPP:{" "}
                              <b className="text-white">{gpuTelemetry.spp}</b>
                            </span>
                            <span>
                              RAYS:{" "}
                              <b className="text-white">{gpuTelemetry.rays}</b>
                            </span>
                            <span>
                              VRAM:{" "}
                              <b className="text-zinc-300">
                                {gpuTelemetry.vram}
                              </b>
                            </span>
                            <span className="font-bold text-cyan-400">
                              {renderProgress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : hasRendered ? (
                      <img
                        src={renderImg}
                        alt="Photorealistic Render"
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-500">
                        <div className="mb-2 text-3xl">🖼️</div>
                        <p className="max-w-xs text-xs text-zinc-400">
                          Click <b className="text-white">Create Render</b> to
                          process and generate the 4K photorealistic view.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* SPLIT SLIDER VIEW */
              <div className="relative h-full max-h-[640px] w-full max-w-[960px] overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-2xl select-none">
                <img
                  src={renderImg}
                  alt="Photorealistic Render"
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain p-1.5"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                  }}
                >
                  <img
                    src={viewportImg}
                    alt="SketchUp Raw Viewport"
                    className="h-full w-full object-contain p-1.5"
                  />
                  <div className="absolute top-3 left-3 rounded-md border border-white/10 bg-black/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md">
                    SketchUp Viewport (Original)
                  </div>
                </div>

                <div className="pointer-events-none absolute top-3 right-3 rounded-md border border-white/10 bg-black/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md">
                  4K Photorealistic Render
                </div>

                <div
                  className="pointer-events-none absolute top-0 bottom-0 z-10 flex w-0.5 items-center justify-center bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-black/90 text-white shadow-xl">
                    <ChevronsLeftRight className="h-4 w-4 text-white" />
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
                />
              </div>
            )}

            {/* ACTION ROW BENEATH CARDS */}
            {hasRendered && previewMode === "image" && (
              <div className="flex items-center justify-center pt-3">
                <button
                  type="button"
                  onClick={handleTriggerVideoWalkthrough}
                  disabled={isVideoRendering}
                  className="group flex h-10.5 cursor-pointer items-center gap-2.5 rounded-full border border-indigo-500/40 bg-gradient-to-r from-indigo-950/90 via-slate-900/95 to-indigo-950/90 px-6 text-xs font-bold tracking-wide text-white shadow-[0_12px_28px_-6px_rgba(0,0,0,0.75),0_0_16px_rgba(99,102,241,0.25)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-indigo-400/70 hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.85),0_0_26px_rgba(99,102,241,0.45)] active:translate-y-0 active:scale-100 disabled:opacity-50"
                >
                  <Film className="h-4 w-4 text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.6)] transition-transform duration-200 group-hover:scale-110" />
                  <span>Generate 3D Video Walkthrough</span>
                  <span className="rounded-full border border-indigo-400/40 bg-indigo-500/20 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-indigo-200 uppercase">
                    4K 60FPS
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* BOTTOM-RIGHT: INTERACTIVE FOLDER GALLERY */}
          <div className="absolute right-4 bottom-4 z-40">
            <InteractiveFolderGallery
              photos={galleryPhotos}
              folderName="Project Renders"
              isOpen={isFolderOpen}
              onOpenChange={setIsFolderOpen}
              onSelectPhoto={(photo) => {
                setRenderImg(photo.image);
                setHasRendered(true);
                setPreviewMode("image");
              }}
            />
          </div>

          {/* FLY-INTO-FOLDER ANIMATION OVERLAY */}
          <AnimatePresence>
            {isFlyingToFolder && (
              <motion.div
                initial={{
                  position: "fixed",
                  top: "30%",
                  left: "60%",
                  width: 380,
                  height: 240,
                  x: "-50%",
                  y: "-50%",
                  scale: 1,
                  rotate: 0,
                  opacity: 1,
                  borderRadius: "16px",
                  boxShadow:
                    "0 25px 60px -10px rgba(0,0,0,0.9), 0 0 30px rgba(255,255,255,0.4)",
                  zIndex: 9999,
                }}
                animate={{
                  top: "calc(100vh - 110px)",
                  left: "calc(100vw - 160px)",
                  width: 140,
                  height: 190,
                  scale: 0.18,
                  rotate: 14,
                  opacity: [1, 0.95, 0.7, 0],
                  borderRadius: "12px",
                }}
                transition={{
                  duration: 1.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="pointer-events-none overflow-hidden border-2 border-white bg-black"
              >
                <img
                  src={flyingImage}
                  alt="Rendering Snapshot"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/30 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ========================================================= */}
      {/* AUTH & ACCOUNT SWITCH MODAL                               */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl border border-zinc-700/70 bg-[#121216] p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 cursor-pointer text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-4 text-center">
                <div className="mb-2 text-3xl">🔑</div>
                <h3 className="text-lg font-bold text-white">
                  V6 Render Account
                </h3>
                <p className="text-xs text-zinc-400">
                  Verify your email to activate PC and sync cloud renders.
                </p>
              </div>

              {authStep === 1 ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={authInputEmail}
                      onChange={(e) => setAuthInputEmail(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="h-10 w-full cursor-pointer rounded-xl bg-white text-xs font-bold text-black transition-all hover:bg-zinc-200"
                  >
                    Send 4-Digit Code
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-300">
                      4-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="••••"
                      value={authOtpCode}
                      onChange={(e) => setAuthOtpCode(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-center text-lg font-bold tracking-[12px] text-white placeholder-zinc-500 outline-none focus:border-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="h-10 w-full cursor-pointer rounded-xl bg-white text-xs font-bold text-black transition-all hover:bg-zinc-200"
                  >
                    Verify & Activate PC
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthStep(1)}
                    className="w-full cursor-pointer text-center text-xs text-zinc-400 underline hover:text-white"
                  >
                    Use different email
                  </button>
                </div>
              )}

              {authStatusText && (
                <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-900/90 p-2 text-center text-xs text-zinc-300">
                  {authStatusText}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* LIVE SUPPORT CHAT MODAL                                   */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative flex h-[560px] w-full max-w-lg flex-col rounded-2xl border border-zinc-700/70 bg-[#121216] p-5 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                className="absolute top-4 right-4 cursor-pointer text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {/* MODAL HEADER */}
              <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Live Support Chat
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Direct technical help & feature requests
                  </p>
                </div>
              </div>

              {/* 24-HOUR SLA BANNER */}
              <div className="my-2.5 rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-3 py-2 text-[11px] text-indigo-200">
                ⏱️ Support replies within <b>24 hours</b>. You will receive
                notification badges & email updates!
              </div>

              {/* CHAT MESSAGES LIST */}
              <div className="flex-1 space-y-2.5 overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {supportChatList.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex max-w-[85%] flex-col rounded-xl p-3 text-xs",
                      msg.sender === "You"
                        ? "ml-auto bg-white font-medium text-black"
                        : "border border-zinc-700 bg-zinc-800/90 text-zinc-200"
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between text-[9px] font-bold opacity-70">
                      <span>{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* CATEGORY DROPDOWN */}
              <div className="mt-2">
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 outline-none"
                >
                  <option value="General Question">
                    ❓ General Question / Help
                  </option>
                  <option value="Bug / Technical Issue">
                    🐞 Technical Bug or Issue
                  </option>
                  <option value="Payment & Access">
                    💳 Payment & Account Access
                  </option>
                  <option value="Feature Request">💡 Feature Request</option>
                </select>
              </div>

              {/* INPUT BAR */}
              <div className="mt-2 flex gap-2">
                <textarea
                  rows={2}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Type your question or issue here..."
                  className="flex-1 resize-none rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-white"
                />
                <button
                  type="button"
                  onClick={handleSendSupportMessage}
                  className="flex h-auto cursor-pointer items-center justify-center rounded-xl bg-white px-4 text-xs font-bold text-black hover:bg-zinc-200"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {supportStatusText && (
                <div className="mt-2 text-center text-xs font-semibold text-emerald-400">
                  {supportStatusText}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
