"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from "framer-motion";
import Image from "next/image";
import {
  Sparkles,
  Upload,
  RotateCcw,
  ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BEFORE =
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=85";
const AFTER =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=85";

const OPTIONS = [
  {
    key: "room" as const,
    label: "Room Type",
    choices: ["Living Room", "Bedroom", "Kitchen", "Office"],
    autoSelect: "Living Room",
  },
  {
    key: "style" as const,
    label: "Design Style",
    choices: ["Modern", "Scandinavian", "Industrial", "Coastal"],
    autoSelect: "Modern",
  },
  {
    key: "lighting" as const,
    label: "Lighting",
    choices: ["Natural", "Warm", "Dramatic", "Cool"],
    autoSelect: "Warm",
  },
  {
    key: "palette" as const,
    label: "Color Palette",
    choices: ["Neutral", "Earthy", "Bold", "Monochrome"],
    autoSelect: "Neutral",
  },
  {
    key: "material" as const,
    label: "Materials",
    choices: ["Wood", "Marble", "Concrete", "Linen"],
    autoSelect: "Wood",
  },
];

type OptionKey = "room" | "style" | "lighting" | "palette" | "material";
type Selections = Partial<Record<OptionKey, string>>;

/* ─── Cursor ────────────────────────────────────────────── */
function CursorSVG({ pressing }: { pressing: boolean }) {
  return (
    <motion.svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      animate={{ scale: pressing ? 0.75 : 1 }}
      transition={{ type: "spring", stiffness: 700, damping: 26 }}
      style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}
    >
      <path
        d="M2.5 2.5L11 21.5L14 14L21.5 11L2.5 2.5Z"
        fill="white"
        stroke="#111827"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

/* ─── Ripple ────────────────────────────────────────────── */
function Ripple() {
  return (
    <motion.span
      className="pointer-events-none absolute inset-0 rounded-xl bg-white/40"
      initial={{ scale: 0.4, opacity: 1 }}
      animate={{ scale: 2.6, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    />
  );
}

/* ─── Chip ──────────────────────────────────────────────── */
interface ChipProps {
  label: string;
  selected: boolean;
  ripple: boolean;
  refProp?: (el: HTMLButtonElement | null) => void;
}
function Chip({ label, selected, ripple, refProp }: ChipProps) {
  return (
    <div className="relative">
      {ripple && <Ripple />}
      <motion.button
        ref={refProp}
        animate={selected ? { scale: [1, 1.15, 0.95, 1] } : { scale: 1 }}
        transition={
          selected
            ? { duration: 0.3, times: [0, 0.35, 0.65, 1] }
            : { duration: 0.15 }
        }
        className={cn(
          "relative rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors duration-150 sm:px-3.5 sm:py-2 sm:text-sm",
          selected
            ? "border-foreground bg-foreground text-background shadow"
            : "bg-muted/50 text-muted-foreground hover:border-foreground/30"
        )}
      >
        {label}
      </motion.button>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────── */
export function LiveDemoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const uploadBtnRef = useRef<HTMLButtonElement>(null);
  const generateBtnRef = useRef<HTMLButtonElement>(null);
  const chipRefs = useRef<Partial<Record<OptionKey, HTMLButtonElement | null>>>(
    {}
  );

  const cursorX = useMotionValue(-999);
  const cursorY = useMotionValue(-999);

  type Phase = "upload" | "image-in" | "selections" | "loading" | "result";
  const [phase, setPhase] = useState<Phase>("upload");
  const [selections, setSelections] = useState<Selections>({});
  const [ripples, setRipples] = useState<Partial<Record<string, boolean>>>({});
  const [cursorVisible, setCursorVisible] = useState(false);
  const [pressing, setPressing] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const started = useRef(false);
  const loopRef = useRef<() => void>(() => {});

  const clearAll = () => timers.current.forEach(clearTimeout);

  const moveTo = useCallback(
    async (el: HTMLElement | null, dur = 0.55) => {
      if (!el || !containerRef.current) return;
      const eR = el.getBoundingClientRect();
      const cR = containerRef.current.getBoundingClientRect();
      await Promise.all([
        animate(cursorX, eR.left - cR.left + eR.width / 2 - 11, {
          duration: dur,
          ease: [0.22, 1, 0.36, 1],
        }),
        animate(cursorY, eR.top - cR.top + eR.height / 2 - 3, {
          duration: dur,
          ease: [0.22, 1, 0.36, 1],
        }),
      ]);
    },
    [cursorX, cursorY]
  );

  const doClick = useCallback((key: string) => {
    setPressing(true);
    setRipples((r) => ({ ...r, [key]: true }));
    setTimeout(() => {
      setPressing(false);
      setRipples((r) => ({ ...r, [key]: false }));
    }, 380);
  }, []);

  const runSequence = useCallback(() => {
    clearAll();
    setPhase("upload");
    setSelections({});
    setRipples({});
    setPressing(false);
    setCursorVisible(false);
    cursorX.set(-999);
    cursorY.set(-999);

    const t = (ms: number, fn: () => void) => {
      const id = setTimeout(fn, ms);
      timers.current.push(id);
    };

    /* 1 — snap cursor, move to Upload button */
    t(350, () => {
      const cR = containerRef.current?.getBoundingClientRect();
      const uR = uploadBtnRef.current?.getBoundingClientRect();
      if (cR && uR) {
        cursorX.set(uR.right - cR.left + 10);
        cursorY.set(uR.top - cR.top - 28);
      }
      setCursorVisible(true);
    });
    t(430, () => moveTo(uploadBtnRef.current, 0.6));

    /* 2 — click upload → brief image flash */
    t(1100, () => {
      doClick("upload");
    });
    t(1150, () => setPhase("image-in"));

    /* 3 — hide cursor during image flash, then switch to selections */
    t(1200, () => setCursorVisible(false));
    t(2400, () => {
      setPhase("selections");
    });

    /* 4 — select each option, cursor appears after selections mount */
    const seq: Array<{ key: OptionKey; clickAt: number }> = [
      { key: "room", clickAt: 3100 },
      { key: "style", clickAt: 3850 },
      { key: "lighting", clickAt: 4580 },
      { key: "palette", clickAt: 5280 },
      { key: "material", clickAt: 5980 },
    ];

    t(2900, () => setCursorVisible(true));

    for (const { key, clickAt } of seq) {
      const k = key;
      const val = OPTIONS.find((o) => o.key === k)!.autoSelect;
      t(clickAt - 600, () => moveTo(chipRefs.current[k] ?? null, 0.5));
      t(clickAt, () => {
        doClick(k);
        setSelections((s) => ({ ...s, [k]: val }));
      });
    }

    /* 5 — move to Generate, click */
    t(6600, () => moveTo(generateBtnRef.current, 0.7));
    t(7400, () => {
      doClick("generate");
      setTimeout(() => setPhase("loading"), 180);
    });

    /* 6 — result */
    t(8900, () => {
      setPhase("result");
      setCursorVisible(false);
    });

    /* loop */
    t(15000, () => loopRef.current());
  }, [cursorX, cursorY, doClick, moveTo]);

  useEffect(() => {
    loopRef.current = runSequence;
  }, [runSequence]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          runSequence();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selCount = Object.keys(selections).length;

  return (
    <section className="py-4">
      {/* Heading */}
      <div className="mb-10 text-center">
        <span className="bg-background text-muted-foreground mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
          <Sparkles className="h-3 w-3" /> Live demo
        </span>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          See the transformation
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Watch the full workflow — upload, configure, and generate.
        </p>
      </div>

      {/* Demo card */}
      <div
        ref={containerRef}
        className="bg-background relative mx-auto max-w-lg overflow-hidden rounded-2xl border shadow-xl sm:max-w-2xl"
      >
        {/* Browser chrome */}
        <div className="bg-muted/40 flex items-center gap-2 border-b px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          <div className="bg-background ml-3 flex-1 rounded-md border px-3 py-0.5 text-center text-xs text-gray-400">
            app.v6render.com/studio
          </div>
          <AnimatePresence>
            {phase === "result" && (
              <motion.button
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  started.current = false;
                  runSequence();
                  started.current = true;
                }}
                className="text-muted-foreground hover:text-foreground ml-2 flex items-center gap-1 text-xs transition-colors"
              >
                <RotateCcw className="h-3 w-3" /> Replay
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Phase content — fixed height so card never resizes */}
        <div className="relative h-[340px] sm:h-[380px]">
          <AnimatePresence mode="wait">
            {/* ── UPLOAD ── */}
            {phase === "upload" && (
              <motion.div
                key="upload"
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
              >
                <div className="bg-muted/60 rounded-2xl p-5">
                  <ImageIcon
                    className="text-muted-foreground h-10 w-10"
                    strokeWidth={1.3}
                  />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold">
                    Drop your room photo here
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    JPG · PNG · HEIC — up to 10 MB
                  </p>
                </div>
                <div className="relative mt-1">
                  {ripples["upload"] && <Ripple />}
                  <button
                    ref={uploadBtnRef}
                    className="bg-foreground text-background flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── IMAGE FLASH ── */}
            {phase === "image-in" && (
              <motion.div
                key="image-in"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Image
                  src={BEFORE}
                  alt="Uploaded room"
                  fill
                  className="object-cover"
                  priority
                  sizes="640px"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 400,
                    damping: 22,
                  }}
                  className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Photo uploaded successfully
                </motion.div>
              </motion.div>
            )}

            {/* ── SELECTIONS ── */}
            {phase === "selections" && (
              <motion.div
                key="selections"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {OPTIONS.map((group, gi) => {
                    const sel = selections[group.key];
                    return (
                      <motion.div
                        key={group.key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: gi * 0.07,
                          duration: 0.28,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-widest uppercase">
                          {group.label}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.choices.map((choice) => (
                            <Chip
                              key={choice}
                              label={choice}
                              selected={sel === choice}
                              ripple={
                                !!(
                                  ripples[group.key] &&
                                  choice === group.autoSelect
                                )
                              }
                              refProp={
                                choice === group.autoSelect
                                  ? (el) => {
                                      chipRefs.current[group.key] = el;
                                    }
                                  : undefined
                              }
                            />
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* All-set pill */}
                <AnimatePresence>
                  {selCount === OPTIONS.length && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      All options configured — ready to generate
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── RESULT ── */}
            {phase === "result" && (
              <motion.div
                key="result"
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={AFTER}
                  alt="Photorealistic architectural render"
                  fill
                  className="object-cover"
                  sizes="640px"
                />
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
                >
                  <Sparkles className="h-3 w-3 text-yellow-300" />
                  Photorealistic Render — Modern · Warm
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bottom bar — always visible ── */}
        <div className="border-t px-5 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {OPTIONS.map((o, i) => (
                <motion.span
                  key={o.key}
                  animate={{
                    scale: selections[o.key] ? 1 : 0.55,
                    opacity: selections[o.key] ? 1 : 0.25,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 28,
                    delay: i * 0.03,
                  }}
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full",
                    selections[o.key] ? "bg-foreground" : "bg-muted-foreground"
                  )}
                />
              ))}
              <span className="text-muted-foreground ml-1 text-xs">
                {selCount}/{OPTIONS.length}
              </span>
            </div>

            {/* Generate button */}
            <div className="relative">
              {ripples["generate"] && <Ripple />}
              <motion.button
                ref={generateBtnRef}
                animate={
                  pressing && ripples["generate"]
                    ? { scale: 0.91 }
                    : { scale: 1 }
                }
                transition={{ type: "spring", stiffness: 600, damping: 30 }}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow transition-colors",
                  phase === "result"
                    ? "bg-green-600 text-white"
                    : "bg-foreground text-background"
                )}
              >
                {phase === "loading" ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.7,
                        ease: "linear",
                      }}
                      className="inline-block h-4 w-4 rounded-full border-2 border-current/25 border-t-current"
                    />
                    Generating…
                  </>
                ) : phase === "result" ? (
                  <>
                    <Sparkles className="h-4 w-4" /> Render complete!
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Generate Design
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Cursor */}
        <AnimatePresence>
          {cursorVisible && (
            <motion.div
              key="cursor"
              className="pointer-events-none absolute z-30"
              style={{ x: cursorX, y: cursorY }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.16 }}
            >
              <CursorSVG pressing={pressing} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Social proof */}
      <div className="text-muted-foreground mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium md:text-base lg:text-lg">
        <span>⚡ Avg render: 18 s</span>
        <span>·</span>
        <span>🎨 20+ styles</span>
        <span>·</span>
        <span>📐 Layout preserved</span>
      </div>
    </section>
  );
}
