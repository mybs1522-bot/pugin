import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Monitor,
  Camera,
  ClipboardPaste,
  Upload,
  Download,
  Copy,
  Sparkles,
  Zap,
  Sliders,
  Box,
  Layers,
  Sun,
  Image as ImageIcon,
  Check,
  RefreshCw,
  HelpCircle,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Trash2,
} from 'lucide-react';
import { CadSelectorModal } from './components/CadSelectorModal';
import { SplitCompare } from './components/SplitCompare';
import { AuthModal } from './components/AuthModal';
import { CadWindowSource, StyleOption, LightingOption, MaterialOption } from './types';

const API_BASE_URL = 'https://pugin-five.vercel.app';

const STYLES_INTERIOR: StyleOption[] = [
  { id: 'modern', name: 'Warm Minimalist', emoji: '🛋️', promptMod: 'warm minimalist interior, clean lines, designer furniture, natural ambient lighting, 8k, architectural digest photography' },
  { id: 'luxury', name: 'Luxury Penthouse', emoji: '✨', promptMod: 'high-end luxury penthouse interior, calacatta marble, brushed brass accents, floor to ceiling glazing, award-winning archviz' },
  { id: 'scandi', name: 'Scandinavian Wood', emoji: '🪵', promptMod: 'scandinavian interior, light white oak timber slats, cozy organic textures, muted earth tones, soft diffused illumination' },
  { id: 'industrial', name: 'Industrial Loft', emoji: '🧱', promptMod: 'industrial loft interior, exposed polished concrete, matte black steel frames, warm filament lighting' },
  { id: 'japandi', name: 'Japandi Calm', emoji: '🍵', promptMod: 'japandi aesthetic, wabi-sabi simplicity, paper lamps, tactile linen, tranquil neutral palette' },
];

const STYLES_EXTERIOR: StyleOption[] = [
  { id: 'villa', name: 'Contemporary Villa', emoji: '🏡', promptMod: 'contemporary architectural villa, board-formed concrete and timber cladding, infinity pool, lush landscaping, 8k uhd' },
  { id: 'facade', name: 'Commercial Facade', emoji: '🏢', promptMod: 'modern commercial facade, curtain wall glass, kinetic louvers, dramatic urban architecture photography' },
  { id: 'brutalist', name: 'Warm Brutalism', emoji: '🏛️', promptMod: 'refined brutalist residence, fluted architectural concrete, monolithic geometric forms, desert xeriscape' },
  { id: 'timber', name: 'Forest House', emoji: '🌲', promptMod: 'cantilevered modern forest residence, charred cedar siding, moody forest surroundings, ambient natural reflections' },
];

const LIGHTING_PRESETS: LightingOption[] = [
  { id: 'golden', name: 'Golden Hour', emoji: '🌅', promptMod: 'bathed in warm low-angle golden hour sunlight, soft long shadows, warm atmospheric haze' },
  { id: 'daylight', name: 'Bright Daylight', emoji: '☀️', promptMod: 'crisp clear mid-day architectural illumination, sharp clean shadows, pure natural light balance' },
  { id: 'overcast', name: 'Soft Overcast', emoji: '☁️', promptMod: 'diffused soft studio overcast skylight, zero harsh glare, even architectural shadow distribution' },
  { id: 'dusk', name: 'Blue Hour Dusk', emoji: '🌆', promptMod: 'dramatic blue hour dusk sky, warm interior spotlights glowing from within, cinematic contrast' },
  { id: 'night', name: 'Moody Night', emoji: '🌙', promptMod: 'architectural night scene, curated exterior landscape lighting, warm glowing interiors' },
];

const MATERIAL_PRESETS: MaterialOption[] = [
  { id: 'concrete', name: 'Fair-Faced Concrete', promptMod: 'smooth architectural poured concrete, subtle aggregate texture' },
  { id: 'timber', name: 'White Oak Slat Timber', promptMod: 'vertical light white oak timber battens with matte oil finish' },
  { id: 'marble', name: 'Calacatta Gold Marble', promptMod: 'bookmatched calacatta gold marble with soft grey and gold veining' },
  { id: 'glass', name: 'Ultra-Clear Glazing', promptMod: 'low-iron structural architectural glass with realistic subtle reflections' },
];

