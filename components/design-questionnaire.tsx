"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Wand2,
  CheckCircle2,
  Pipette,
} from "lucide-react";
import type { DesignQuestionnaire } from "@/types";

/* ─── Default state ──────────────────────────────────────────────────────── */
export const DEFAULT_QUESTIONNAIRE: DesignQuestionnaire = {
  spaceType: "interior",
  roomType: "Living Room",
  roomSize: "medium",
  ceilingHeight: "standard",
  naturalLight: "moderate",
  primaryStyle: "Modern",
  mood: "airy",
  era: "contemporary",
  colorPalette: "warm-neutrals",
  accentColor: "#8B5CF6",
  wallFinish: "white",
  floorMaterial: "light-hardwood",
  furnitureDensity: "moderate",
  woodTone: "medium-oak",
  metalAccent: "none",
  textileRichness: "layered",
  lightingMood: "bright-natural",
  greenery: "minimal",
  specialElements: [],
};

/* ─── Option card ────────────────────────────────────────────────────────── */
function OptionCard({
  selected,
  onClick,
  emoji,
  label,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1.5 rounded-2xl border p-4 text-left transition-all",
        selected
          ? "border-foreground/40 bg-foreground/10 ring-foreground/30 ring-1"
          : "border-foreground/10 bg-foreground/5 hover:border-foreground/20 hover:bg-foreground/8"
      )}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-sm font-semibold">{label}</span>
      {description && (
        <span className="text-muted-foreground text-xs leading-snug">
          {description}
        </span>
      )}
    </button>
  );
}

/* ─── Single-color swatch card ───────────────────────────────────────────── */
function ColorSwatchCard({
  selected,
  onClick,
  color,
  label,
  description,
  border,
  customColor,
  onCustomColorChange,
}: {
  selected: boolean;
  onClick: () => void;
  color: string;
  label: string;
  description?: string;
  border?: boolean;
  customColor?: string;
  onCustomColorChange?: (hex: string) => void;
}) {
  const displayColor = customColor ?? color;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col gap-2 rounded-2xl border p-3 text-left transition-all",
        selected
          ? "border-foreground/40 bg-foreground/10 ring-foreground/30 ring-1"
          : "border-foreground/10 bg-foreground/5 hover:border-foreground/20 hover:bg-foreground/8"
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "h-10 w-full rounded-xl",
            border && "border-foreground/15 border"
          )}
          style={{ backgroundColor: displayColor }}
        />
        <label
          title="Customize color"
          className="absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/20 backdrop-blur-sm transition-opacity hover:bg-black/40"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="color"
            value={displayColor}
            className="sr-only"
            onChange={(e) => onCustomColorChange?.(e.target.value)}
          />
          <Pipette className="h-2.5 w-2.5 text-white drop-shadow" />
        </label>
      </div>
      <span className="text-sm leading-tight font-semibold">{label}</span>
      {description && (
        <span className="text-muted-foreground text-xs leading-snug">
          {description}
        </span>
      )}
    </button>
  );
}

/* ─── Multi-color palette card ───────────────────────────────────────────── */
function PaletteCard({
  selected,
  onClick,
  colors,
  label,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  colors: string[];
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 rounded-2xl border p-3 text-left transition-all",
        selected
          ? "border-foreground/40 bg-foreground/10 ring-foreground/30 ring-1"
          : "border-foreground/10 bg-foreground/5 hover:border-foreground/20 hover:bg-foreground/8"
      )}
    >
      <div className="flex gap-1">
        {colors.map((c, i) => (
          <div
            key={i}
            className="h-8 flex-1 rounded-lg first:rounded-l-xl last:rounded-r-xl"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <span className="text-sm leading-tight font-semibold">{label}</span>
      {description && (
        <span className="text-muted-foreground text-xs leading-snug">
          {description}
        </span>
      )}
    </button>
  );
}

/* ─── Multi-select card ──────────────────────────────────────────────────── */
function MultiCard({
  selected,
  onClick,
  emoji,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3 text-left transition-all",
        selected
          ? "border-foreground/40 bg-foreground/10 ring-foreground/30 ring-1"
          : "border-foreground/10 bg-foreground/5 hover:border-foreground/20 hover:bg-foreground/8"
      )}
    >
      <span className="text-lg">{emoji}</span>
      <span className="text-sm font-medium">{label}</span>
      {selected && (
        <CheckCircle2 className="text-foreground/70 ml-auto h-4 w-4 shrink-0" />
      )}
    </button>
  );
}

