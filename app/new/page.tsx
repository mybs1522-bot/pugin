"use client";

import React, { useState, useEffect, useRef } from "react";
import { GLSLHills } from "@/components/ui/glsl-hills";
import { SwipeToRender } from "@/components/ui/swipe-to-render";
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
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InteractiveFolderGallery,
  GalleryPhoto,
} from "@/components/ui/interactive-folder-gallery";
import {
  INTERIOR_SURFACES,
  INTERIOR_PBR_CATEGORIES,
  EXTERIOR_SURFACES,
  EXTERIOR_PBR_CATEGORIES,
  type PbrCategory,
  type ArchitecturalSurfaceTarget,
} from "@/lib/pbr-materials";

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

const LIGHTINGS = [
  {
    v: "bright-natural",
    label: "Bright Daylight",
    icon: "☀️",
    d: "Crisp 6500K natural sun",
  },
  {
    v: "golden-hour",
    label: "Golden Hour",
    icon: "🌅",
    d: "Warm low-angle sunset glow",
  },
  {
    v: "warm-ambient",
    label: "Warm Ambient",
    icon: "🛋️",
    d: "Cozy 2700K interior lamps",
  },
  {
    v: "blue-dusk",
    label: "Architectural Dusk",
    icon: "🌆",
    d: "Moody twilight & soft lights",
  },
  {
    v: "dramatic-spotlit",
    label: "Dramatic Spotlight",
    icon: "🔦",
    d: "High contrast focus pools",
  },
  {
    v: "soft-diffused",
    label: "Overcast Sky",
    icon: "☁️",
    d: "Gentle even shadows",
  },
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
  // Startup / Boot Splash Screen (#pluginIntroOverlay)
  const [showSplashOverlay, setShowSplashOverlay] = useState<boolean>(true);
  const [splashProgress, setSplashProgress] = useState<number>(0);
  const [splashStep1Active, setSplashStep1Active] = useState<boolean>(false);
  const [splashStep3Done, setSplashStep3Done] = useState<boolean>(false);
  const [splashOverlayOpacity, setSplashOverlayOpacity] = useState<number>(1);
  const [splashOverlayPointerEvents, setSplashOverlayPointerEvents] =
    useState<boolean>(true);

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
  const [wallFinish, setWallFinish] = useState("beige_wall_001");
  const [floorMaterial, setFloorMaterial] = useState("american_walnut_veneer");
  const [woodTone, setWoodTone] = useState("american_walnut_veneer");
  const [metalAccent, setMetalAccent] = useState("blue_metal_plate");
  const [lightingMood, setLightingMood] = useState("bright-natural");

  // Multi-Surface Architectural Material System (Interior & Exterior)
  const [activeSurfaceId, setActiveSurfaceId] = useState<string>("wall");
  const [surfaceCategory, setSurfaceCategory] = useState<
    Record<string, string>
  >({
    // Interior defaults
    wall: "concretes",
    floor: "woods",
    cabinetry: "woods",
    countertop: "marbles",
    fabric: "fabrics",
    fixtures: "metals",
    ceiling: "concretes",
    // Exterior defaults
    facade: "facades",
    masonry: "masonry",
    roofing: "roofing",
    pavement: "pavers",
    landscape: "landscape",
    decking: "decking",
    framing: "roofing",
  });
  const [surfaceMaterials, setSurfaceMaterials] = useState<
    Record<string, string>
  >({
    // Interior defaults
    wall: "beige_wall_001",
    floor: "american_walnut_veneer",
    cabinetry: "ash_veneer",
    countertop: "calacatta_gold",
    fabric: "brown_leather",
    fixtures: "metal_plate_02",
    ceiling: "beige_wall_002",
    // Exterior defaults
    facade: "beige_wall_001",
    masonry: "aerial_rocks_02",
    roofing: "corrugated_iron",
    pavement: "brick_pavement",
    landscape: "aerial_grass_rock",
    decking: "black_painted_planks",
    framing: "blue_metal_plate",
  });
  const [accentMaterialCat, setAccentMaterialCat] = useState("woods");

  // Step 6: Atmospheric & Lighting Controls
  const [sunIntensity, setSunIntensity] = useState(80);
  const [colorTemperature, setColorTemperature] = useState(5200);
  const [sunAngle, setSunAngle] = useState(45);
  const [interiorLightsOn, setInteriorLightsOn] = useState(true);
  const [shadowSoftness, setShadowSoftness] = useState(60);

  // Step UI State
  const [currentStep, setCurrentStep] = useState(0);

  // Viewport mode: Split Slider (true) vs Side-by-Side Dual (false)
  const [isComparing, setIsComparing] = useState(false);
  const [isProcessingComparisonVideo, setIsProcessingComparisonVideo] =
    useState(false);
  const [comparisonProgress, setComparisonProgress] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(16 / 9);

  // Dynamically detect image aspect ratio to adapt viewport card frames
  useEffect(() => {
    if (viewportImg) {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          const ratio = img.naturalWidth / img.naturalHeight;
          setImageAspectRatio(Math.max(0.5, Math.min(2.2, ratio)));
        }
      };
      img.src = viewportImg;
    }
  }, [viewportImg, renderImg]);

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

  // Startup / Boot Splash Screen Intro Animation
  useEffect(() => {
    // 150ms: progress to 45%
    const t1 = setTimeout(() => {
      setSplashProgress(45);
      setSplashStep1Active(true);
    }, 150);

    // 700ms: progress to 100%, step 3 done
    const t2 = setTimeout(() => {
      setSplashProgress(100);
      setSplashStep3Done(true);
    }, 700);

    // 1400ms: smoothly fade opacity to 0 and trigger automated active viewport capture
    const t3 = setTimeout(() => {
      setSplashOverlayOpacity(0);
      setSplashOverlayPointerEvents(false);
      handleRefreshViewport();
      setTimeout(() => {
        setShowSplashOverlay(false);
      }, 600);
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleSpaceChange = (type: "interior" | "exterior") => {
    setSpaceType(type);
    if (type === "exterior") {
      setRoomType("House");
      setActiveSurfaceId("facade");
    } else {
      setRoomType("Living Room");
      setActiveSurfaceId("wall");
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

  // Animated Side-by-Side Split Slider Video Generator
  const handleProcessComparisonVideo = async () => {
    if (isProcessingComparisonVideo) return;
    setIsProcessingComparisonVideo(true);
    setComparisonProgress(0);
    setStatusMessage("🎬 Generating animated comparison video...");
    setIsComparing(true);

    try {
      const width = 1280;
      const height = 720;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas 2D context unavailable");

      // Helper to load image
      const loadImg = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => {
            const fallback = new Image();
            fallback.src = src;
            fallback.onload = () => resolve(fallback);
            fallback.onerror = () => resolve(img);
          };
          img.src = src;
        });
      };

      const [imgVp, imgRnd] = await Promise.all([
        loadImg(viewportImg),
        loadImg(renderImg),
      ]);

      // Check MediaRecorder stream support
      const stream = canvas.captureStream ? canvas.captureStream(30) : null;
      let mediaRecorder: MediaRecorder | null = null;
      const recordedChunks: Blob[] = [];

      if (stream && typeof MediaRecorder !== "undefined") {
        let mimeType = "video/webm;codecs=vp9";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm";
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/mp4";
        }
        try {
          mediaRecorder = new MediaRecorder(stream, { mimeType });
          mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              recordedChunks.push(e.data);
            }
          };
          mediaRecorder.start();
        } catch (e) {
          console.warn("MediaRecorder init fallback", e);
        }
      }

      // Slider Keyframe animation sequence (2-3 sweeps left & right)
      const keyframes = [
        { t: 0.0, pos: 50 },
        { t: 0.4, pos: 50 },
        { t: 1.2, pos: 15 },
        { t: 2.0, pos: 85 },
        { t: 2.8, pos: 22 },
        { t: 3.6, pos: 80 },
        { t: 4.3, pos: 50 },
        { t: 4.8, pos: 50 },
      ];

      const totalDuration = 4.8; // seconds
      const fps = 30;
      const totalFrames = Math.round(totalDuration * fps);

      const getSliderPosAtTime = (timeSec: number) => {
        if (timeSec <= keyframes[0].t) return keyframes[0].pos;
        if (timeSec >= keyframes[keyframes.length - 1].t)
          return keyframes[keyframes.length - 1].pos;

        for (let i = 0; i < keyframes.length - 1; i++) {
          const k1 = keyframes[i];
          const k2 = keyframes[i + 1];
          if (timeSec >= k1.t && timeSec <= k2.t) {
            const fraction = (timeSec - k1.t) / (k2.t - k1.t);
            const ease = 0.5 - 0.5 * Math.cos(Math.PI * fraction);
            return k1.pos + (k2.pos - k1.pos) * ease;
          }
        }
        return 50;
      };

      const drawFrame = (sliderPercent: number) => {
        ctx.fillStyle = "#09090b";
        ctx.fillRect(0, 0, width, height);

        const drawImageContain = (img: HTMLImageElement) => {
          const naturalW = img.naturalWidth || width;
          const naturalH = img.naturalHeight || height;
          const hRatio = width / naturalW;
          const vRatio = height / naturalH;
          const ratio = Math.min(hRatio, vRatio);
          const centerShiftX = (width - naturalW * ratio) / 2;
          const centerShiftY = (height - naturalH * ratio) / 2;
          ctx.drawImage(
            img,
            0,
            0,
            naturalW,
            naturalH,
            centerShiftX,
            centerShiftY,
            naturalW * ratio,
            naturalH * ratio
          );
        };

        // 1. Draw 4K Render image on background
        ctx.save();
        drawImageContain(imgRnd);
        ctx.restore();

        // 2. Draw Viewport image on left side clipped by slider percentage
        const splitX = Math.round((sliderPercent / 100) * width);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, height);
        ctx.clip();
        drawImageContain(imgVp);
        ctx.restore();

        // 3. Draw vertical divider line
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 10;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, height);
        ctx.stroke();

        // 4. Draw Center Circular Handle
        const centerY = height / 2;
        ctx.fillStyle = "#09090b";
        ctx.beginPath();
        ctx.arc(splitX, centerY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Arrows in handle
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("❮ ❯", splitX, centerY);

        // 5. Floating Frosted Badges
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(24, 24, 210, 32, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("SketchUp Viewport (Raw)", 36, 40);

        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.beginPath();
        ctx.roundRect(width - 244, 24, 220, 32, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#38bdf8";
        ctx.fillText("4K Photorealistic Render", width - 232, 40);

        // Bottom Watermark
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          "V6 RENDER • INTERACTIVE COMPARISON",
          width / 2,
          height - 20
        );

        ctx.restore();
      };

      // Frame-by-frame rendering loop with timer
      for (let f = 0; f < totalFrames; f++) {
        const timeSec = f / fps;
        const currentPos = getSliderPosAtTime(timeSec);
        setSliderPosition(Math.round(currentPos));
        setComparisonProgress(Math.round((f / totalFrames) * 100));
        drawFrame(currentPos);
        await new Promise((r) => setTimeout(r, 33));
      }

      // Finish recording
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        await new Promise<void>((resolve) => {
          if (!mediaRecorder) return resolve();
          mediaRecorder.onstop = () => resolve();
          mediaRecorder.stop();
        });

        if (recordedChunks.length > 0) {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const videoUrl = URL.createObjectURL(blob);
          setRenderVideo(videoUrl);
          setHasRendered(true);
          setHasRenderedVideo(true);
          setGalleryPhotos((prev) => [
            {
              id: Date.now(),
              image: renderImg,
              title: "Split Comparison Clip",
            },
            ...prev,
          ]);
          setIsComparing(false);
          setPreviewMode("video");
          setStatusMessage(
            "✓ Comparison video created! Click Download Video (MP4) below."
          );
        }
      } else {
        setHasRendered(true);
        setHasRenderedVideo(true);
        setIsComparing(false);
        setPreviewMode("video");
        setStatusMessage(
          "✓ Comparison video ready! Click Download Video (MP4) below."
        );
      }
    } catch (err) {
      console.error("Error processing comparison video:", err);
      setStatusMessage("Comparison video processing complete.");
    } finally {
      setIsProcessingComparisonVideo(false);
      setComparisonProgress(100);
      setSliderPosition(50);
    }
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
      {/* STARTUP / BOOT SPLASH SCREEN OVERLAY (#pluginIntroOverlay) */}
      {showSplashOverlay && (
        <div
          id="pluginIntroOverlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "#09090b",
            zIndex: 999999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: splashOverlayOpacity,
            pointerEvents: splashOverlayPointerEvents ? "auto" : "none",
            transition: "opacity 0.6s ease, visibility 0.6s ease",
            visibility: splashOverlayOpacity === 0 ? "hidden" : "visible",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "300px",
              textAlign: "center",
            }}
          >
            {/* Logo Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <img
                src="/v6-logo.png"
                alt="V6 Render"
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 16px rgba(99,102,241,0.55))",
                }}
              />
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#ffffff",
                    letterSpacing: "-0.5px",
                  }}
                >
                  V6 Render
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#a1a1aa",
                    fontWeight: 500,
                  }}
                >
                  Photorealistic AI Architecture
                </div>
              </div>
            </div>

            {/* Live Status Indicator Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: "999px",
                padding: "4px 12px",
                marginBottom: "20px",
                fontSize: "11px",
                color: "#4ade80",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 8px #22c55e",
                }}
              />
              <span>V6 Engine Initialized</span>
            </div>

            {/* Step List / Checkpoints */}
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {/* Step 1: Initializing V6 Engine */}
              <div
                id="splashStep1"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.03)",
                  border: splashStep1Active
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px solid rgba(255,255,255,0.06)",
                  fontSize: "12px",
                  color: splashStep1Active ? "#a1a1aa" : "#71717a",
                  transition: "all 0.3s",
                }}
              >
                <span style={{ fontSize: "12px" }}>⚙️</span>
                <span>Initializing V6 Engine</span>
              </div>

              {/* Step 2: SketchUp Ruby Bridge Connected (Active Highlighted Item) */}
              <div
                id="splashStep2"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontSize: "12px",
                  color: "#ffffff",
                  fontWeight: 600,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                  transition: "all 0.3s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    className="inline-block animate-spin"
                    style={{ fontSize: "13px" }}
                  >
                    ⚙️
                  </span>
                  <span>SketchUp Ruby Bridge Connected</span>
                </div>
                {/* Glowing Green Dynamic Progress Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "4px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    id="splashProgressBar"
                    style={{
                      width: `${splashProgress}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #22c55e, #10b981)",
                      borderRadius: "999px",
                      transition: "width 0.4s ease, background 0.4s ease",
                      boxShadow: "0 0 10px rgba(34,197,94,0.6)",
                    }}
                  />
                </div>
              </div>

              {/* Step 3: Loading Assets & Viewport */}
              <div
                id="splashStep3"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: splashStep3Done
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(255,255,255,0.03)",
                  border: splashStep3Done
                    ? "1px solid rgba(34,197,94,0.2)"
                    : "1px solid rgba(255,255,255,0.06)",
                  fontSize: "12px",
                  color: splashStep3Done ? "#22c55e" : "#71717a",
                  fontWeight: splashStep3Done ? 600 : 400,
                  transition: "all 0.3s",
                }}
              >
                <span id="splashCheckIcon" style={{ fontSize: "12px" }}>
                  ✔️
                </span>
                <span id="splashStep3Text">Loading Assets & Viewport</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      "flex cursor-pointer items-center gap-3.5 rounded-xl border p-3 transition-all",
                      spaceType === "interior"
                        ? "border-indigo-500 bg-indigo-500/15 text-white shadow-lg ring-1 shadow-indigo-500/10 ring-indigo-500/50"
                        : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                    )}
                  >
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-indigo-400/40 shadow-md">
                      <img
                        src="/images/space-interior.jpg"
                        alt="Interior"
                        className="h-full w-full object-cover"
                      />
                    </div>
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
                      "flex cursor-pointer items-center gap-3.5 rounded-xl border p-3 transition-all",
                      spaceType === "exterior"
                        ? "border-emerald-500 bg-emerald-500/15 text-white shadow-lg ring-1 shadow-emerald-500/10 ring-emerald-500/50"
                        : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                    )}
                  >
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-emerald-400/40 shadow-md">
                      <img
                        src="/images/space-exterior.jpg"
                        alt="Exterior"
                        className="h-full w-full object-cover"
                      />
                    </div>
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
              </div>
            )}

            {/* STEP 4: Comprehensive Multi-Surface Architectural Materials (Interior & Exterior) */}
            {currentStep === 4 && (
              <div className="space-y-3.5">
                {/* INTERACTIVE TARGET SURFACE SLIDER & SELECTOR */}
                {(() => {
                  const activeSurfaces =
                    spaceType === "exterior"
                      ? EXTERIOR_SURFACES
                      : INTERIOR_SURFACES;
                  const activeCategories =
                    spaceType === "exterior"
                      ? EXTERIOR_PBR_CATEGORIES
                      : INTERIOR_PBR_CATEGORIES;

                  const activeSurfaceIndex = Math.max(
                    0,
                    activeSurfaces.findIndex((s) => s.id === activeSurfaceId)
                  );
                  const activeSurface =
                    activeSurfaces[activeSurfaceIndex] || activeSurfaces[0];
                  const assignedMatId = surfaceMaterials[activeSurface.id];
                  let activeMatThumb = "";
                  let activeMatName = "Default";
                  for (const cat of activeCategories) {
                    const found = cat.textures.find(
                      (t) => t.id === assignedMatId
                    );
                    if (found) {
                      activeMatThumb = found.thumb;
                      activeMatName = found.name;
                      break;
                    }
                  }

                  return (
                    <div className="space-y-2.5 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 shadow-inner">
                      {/* Slider Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black tracking-wider text-zinc-300 uppercase">
                            {spaceType === "exterior"
                              ? "Exterior Surface"
                              : "Interior Surface"}
                          </span>
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                            {activeSurfaceIndex + 1} of {activeSurfaces.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const newIndex =
                                (activeSurfaceIndex -
                                  1 +
                                  activeSurfaces.length) %
                                activeSurfaces.length;
                              setActiveSurfaceId(activeSurfaces[newIndex].id);
                            }}
                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white"
                            title="Previous surface"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newIndex =
                                (activeSurfaceIndex + 1) %
                                activeSurfaces.length;
                              setActiveSurfaceId(activeSurfaces[newIndex].id);
                            }}
                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white"
                            title="Next surface"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Interactive Scrubber Slider Track */}
                      <div className="space-y-1">
                        <input
                          type="range"
                          min={0}
                          max={activeSurfaces.length - 1}
                          step={1}
                          value={activeSurfaceIndex}
                          onChange={(e) => {
                            const idx = Number(e.target.value);
                            setActiveSurfaceId(activeSurfaces[idx].id);
                          }}
                          className="accent-primary h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800"
                        />
                        <div className="flex justify-between px-0.5 font-mono text-[9px] text-zinc-500">
                          {activeSurfaces.map((s) => (
                            <span
                              key={s.id}
                              className={cn(
                                s.id === activeSurface.id
                                  ? "text-primary font-bold"
                                  : ""
                              )}
                            >
                              {s.label.split(" ")[0]}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Active Surface Card */}
                      <div className="flex items-center justify-between rounded-lg border border-zinc-800/90 bg-zinc-900/90 p-2.5 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{activeSurface.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-white">
                              {activeSurface.label}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              Selected:{" "}
                              <span className="font-semibold text-zinc-200">
                                {activeMatName}
                              </span>
                            </div>
                          </div>
                        </div>

                        {activeMatThumb && (
                          <div className="border-primary/50 ring-primary/20 relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border shadow ring-2">
                            <img
                              src={activeMatThumb}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Category Filter Chips for active surface */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(() => {
                    const activeSurfaces =
                      spaceType === "exterior"
                        ? EXTERIOR_SURFACES
                        : INTERIOR_SURFACES;
                    const activeCategories =
                      spaceType === "exterior"
                        ? EXTERIOR_PBR_CATEGORIES
                        : INTERIOR_PBR_CATEGORIES;

                    return activeCategories.map((cat) => {
                      const currentCatId =
                        surfaceCategory[activeSurfaceId] ||
                        activeSurfaces.find((s) => s.id === activeSurfaceId)
                          ?.defaultCategory ||
                        activeCategories[0].id;
                      const isCatActive = currentCatId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSurfaceCategory((prev) => ({
                              ...prev,
                              [activeSurfaceId]: cat.id,
                            }));
                          }}
                          className={cn(
                            "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium transition-all",
                            isCatActive
                              ? "border-primary bg-primary/20 ring-primary font-semibold text-white ring-1"
                              : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                          )}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                          <span className="font-mono text-[9px] text-zinc-500">
                            ({cat.textures.length})
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Pure PBR Texture Thumbnail Grid (High-density visual swatches) */}
                {(() => {
                  const activeSurfaces =
                    spaceType === "exterior"
                      ? EXTERIOR_SURFACES
                      : INTERIOR_SURFACES;
                  const activeCategories =
                    spaceType === "exterior"
                      ? EXTERIOR_PBR_CATEGORIES
                      : INTERIOR_PBR_CATEGORIES;

                  const currentCatId =
                    surfaceCategory[activeSurfaceId] ||
                    activeSurfaces.find((s) => s.id === activeSurfaceId)
                      ?.defaultCategory ||
                    activeCategories[0].id;
                  const currentCategory =
                    activeCategories.find((c) => c.id === currentCatId) ||
                    activeCategories[0];
                  const selectedMatId = surfaceMaterials[activeSurfaceId];

                  return (
                    <div className="grid max-h-[280px] grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
                      {currentCategory.textures.map((t) => {
                        const isSelected = selectedMatId === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            title={t.name}
                            onClick={() => {
                              setSurfaceMaterials((prev) => ({
                                ...prev,
                                [activeSurfaceId]: t.id,
                              }));
                              // Sync legacy fields
                              if (
                                activeSurfaceId === "wall" ||
                                activeSurfaceId === "facade"
                              )
                                setWallFinish(t.id);
                              if (
                                activeSurfaceId === "floor" ||
                                activeSurfaceId === "pavement"
                              )
                                setFloorMaterial(t.id);
                              if (
                                activeSurfaceId === "cabinetry" ||
                                activeSurfaceId === "decking"
                              )
                                setWoodTone(t.id);
                              if (
                                activeSurfaceId === "fixtures" ||
                                activeSurfaceId === "framing"
                              )
                                setMetalAccent(t.id);
                            }}
                            className={cn(
                              "group relative aspect-square w-full overflow-hidden rounded-xl border transition-all duration-150 focus:outline-none",
                              isSelected
                                ? "border-primary ring-primary shadow-primary/30 scale-95 shadow-md ring-2 ring-offset-2 ring-offset-zinc-950"
                                : "border-zinc-800 bg-zinc-900/60 hover:scale-105 hover:border-zinc-600"
                            )}
                          >
                            <img
                              src={t.thumb}
                              alt={t.name}
                              className="h-full w-full object-cover object-center"
                              loading="lazy"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/20" />
                            {isSelected && (
                              <div className="bg-primary absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black text-white shadow">
                                ✓
                              </div>
                            )}
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="block truncate text-center text-[9px] font-semibold text-white">
                                {t.name}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* STEP 5: Atmospheric & Lighting Controls Studio */}
            {currentStep === 5 && (
              <div className="space-y-4">
                {/* Lighting Presets */}
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                      Atmospheric Lighting Mood
                    </span>
                    <span className="text-[10px] font-medium text-zinc-500">
                      Physically-Based Solar Engine
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {LIGHTINGS.map((l) => {
                      const isSelected = lightingMood === l.v;
                      return (
                        <div
                          key={l.v}
                          onClick={() => setLightingMood(l.v)}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 transition-all",
                            isSelected
                              ? "border-primary bg-primary/10 ring-primary text-white shadow-sm ring-1"
                              : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/40"
                          )}
                        >
                          <span className="shrink-0 text-xl">{l.icon}</span>
                          <div className="min-w-0 flex-1 truncate">
                            <div className="truncate text-xs font-bold text-white">
                              {l.label}
                            </div>
                            <div className="truncate text-[10px] text-zinc-400">
                              {l.d}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Fine-Grained Lighting Sliders */}
                <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold tracking-wider text-zinc-300 uppercase">
                      Photometric Parameters
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">
                      GPU Real-Time
                    </span>
                  </div>

                  {/* Sun Intensity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-zinc-400">
                        Sunlight Intensity
                      </span>
                      <span className="font-mono font-bold text-zinc-200">
                        {sunIntensity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={150}
                      value={sunIntensity}
                      onChange={(e) => setSunIntensity(Number(e.target.value))}
                      className="accent-primary h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800"
                    />
                  </div>

                  {/* Color Temperature */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-zinc-400">
                        Color Temperature
                      </span>
                      <span className="font-mono font-bold text-zinc-200">
                        {colorTemperature}K
                      </span>
                    </div>
                    <input
                      type="range"
                      min={2700}
                      max={7500}
                      step={100}
                      value={colorTemperature}
                      onChange={(e) =>
                        setColorTemperature(Number(e.target.value))
                      }
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-amber-500"
                    />
                    <div className="flex justify-between font-mono text-[9px] text-zinc-500">
                      <span>2700K (Warm)</span>
                      <span>5000K (Neutral)</span>
                      <span>7500K (Sky)</span>
                    </div>
                  </div>

                  {/* Sun Elevation Angle */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-zinc-400">
                        Sun Altitude Angle
                      </span>
                      <span className="font-mono font-bold text-zinc-200">
                        {sunAngle}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={sunAngle}
                      onChange={(e) => setSunAngle(Number(e.target.value))}
                      className="accent-primary h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800"
                    />
                  </div>

                  {/* Interior Fixtures Toggle */}
                  <div className="flex items-center justify-between border-t border-zinc-800/80 pt-1">
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">
                        Interior Emissive Lights
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Recessed downlights & pendant lamps
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInteriorLightsOn(!interiorLightsOn)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        interiorLightsOn ? "bg-primary" : "bg-zinc-800"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                          interiorLightsOn ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM FIXED BAR: CREATE RENDER & REFRESH VIEWPORT */}
          <div className="shrink-0 space-y-2 border-t border-zinc-800 bg-[#0b0b0f] p-3.5">
            {/* SWIPE TO CREATE RENDER BUTTON */}
            <SwipeToRender
              onSwipeComplete={handleTriggerRender}
              isRendering={isRendering}
              renderProgress={renderProgress}
              disabled={isRendering || isVideoRendering}
            />

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
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
            <GLSLHills
              width="100%"
              height="100%"
              cameraZ={125}
              planeSize={256}
              speed={0.15}
            />
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
              {(hasRendered || hasRenderedVideo) && (
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
                        setIsComparing(false);
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

              {(hasRendered || hasRenderedVideo) && (
                <a
                  href={previewMode === "video" ? renderVideo : renderImg}
                  download={
                    previewMode === "video"
                      ? "v6_slider_video.mp4"
                      : "v6_render_4k.jpg"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-900/60 hover:text-white"
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
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-hidden p-3 sm:p-4 md:p-5">
            {!isComparing ? (
              <div className="flex max-h-[70vh] w-full items-center justify-center gap-3 transition-all duration-300 sm:gap-4">
                {/* LEFT CARD: 1. SKETCHUP VIEWPORT */}
                <div
                  className="relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/70 shadow-2xl backdrop-blur-xl transition-all duration-300"
                  style={{
                    aspectRatio: `${imageAspectRatio}`,
                    height: "min(490px, 66vh)",
                    maxHeight: "66vh",
                    maxWidth: "min(490px, calc(50vw - 20px))",
                  }}
                >
                  <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-3.5">
                    <span className="text-xs font-bold text-zinc-300">
                      1. SketchUp Viewport
                    </span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400">
                      Original
                    </span>
                  </div>
                  <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/40 p-1.5">
                    <img
                      src={viewportImg}
                      alt="SketchUp Viewport Capture"
                      className="h-full w-full rounded-lg object-contain transition-all"
                    />
                  </div>
                </div>

                {/* RIGHT CARD: 2. RENDER OUTPUT & GPU PROGRESSIVE BLUEPRINT CANVAS */}
                <div
                  className="relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/70 shadow-2xl backdrop-blur-xl transition-all duration-300"
                  style={{
                    aspectRatio: `${imageAspectRatio}`,
                    height: "min(490px, 66vh)",
                    maxHeight: "66vh",
                    maxWidth: "min(490px, calc(50vw - 20px))",
                  }}
                >
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
                        className="h-full w-full rounded-lg object-contain transition-all"
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
              <div
                className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/70 shadow-2xl backdrop-blur-xl transition-all duration-300 select-none"
                style={{
                  aspectRatio: `${imageAspectRatio}`,
                  height: "min(510px, 68vh)",
                  maxHeight: "68vh",
                  maxWidth: "min(940px, 90vw)",
                }}
              >
                <img
                  src={renderImg}
                  alt="Photorealistic Render"
                  className="pointer-events-none absolute inset-0 h-full w-full rounded-lg object-contain p-1.5"
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
                    className="h-full w-full rounded-lg object-contain p-1.5"
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
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              {/* SMALL BLACK BUTTON: PROCESS COMPARISON VIDEO */}
              <button
                type="button"
                onClick={handleProcessComparisonVideo}
                disabled={isProcessingComparisonVideo}
                className={cn(
                  "flex h-8.5 cursor-pointer items-center gap-2 rounded-lg border border-zinc-800 bg-[#09090b] px-4 text-xs font-semibold text-zinc-300 shadow-xl transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white active:scale-95 disabled:opacity-60",
                  isProcessingComparisonVideo &&
                    "border-cyan-500/50 bg-cyan-950/20 text-cyan-300 ring-1 ring-cyan-500/30"
                )}
                title="Create animated comparison video with smooth slider sweeps"
              >
                {isProcessingComparisonVideo ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                    <span>Processing ({comparisonProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Process</span>
                  </>
                )}
              </button>

              {/* DIRECT DOWNLOAD COMPARISON / WALKTHROUGH VIDEO BUTTON */}
              {hasRenderedVideo && (
                <a
                  href={renderVideo}
                  download="v6_comparison_video.mp4"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8.5 cursor-pointer items-center gap-2 rounded-lg border border-emerald-500/50 bg-gradient-to-r from-emerald-950/80 to-zinc-950 px-4 text-xs font-bold text-emerald-300 shadow-xl transition-all duration-150 hover:border-emerald-400 hover:bg-emerald-900/60 hover:text-white active:scale-95"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Download Video (MP4)</span>
                </a>
              )}

              {/* PLAY VIDEO BUTTON IF IN IMAGE MODE */}
              {hasRenderedVideo && previewMode === "image" && (
                <button
                  type="button"
                  onClick={() => {
                    setIsComparing(false);
                    setPreviewMode("video");
                  }}
                  className="flex h-8.5 cursor-pointer items-center gap-2 rounded-lg border border-cyan-500/40 bg-zinc-950 px-3.5 text-xs font-bold text-cyan-300 shadow-xl transition-all duration-150 hover:border-cyan-400 hover:bg-zinc-900 hover:text-white active:scale-95"
                >
                  <Film className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Play Video</span>
                </button>
              )}

              {hasRendered && previewMode === "image" && (
                <button
                  type="button"
                  onClick={handleTriggerVideoWalkthrough}
                  disabled={isVideoRendering}
                  className="group flex h-8.5 cursor-pointer items-center gap-2 rounded-lg border border-indigo-500/40 bg-zinc-950 px-4 text-xs font-bold text-white shadow-xl transition-all duration-200 hover:border-indigo-400/70 hover:bg-zinc-900 hover:shadow-[0_0_16px_rgba(99,102,241,0.3)] active:scale-95 disabled:opacity-50"
                >
                  <Film className="h-3.5 w-3.5 text-indigo-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>3D Walkthrough Video</span>
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-indigo-300 uppercase">
                    4K
                  </span>
                </button>
              )}
            </div>
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