export default function App() {
  const [viewportImage, setViewportImage] = useState<string | null>(null);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  // Settings
  const [category, setCategory] = useState<'interior' | 'exterior'>('interior');
  const [selectedStyle, setSelectedStyle] = useState<string>('modern');
  const [selectedLighting, setSelectedLighting] = useState<string>('golden');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('concrete');
  const [promptExtra, setPromptExtra] = useState('');
  const [geometryLock, setGeometryLock] = useState(75);

  // CAD Sources & Modals
  const [cadSources, setCadSources] = useState<CadWindowSource[]>([]);
  const [cadModalOpen, setCadModalOpen] = useState(false);
  const [cadLoading, setCadLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('v6_user_email') || null;
  });

  const [copiedNotification, setCopiedNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load CAD windows
  const refreshCadWindows = useCallback(async () => {
    if (window.v6Desktop) {
      setCadLoading(true);
      try {
        const list = await window.v6Desktop.getCadWindows();
        setCadSources(list);
      } catch (e) {
        console.error('Failed to get CAD windows', e);
      } finally {
        setCadLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refreshCadWindows();

    // Register capture trigger listener from main process
    if (window.v6Desktop?.onTriggerCapture) {
      const cleanup = window.v6Desktop.onTriggerCapture(() => {
        handleQuickSnip();
      });
      return cleanup;
    }
  }, [refreshCadWindows]);

  // Global Clipboard paste listener (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setViewportImage(event.target.result as string);
                setRenderedImage(null);
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Quick Snip: Captures active display
  const handleQuickSnip = async () => {
    if (window.v6Desktop) {
      try {
        const dataUrl = await window.v6Desktop.captureScreen();
        setViewportImage(dataUrl);
        setRenderedImage(null);
      } catch (e) {
        console.error('Screen snip failed', e);
      }
    }
  };

  // Capture selected CAD window
  const handleSelectCadSource = async (source: CadWindowSource) => {
    setCadModalOpen(false);
    if (window.v6Desktop) {
      try {
        const dataUrl = await window.v6Desktop.captureWindow(source.id);
        setViewportImage(dataUrl);
        setRenderedImage(null);
      } catch (e) {
        console.error('Failed to capture CAD window', e);
      }
    }
  };

  // Handle local image file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setViewportImage(ev.target.result as string);
          setRenderedImage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform AI Render via Replicate API
  const handleGenerateRender = async () => {
    if (!viewportImage) return;

    setIsRendering(true);
    setRenderProgress(10);

    const styleList = category === 'interior' ? STYLES_INTERIOR : STYLES_EXTERIOR;
    const styleObj = styleList.find((s) => s.id === selectedStyle) || styleList[0];
    const lightingObj = LIGHTING_PRESETS.find((l) => l.id === selectedLighting) || LIGHTING_PRESETS[0];
    const materialObj = MATERIAL_PRESETS.find((m) => m.id === selectedMaterial) || MATERIAL_PRESETS[0];

    const fullPrompt = [
      styleObj.promptMod,
      lightingObj.promptMod,
      materialObj.promptMod,
      promptExtra.trim(),
      'photorealistic architectural render, 8k resolution, raytraced reflections, sharp details',
    ].filter(Boolean).join(', ');

    // Simulated progress tick while backend renders
    const progressInterval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 15;
      });
    }, 1500);

    try {
      const res = await fetch(`${API_BASE_URL}/api/replicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: viewportImage,
          prompt: fullPrompt,
          structure: geometryLock / 100,
          category,
          style: styleObj.name,
        }),
      });

      const data = await res.json();
      clearInterval(progressInterval);
      setRenderProgress(100);

      if (data.output) {
        setRenderedImage(data.output);
      } else if (data.imageUrl) {
        setRenderedImage(data.imageUrl);
      } else {
        throw new Error(data.error || 'Rendering completed without output.');
      }
    } catch (err: any) {
      console.error('Render error:', err);
      // Fallback: If network fails or Replicate token is rate-limited, provide polished fallback
      alert(`Render notice: ${err.message || 'Connecting to cloud cluster...'}`);
    } finally {
      clearInterval(progressInterval);
      setIsRendering(false);
    }
  };

  // Copy Render to Clipboard
  const handleCopyRender = async () => {
    if (!renderedImage) return;
    if (window.v6Desktop) {
      await window.v6Desktop.copyImageToClipboard(renderedImage);
    } else {
      try {
        const res = await fetch(renderedImage);
        const blob = await res.blob();
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      } catch {}
    }
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Save Rendered Image
  const handleSaveRender = async () => {
    if (!renderedImage) return;
    if (window.v6Desktop) {
      await window.v6Desktop.saveImageFile({
        dataUrl: renderedImage,
        defaultName: `v6-render-${selectedStyle}-${Date.now()}.jpg`,
      });
    } else {
      const a = document.createElement('a');
      a.href = renderedImage;
      a.download = `v6-render-${Date.now()}.jpg`;
      a.click();
    }
  };

  const activeStyles = category === 'interior' ? STYLES_INTERIOR : STYLES_EXTERIOR;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* ── Top Frameless Titlebar ────────────────────────────────────────── */}
      <header className="titlebar-drag flex h-10 w-full shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950 px-3">
        <div className="titlebar-no-drag flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs font-black text-zinc-950 shadow-sm">
            V6
          </div>
          <span className="text-xs font-extrabold tracking-tight text-white">
            V6 Render <span className="font-normal text-zinc-500">Universal Studio</span>
          </span>

          <span className="ml-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ready for 3ds Max, Revit, Rhino, Blender</span>
          </span>
        </div>

        <div className="titlebar-no-drag flex items-center gap-3 pr-28">
          {userEmail ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300">
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="truncate max-w-[140px]">{userEmail}</span>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-white hover:bg-zinc-700"
            >
              <KeyRound className="h-3 w-3" />
              <span>Sign In / Trial</span>
            </button>
          )}

          <button
            onClick={() => {
              if (window.v6Desktop) {
                window.v6Desktop.openExternalUrl('https://pugin-five.vercel.app/download');
              } else {
                window.open('/download', '_blank');
              }
            }}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
          >
            <span>Pricing</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </header>

      {/* ── Viewport Capture Action Strip ─────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 p-2.5 px-4">
        <div className="flex items-center gap-2">
          {/* 1-Click CAD Auto-Detect */}
          <button
            onClick={() => {
              refreshCadWindows();
              setCadModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 shadow-sm transition-all"
          >
            <Box className="h-4 w-4" />
            <span>Select CAD Viewport ({cadSources.filter((s) => s.isCadApp).length} Detected)</span>
          </button>

          {/* Quick Snip */}
          <button
            onClick={handleQuickSnip}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all"
            title="Hotkey: Ctrl + Shift + R"
          >
            <Camera className="h-4 w-4 text-zinc-400" />
            <span>Snip Screen</span>
            <kbd className="rounded bg-zinc-900 px-1.5 py-0.5 text-[9px] text-zinc-400">Ctrl+Shift+R</kbd>
          </button>

          {/* Paste from Clipboard */}
          <button
            onClick={async () => {
              try {
                const clipItems = await navigator.clipboard.read();
                for (const item of clipItems) {
                  const imageType = item.types.find((t) => t.startsWith('image/'));
                  if (imageType) {
                    const blob = await item.getType(imageType);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      if (e.target?.result) {
                        setViewportImage(e.target.result as string);
                        setRenderedImage(null);
                      }
                    };
                    reader.readAsDataURL(blob);
                    return;
                  }
                }
                alert('No image found in clipboard. Use Win+Shift+S to copy a CAD viewport first.');
              } catch {
                alert('Press Ctrl+V to paste your clipboard screenshot.');
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all"
          >
            <ClipboardPaste className="h-4 w-4 text-zinc-400" />
            <span>Paste (Ctrl+V)</span>
          </button>

          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
          >
            <Upload className="h-4 w-4" />
            <span>Browse Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {viewportImage && (
          <button
            onClick={() => {
              setViewportImage(null);
              setRenderedImage(null);
            }}
            className="flex items-center gap-1 rounded-lg p-1.5 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
            title="Clear Viewport"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* ── Main Studio Split Screen ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Viewport Preview / Interactive Split Slider */}
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-zinc-950 p-4">
          {!viewportImage ? (
            /* Empty State: CAD instructions */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    if (ev.target?.result) {
                      setViewportImage(ev.target.result as string);
                      setRenderedImage(null);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="flex h-full w-full max-w-2xl flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 p-8 text-center transition-all hover:border-zinc-700"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-400 shadow-xl mb-4">
                <Box className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">No 3D Viewport Captured Yet</h3>
              <p className="mt-1.5 max-w-md text-xs leading-relaxed text-zinc-400">
                Works universally with <strong>Autodesk 3ds Max, Revit, Rhino, Blender, SketchUp, and AutoCAD</strong>.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                <button
                  onClick={() => {
                    refreshCadWindows();
                    setCadModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-zinc-950 hover:bg-zinc-200 shadow-lg cursor-pointer"
                >
                  <Box className="h-4 w-4 text-zinc-950" />
                  <span>Select Open CAD Viewport</span>
                </button>
                <button
                  onClick={handleQuickSnip}
                  className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 cursor-pointer"
                >
                  <Camera className="h-4 w-4 text-zinc-400" />
                  <span>Snip Active View (Ctrl+Shift+R)</span>
                </button>
              </div>

              <p className="mt-6 text-[11px] text-zinc-500">
                Tip: Press <kbd className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-300">Win + Shift + S</kbd> in your CAD tool, then press <kbd className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-300">Ctrl + V</kbd> here!
              </p>
            </div>
          ) : renderedImage ? (
            /* Render Complete: Interactive Before/After */
            <div className="relative h-full w-full">
              <SplitCompare
                originalUrl={viewportImage}
                renderedUrl={renderedImage}
              />
            </div>
          ) : (
            /* Viewport Loaded (Waiting for render) */
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-zinc-900">
              <img
                src={viewportImage}
                alt="Captured CAD Viewport"
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute top-3 left-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold text-zinc-300 backdrop-blur-md">
                ✓ CAD Viewport Loaded · Select Settings &amp; Render Below
              </div>
            </div>
          )}

          {/* Bottom Floating Bar on Result */}
          {renderedImage && (
            <div className="absolute bottom-6 z-30 flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/90 p-2 shadow-2xl backdrop-blur-md">
              <button
                onClick={handleSaveRender}
                className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save 4K Render</span>
              </button>
              <button
                onClick={handleCopyRender}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-700"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copiedNotification ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: V6 Rendering Controls */}
        <div className="flex w-96 shrink-0 flex-col border-l border-zinc-800/80 bg-zinc-900/40 p-4 overflow-y-auto space-y-5">
          {/* Category Toggle */}
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-1">
            <button
              onClick={() => {
                setCategory('interior');
                setSelectedStyle('modern');
              }}
              className={`rounded-lg py-2 text-xs font-bold transition-all ${
                category === 'interior' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              🛋️ Interior
            </button>
            <button
              onClick={() => {
                setCategory('exterior');
                setSelectedStyle('villa');
              }}
              className={`rounded-lg py-2 text-xs font-bold transition-all ${
                category === 'exterior' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              🏢 Exterior
            </button>
          </div>

          {/* Architectural Style */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Architectural Style</span>
              <span className="text-[10px] text-zinc-500">Preset Target</span>
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {activeStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`flex items-center justify-between rounded-xl border p-2.5 px-3 text-left transition-all ${
                    selectedStyle === style.id
                      ? 'border-white bg-zinc-800/80 text-white ring-1 ring-white'
                      : 'border-zinc-800/80 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-2">
                    <span>{style.emoji}</span>
                    <span>{style.name}</span>
                  </span>
                  {selectedStyle === style.id && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Lighting & Sun Angle */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5" />
              <span>Lighting &amp; Atmosphere</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {LIGHTING_PRESETS.map((light) => (
                <button
                  key={light.id}
                  onClick={() => setSelectedLighting(light.id)}
                  className={`flex items-center gap-1.5 rounded-xl border p-2 text-left text-xs transition-all ${
                    selectedLighting === light.id
                      ? 'border-white bg-zinc-800 text-white'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span>{light.emoji}</span>
                  <span className="truncate font-semibold">{light.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Key PBR Material */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>PBR Material Focus</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {MATERIAL_PRESETS.map((mat) => (
                <button
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat.id)}
                  className={`rounded-xl border p-2 text-left text-xs font-semibold transition-all ${
                    selectedMaterial === mat.id
                      ? 'border-white bg-zinc-800 text-white'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span className="truncate block">{mat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Geometry Lock vs AI Creativity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-400 uppercase text-[11px]">Geometry Lock</span>
              <span className="font-mono font-bold text-emerald-400">{geometryLock}%</span>
            </div>
            <input
              type="range"
              min={30}
              max={100}
              value={geometryLock}
              onChange={(e) => setGeometryLock(Number(e.target.value))}
              className="w-full accent-white cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>Creative Re-imagining</span>
              <span>Exact CAD Match</span>
            </div>
          </div>

          {/* Extra Custom Prompt */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Additional Prompt Instructions
            </label>
            <textarea
              rows={2}
              value={promptExtra}
              onChange={(e) => setPromptExtra(e.target.value)}
              placeholder="e.g. Add fiddle leaf fig plant, rain drops on window, dusk street reflection..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-white focus:outline-none resize-none"
            />
          </div>

          {/* Primary Render CTA */}
          <div className="pt-2">
            <button
              onClick={handleGenerateRender}
              disabled={!viewportImage || isRendering}
              className="group relative flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-black tracking-wide text-zinc-950 shadow-xl transition-all hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isRendering ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-zinc-950" />
                  <span>Cloud Rendering 4K ({renderProgress}%)...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-zinc-950" />
                  <span>Generate 4K Photorealistic Render</span>
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[10px] text-zinc-500">
              Cloud GPU acceleration · ~10 seconds per render
            </p>
          </div>
        </div>
      </div>

      {/* ── CAD Selector Modal ───────────────────────────────────────────── */}
      <CadSelectorModal
        open={cadModalOpen}
        onClose={() => setCadModalOpen(false)}
        sources={cadSources}
        onSelectSource={handleSelectCadSource}
        onRefresh={refreshCadWindows}
        loading={cadLoading}
      />

      {/* ── Auth / Licensing Modal ───────────────────────────────────────── */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={(email) => setUserEmail(email)}
        apiBaseUrl={API_BASE_URL}
      />
    </div>
  );
}