/* ─── Section label ──────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-foreground/50 mb-3 text-xs font-semibold tracking-widest uppercase">
      {children}
    </p>
  );
}

/* ─── Steps ──────────────────────────────────────────────────────────────── */
const STEPS = [
  "Space Type",
  "Room & Space",
  "Style & Mood",
  "Colors & Materials",
  "Furniture & Accents",
  "Lighting & Details",
];

/* ─── Main component ─────────────────────────────────────────────────────── */
interface Props {
  value: DesignQuestionnaire;
  onChange: (q: DesignQuestionnaire) => void;
  onGenerate: () => void;
  isLoading: boolean;
  canGenerate: boolean;
  trialExhausted?: boolean;
}

export function DesignQuestionnaireForm({
  value,
  onChange,
  onGenerate,
  isLoading,
  canGenerate,
  trialExhausted = false,
}: Props) {
  const [step, setStep] = useState(0);

  const set = <K extends keyof DesignQuestionnaire>(
    key: K,
    val: DesignQuestionnaire[K]
  ) => onChange({ ...value, [key]: val });

  const cc = (field: string, val: string) =>
    value.customColors?.[`${field}:${val}`];
  const setCC = (field: string, val: string, hex: string) =>
    onChange({
      ...value,
      customColors: { ...value.customColors, [`${field}:${val}`]: hex },
    });

  const toggleSpecial = (el: string) => {
    const cur = value.specialElements || [];
    set(
      "specialElements",
      cur.includes(el) ? cur.filter((x: string) => x !== el) : [...cur, el]
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span className="text-foreground font-medium">
            {step === 1
              ? value.spaceType === "exterior"
                ? "Building & Site"
                : "Room & Space"
              : STEPS[step]}
          </span>
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all",
                i <= step ? "bg-foreground/70" : "bg-foreground/15"
              )}
            />
          ))}
        </div>
      </div>

      {/* ── Step 0: Interior / Exterior ── */}
      {step === 0 && (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            What kind of space are you designing?
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                v: "interior" as const,
                e: "🏠",
                label: "Interior",
                d: "Inside a building — rooms, hallways, living spaces",
              },
              {
                v: "exterior" as const,
                e: "🏡",
                label: "Exterior",
                d: "Outside a building — façades, gardens, entrances",
              },
            ].map((o) => (
              <OptionCard
                key={o.v}
                selected={value.spaceType === o.v}
                onClick={() => set("spaceType", o.v)}
                emoji={o.e}
                label={o.label}
                description={o.d}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Step 1: Room & Space (or Building & Site) ── */}
      {step === 1 && value.spaceType === "interior" && (
        <div className="space-y-5">
          <div>
            <SectionLabel>Room Type</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  { v: "Living Room", e: "🛋️", d: "Lounge & sitting area" },
                  { v: "Bedroom", e: "🛏️", d: "Private sleep retreat" },
                  { v: "Bathroom", e: "🚿", d: "Wash & wellness" },
                  { v: "Kitchen", e: "🍳", d: "Cooking & dining" },
                  { v: "Dining Room", e: "🪑", d: "Formal dining space" },
                  { v: "Home Office", e: "💻", d: "Work & study" },
                  { v: "Kids Room", e: "🎨", d: "Play & sleep" },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={o.v}
                  selected={value.roomType === o.v}
                  onClick={() => set("roomType", o.v)}
                  emoji={o.e}
                  label={o.v}
                  description={o.d}
                />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Room Size</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  {
                    v: "small",
                    e: "📦",
                    label: "Compact",
                    d: "Under 150 sq ft",
                  },
                  { v: "medium", e: "🏠", label: "Medium", d: "150–300 sq ft" },
                  { v: "large", e: "🏡", label: "Large", d: "300–500 sq ft" },
                  {
                    v: "open-plan",
                    e: "🌅",
                    label: "Open Plan",
                    d: "500+ sq ft",
                  },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={o.v}
                  selected={value.roomSize === o.v}
                  onClick={() => set("roomSize", o.v)}
                  emoji={o.e}
                  label={o.label}
                  description={o.d}
                />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Ceiling Height</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  { v: "low", e: "📉", label: "Low", d: "7–8 ft" },
                  { v: "standard", e: "🏢", label: "Standard", d: "9 ft" },
                  { v: "high", e: "🏛️", label: "High", d: "10–11 ft" },
                  {
                    v: "vaulted",
                    e: "⛪",
                    label: "Vaulted",
                    d: "Double height",
                  },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={o.v}
                  selected={value.ceilingHeight === o.v}
                  onClick={() => set("ceilingHeight", o.v)}
                  emoji={o.e}
                  label={o.label}
                  description={o.d}
                />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Natural Light</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  {
                    v: "minimal",
                    e: "🌑",
                    label: "Minimal",
                    d: "Small or no windows",
                  },
                  {
                    v: "moderate",
                    e: "🌤️",
                    label: "Moderate",
                    d: "Standard windows",
                  },
                  {
                    v: "abundant",
                    e: "☀️",
                    label: "Abundant",
                    d: "Floor-to-ceiling windows",
                  },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={o.v}
                  selected={value.naturalLight === o.v}
                  onClick={() => set("naturalLight", o.v)}
                  emoji={o.e}
                  label={o.label}
                  description={o.d}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && value.spaceType === "exterior" && (
        <div className="space-y-5">
          <div>
            <SectionLabel>Building / Space Type</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  { v: "House", e: "🏠", d: "Single family home" },
                  { v: "Villa", e: "🏡", d: "Luxury residence" },
                  {
                    v: "Apartment Building",
                    e: "🏢",
                    d: "Multi-storey residential",
                  },
                  { v: "Office Building", e: "🏬", d: "Commercial office" },
                  {
                    v: "Commercial Facade",
                    e: "🏪",
                    d: "Retail / restaurant front",
                  },
                  {
                    v: "Garden / Landscape",
                    e: "🌳",
                    d: "Outdoor garden or yard",
                  },
                  {
                    v: "Entrance / Driveway",
                    e: "🚗",
                    d: "Entry gate or driveway",
                  },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={o.v}
                  selected={value.roomType === o.v}
                  onClick={() => set("roomType", o.v)}
                  emoji={o.e}
                  label={o.v}
                  description={o.d}
                />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Building Scale</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  {
                    v: "small",
                    e: "🏚️",
                    label: "Small",
                    d: "Compact / single storey",
                  },
                  { v: "medium", e: "🏠", label: "Medium", d: "2–3 storeys" },
                  {
                    v: "large",
                    e: "🏗️",
                    label: "Large",
                    d: "4+ storeys / estate",
                  },
                  {
                    v: "open-plan",
                    e: "🌅",
                    label: "Sprawling",
                    d: "Large site / campus",
                  },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={o.v}
                  selected={value.roomSize === o.v}
                  onClick={() => set("roomSize", o.v)}
                  emoji={o.e}
                  label={o.label}
                  description={o.d}
                />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Time of Day / Light</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  {
                    v: "minimal",
                    e: "🌙",
                    label: "Night / Dusk",
                    d: "Lit facade, night sky",
                  },
                  {
                    v: "moderate",
                    e: "🌤️",
                    label: "Overcast Day",
                    d: "Soft diffused daylight",
                  },
                  {
                    v: "abundant",
                    e: "☀️",
                    label: "Golden Hour",
                    d: "Warm sunny daylight",
                  },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={o.v}
                  selected={value.naturalLight === o.v}
                  onClick={() => set("naturalLight", o.v)}
                  emoji={o.e}
                  label={o.label}
                  description={o.d}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Style & Mood ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <SectionLabel>Primary Design Style</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  { v: "Modern", e: "⬛", d: "Clean, geometric, minimal" },
                  { v: "Minimalist", e: "◻️", d: "Less is more" },
                  { v: "Scandinavian", e: "🌿", d: "Nordic warmth & function" },
                  { v: "Industrial", e: "🏗️", d: "Raw, exposed, urban" },
                  { v: "Bohemian", e: "🪴", d: "Eclectic, rich, layered" },
                  { v: "Traditional", e: "🏰", d: "Classic, formal, timeless" },
                  { v: "Coastal", e: "🌊", d: "Breezy, natural, relaxed" },
                  {
                    v: "Mid-Century Modern",
                    e: "🪑",
                    d: "Retro, organic, iconic",
                  },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={o.v}
                  selected={value.primaryStyle === o.v}
                  onClick={() => set("primaryStyle", o.v)}
                  emoji={o.e}
                  label={o.v}
                  description={o.d}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Atmosphere & Mood</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(
                [
                  {
                    v: "cozy",
                    e: "🕯️",
                    label: "Cozy & Warm",
                    d: "Intimate, inviting",
                  },
                  {
                    v: "airy",
                    e: "🪟",
                    label: "Light & Airy",
                    d: "Fresh, open, breezy",
                  },
                  {
                    v: "dramatic",
                    e: "🎭",
                    label: "Dramatic",
                    d: "Bold, high-contrast",
                  },
                  {
                    v: "serene",
                    e: "🧘",
                    label: "Serene & Calm",
                    d: "Peaceful, tranquil",
                  },
                  {
                    v: "energetic",
                    e: "⚡",
                    label: "Energetic",
                    d: "Vibrant, dynamic",
                  },
                  {
                    v: "luxurious",
                    e: "💎",
                    label: "Luxurious",
                    d: "Opulent, high-end",
                  },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={o.v}
                  selected={value.mood === o.v}
                  onClick={() => set("mood", o.v)}
                  emoji={o.e}
                  label={o.label}
                  description={o.d}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Design Era</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(
                [
                  { v: "contemporary", e: "🔲", label: "Contemporary" },
                  { v: "mid-century", e: "📻", label: "Mid-Century" },
                  { v: "vintage", e: "🎞️", label: "Vintage/Retro" },
                  { v: "traditional", e: "🏺", label: "Traditional" },
                  { v: "futuristic", e: "🚀", label: "Futuristic" },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={o.v}
                  selected={value.era === o.v}
                  onClick={() => set("era", o.v)}
                  emoji={o.e}
                  label={o.label}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Colors & Materials ── */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <SectionLabel>Color Palette</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(
                [
                  {
                    v: "warm-neutrals",
                    colors: ["#F5ECD7", "#DEC49A", "#C4A882", "#B8966E"],
                    label: "Warm Neutrals",
                    d: "Cream, taupe, sandy",
                  },
                  {
                    v: "cool-neutrals",
                    colors: ["#F3F4F6", "#D1D5DB", "#9CA3AF", "#6B7280"],
                    label: "Cool Neutrals",
                    d: "White, gray, pale blue",
                  },
                  {
                    v: "bold",
                    colors: ["#C0392B", "#2563EB", "#16A34A", "#7C3AED"],
                    label: "Bold Accents",
                    d: "Saturated pops of color",
                  },
                  {
                    v: "monochrome",
                    colors: ["#1A1A1A", "#555", "#999", "#DDD"],
                    label: "Monochrome",
                    d: "Black to white",
                  },
                  {
                    v: "earthy",
                    colors: ["#C1502E", "#D97706", "#6B7C3A", "#8B5E3C"],
                    label: "Earthy Tones",
                    d: "Terracotta, ochre, olive",
                  },
                  {
                    v: "pastel",
                    colors: ["#F9C6D0", "#C6D9F9", "#C6F9D5", "#F9ECC6"],
                    label: "Pastels",
                    d: "Soft, muted, delicate",
                  },
                ] as {
                  v: DesignQuestionnaire["colorPalette"];
                  colors: string[];
                  label: string;
                  d: string;
                }[]
              ).map((o) => (
                <PaletteCard
                  key={o.v}
                  selected={value.colorPalette === o.v}
                  onClick={() => set("colorPalette", o.v)}
                  colors={o.colors}
                  label={o.label}
                  description={o.d}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>
              {value.spaceType === "exterior"
                ? "Facade Color / Cladding"
                : "Wall Color"}
            </SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  {
                    v: "white",
                    color: "#F8F8F8",
                    label: "Crisp White",
                    border: true,
                  },
                  { v: "cream", color: "#FFF5E0", label: "Warm Cream" },
                  { v: "light-gray", color: "#D4D4D8", label: "Soft Gray" },
                  { v: "beige", color: "#E8D5B7", label: "Warm Beige" },
                  { v: "dark", color: "#1C1C1E", label: "Deep Dark" },
                  {
                    v: "textured",
                    color: "#C9B99A",
                    label: "Textured Plaster",
                  },
                  {
                    v: "wood-paneled",
                    color: "#8B6644",
                    label: "Wood Paneling",
                  },
                ] as {
                  v: DesignQuestionnaire["wallFinish"];
                  color: string;
                  label: string;
                  border?: boolean;
                }[]
              ).map((o) => (
                <ColorSwatchCard
                  key={o.v}
                  selected={value.wallFinish === o.v}
                  onClick={() => set("wallFinish", o.v)}
                  color={o.color}
                  label={o.label}
                  border={o.border}
                  customColor={cc("wallFinish", o.v)}
                  onCustomColorChange={(hex) => setCC("wallFinish", o.v, hex)}
                />
              ))}
            </div>
          </div>

          {(() => {
            const floorOpts: {
              v: DesignQuestionnaire["floorMaterial"];
              color: string;
              label: string;
              d: string;
              border?: boolean;
            }[] =
              value.spaceType === "exterior"
                ? [
                    {
                      v: "light-hardwood",
                      color: "#E8CDA0",
                      label: "Sandstone Paving",
                      d: "Light natural stone",
                    },
                    {
                      v: "dark-hardwood",
                      color: "#4A3728",
                      label: "Dark Granite",
                      d: "Basalt or dark stone",
                    },
                    {
                      v: "marble",
                      color: "#EAE6E0",
                      label: "Marble / Limestone",
                      d: "Polished stone",
                    },
                    {
                      v: "concrete",
                      color: "#9CA3AF",
                      label: "Brushed Concrete",
                      d: "Exposed aggregate",
                    },
                    {
                      v: "carpet",
                      color: "#5C8A3C",
                      label: "Manicured Lawn",
                      d: "Lush green grass",
                    },
                    {
                      v: "tile",
                      color: "#D1D5DB",
                      label: "Outdoor Porcelain",
                      d: "Large format tile",
                      border: true,
                    },
                    {
                      v: "herringbone",
                      color: "#C4A882",
                      label: "Herringbone Brick",
                      d: "Classic brick pattern",
                    },
                  ]
                : [
                    {
                      v: "light-hardwood",
                      color: "#DEC49A",
                      label: "Light Hardwood",
                      d: "Ash or birch",
                    },
                    {
                      v: "dark-hardwood",
                      color: "#5C3A1E",
                      label: "Dark Hardwood",
                      d: "Walnut or mahogany",
                    },
                    {
                      v: "marble",
                      color: "#EAE6E0",
                      label: "Marble / Stone",
                      d: "Natural stone",
                    },
                    {
                      v: "concrete",
                      color: "#9CA3AF",
                      label: "Polished Concrete",
                      d: "Industrial finish",
                    },
                    {
                      v: "carpet",
                      color: "#A8A077",
                      label: "Carpet",
                      d: "Plush underfoot",
                    },
                    {
                      v: "tile",
                      color: "#E5E5E5",
                      label: "Large Tile",
                      d: "Ceramic or porcelain",
                      border: true,
                    },
                    {
                      v: "herringbone",
                      color: "#C4A882",
                      label: "Herringbone",
                      d: "Parquet pattern",
                    },
                  ];
            return (
              <div>
                <SectionLabel>
                  {value.spaceType === "exterior"
                    ? "Ground / Paving / Path"
                    : "Flooring"}
                </SectionLabel>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {floorOpts.map((o) => (
                    <ColorSwatchCard
                      key={o.v}
                      selected={value.floorMaterial === o.v}
                      onClick={() => set("floorMaterial", o.v)}
                      color={o.color}
                      label={o.label}
                      description={o.d}
                      border={o.border}
                      customColor={cc("floorMaterial", o.v)}
                      onCustomColorChange={(hex) =>
                        setCC("floorMaterial", o.v, hex)
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Step 4: Furniture & Accents ── */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <SectionLabel>
              {value.spaceType === "exterior"
                ? "Landscaping Level"
                : "Furniture Density"}
            </SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {(value.spaceType === "exterior"
                ? [
                    {
                      v: "minimal" as const,
                      e: "🫧",
                      label: "Clean / Minimal",
                      d: "Paved only, no planting",
                    },
                    {
                      v: "moderate" as const,
                      e: "�",
                      label: "Balanced Garden",
                      d: "Some planting and features",
                    },
                    {
                      v: "fully-furnished" as const,
                      e: "🌳",
                      label: "Lush Landscaping",
                      d: "Trees, hedges, full garden",
                    },
                  ]
                : [
                    {
                      v: "minimal" as const,
                      e: "🫧",
                      label: "Minimal",
                      d: "Only essentials, open floor",
                    },
                    {
                      v: "moderate" as const,
                      e: "�",
                      label: "Balanced",
                      d: "Functional & comfortable",
                    },
                    {
                      v: "fully-furnished" as const,
                      e: "🛋️",
                      label: "Fully Furnished",
                      d: "Rich, layered, complete",
                    },
                  ]
              ).map((o) => (
                <OptionCard
                  key={o.v}
                  selected={value.furnitureDensity === o.v}
                  onClick={() => set("furnitureDensity", o.v)}
                  emoji={o.e}
                  label={o.label}
                  description={o.d}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>
              {value.spaceType === "exterior"
                ? "Door / Trim / Timber"
                : "Wood Tones"}
            </SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(
                [
                  { v: "light-ash", color: "#E8D5B0", label: "Light Ash" },
                  { v: "medium-oak", color: "#B8860B", label: "Medium Oak" },
                  { v: "dark-walnut", color: "#4A2E1A", label: "Dark Walnut" },
                  {
                    v: "painted-white",
                    color: "#F5F5F5",
                    label: "Painted White",
                    border: true,
                  },
                  {
                    v: "none",
                    color: "#E5E7EB",
                    label: "No Wood",
                    border: true,
                  },
                ] as {
                  v: DesignQuestionnaire["woodTone"];
                  color: string;
                  label: string;
                  border?: boolean;
                }[]
              ).map((o) => (
                <ColorSwatchCard
                  key={o.v}
                  selected={value.woodTone === o.v}
                  onClick={() => set("woodTone", o.v)}
                  color={o.color}
                  label={o.label}
                  border={o.border}
                  customColor={cc("woodTone", o.v)}
                  onCustomColorChange={(hex) => setCC("woodTone", o.v, hex)}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Metal Accents</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(
                [
                  {
                    v: "brushed-gold",
                    color: "#C9A84C",
                    label: "Brushed Gold",
                  },
                  {
                    v: "polished-silver",
                    color: "#C0C0C0",
                    label: "Polished Silver",
                  },
                  { v: "matte-black", color: "#2D2D2D", label: "Matte Black" },
                  { v: "aged-bronze", color: "#8B6914", label: "Aged Bronze" },
                  {
                    v: "none",
                    color: "#E5E7EB",
                    label: "No Metal",
                    border: true,
                  },
                ] as {
                  v: DesignQuestionnaire["metalAccent"];
                  color: string;
                  label: string;
                  border?: boolean;
                }[]
              ).map((o) => (
                <ColorSwatchCard
                  key={o.v}
                  selected={value.metalAccent === o.v}
                  onClick={() => set("metalAccent", o.v)}
                  color={o.color}
                  label={o.label}
                  border={o.border}
                  customColor={cc("metalAccent", o.v)}
                  onCustomColorChange={(hex) => setCC("metalAccent", o.v, hex)}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Textiles & Softness</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  {
                    v: "minimal",
                    e: "🧊",
                    label: "Minimal",
                    d: "Clean lines, few soft pieces",
                  },
                  {
                    v: "layered",
                    e: "🛏️",
                    label: "Layered",
                    d: "Cushions, throws, area rug",
                  },
                  {
                    v: "rich-and-textured",
                    e: "🪡",
                    label: "Rich & Textured",
                    d: "Curtains, layered rugs, abundant fabrics",
                  },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={o.v}
                  selected={value.textileRichness === o.v}
                  onClick={() => set("textileRichness", o.v)}
                  emoji={o.e}
                  label={o.label}
                  description={o.d}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 5: Lighting & Details ── */}
      {step === 5 && (
        <div className="space-y-5">
          <div>
            <SectionLabel>Lighting Mood</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  {
                    v: "bright-natural",
                    e: "☀️",
                    label: "Bright & Natural",
                    d: "Sun-drenched, daytime",
                  },
                  {
                    v: "warm-ambient",
                    e: "🕯️",
                    label: "Warm Ambient",
                    d: "Golden, soft glow",
                  },
                  {
                    v: "dramatic-spotlit",
                    e: "🎬",
                    label: "Dramatic",
                    d: "Directional, high contrast",
                  },
                  {
                    v: "soft-diffused",
                    e: "🌫️",
                    label: "Soft & Diffused",
                    d: "Gentle, even, calm",
                  },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={o.v}
                  selected={value.lightingMood === o.v}
                  onClick={() => set("lightingMood", o.v)}
                  emoji={o.e}
                  label={o.label}
                  description={o.d}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Indoor Greenery</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  { v: "none", e: "🚫", label: "None", d: "No plants" },
                  {
                    v: "minimal",
                    e: "🌱",
                    label: "Subtle",
                    d: "1–2 small plants",
                  },
                  {
                    v: "moderate",
                    e: "🪴",
                    label: "Moderate",
                    d: "Several decorative plants",
                  },
                  {
                    v: "lush-botanical",
                    e: "🌿",
                    label: "Lush Botanical",
                    d: "Indoor jungle, abundant greenery",
                  },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={o.v}
                  selected={value.greenery === o.v}
                  onClick={() => set("greenery", o.v)}
                  emoji={o.e}
                  label={o.label}
                  description={o.d}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>
              Special Elements (select all that apply)
            </SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { v: "fireplace", e: "🔥", label: "Fireplace" },
                {
                  v: "bookshelf",
                  e: "📚",
                  label: "Floor-to-Ceiling Bookshelf",
                },
                { v: "rug", e: "🟫", label: "Statement Area Rug" },
                { v: "curtains", e: "🪟", label: "Floor-to-Ceiling Curtains" },
                { v: "artwork", e: "🖼️", label: "Gallery Wall / Artwork" },
                { v: "mirrors", e: "🪞", label: "Large Decorative Mirrors" },
                { v: "exposed-beams", e: "🪵", label: "Exposed Ceiling Beams" },
              ].map((o) => (
                <MultiCard
                  key={o.v}
                  selected={(value.specialElements || []).includes(o.v)}
                  onClick={() => toggleSpecial(o.v)}
                  emoji={o.e}
                  label={o.label}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="border-foreground/8 mt-2 flex items-center justify-between border-t pt-5">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="border-foreground/15 bg-foreground/5 hover:bg-foreground/10 gap-1.5 rounded-xl"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            className="bg-foreground text-background hover:bg-foreground/90 gap-1.5 rounded-xl"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={onGenerate}
            disabled={!canGenerate || isLoading}
            className="bg-foreground text-background hover:bg-foreground/90 gap-2 rounded-xl px-6 shadow-[0_6px_24px_rgba(99,102,241,0.3)]"
          >
            <Wand2 className={isLoading ? "animate-pulse" : undefined} />
            {isLoading
              ? "Generating..."
              : trialExhausted
                ? "Generate (Activate Plan)"
                : "Generate Design"}
          </Button>
        )}
      </div>

      {!canGenerate && step === STEPS.length - 1 && (
        <p className="text-muted-foreground text-center text-xs">
          ↑ Upload a room photo first to enable generation
        </p>
      )}
    </div>
  );
}
