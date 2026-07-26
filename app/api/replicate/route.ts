import { NextResponse } from "next/server";
import Replicate from "replicate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import {
  incrementGenerationCount,
  getGenerationCount,
  TRIAL_GENERATION_LIMIT,
} from "@/lib/usage";
import type { DesignQuestionnaire } from "@/types";

/* ─── Prompt maps ──────────────────────────────────────────────────────── */
const MOOD: Record<string, string> = {
  cozy: "warm, intimate, cozy, inviting atmosphere",
  airy: "light, airy, fresh, open atmosphere",
  dramatic: "bold, dramatic, high-contrast, statement-making atmosphere",
  serene: "serene, calm, peaceful, tranquil atmosphere",
  energetic: "vibrant, energetic, dynamic, lively atmosphere",
  luxurious: "luxurious, opulent, high-end, sophisticated atmosphere",
};
const ERA: Record<string, string> = {
  contemporary: "contemporary",
  "mid-century": "mid-century modern",
  vintage: "vintage retro-inspired",
  traditional: "classic traditional",
  futuristic: "sleek futuristic",
};
const ROOM_SIZE: Record<string, string> = {
  small: "compact intimate",
  medium: "",
  large: "spacious large",
  "open-plan": "expansive open-plan",
};
const CEILING: Record<string, string> = {
  low: "",
  standard: "",
  high: "",
  vaulted: "",
};
const LIGHT: Record<string, string> = {
  minimal: "dim intimate light quality",
  moderate: "natural light quality",
  abundant: "bright sun-drenched light quality",
};
const PALETTE: Record<string, string> = {
  "warm-neutrals":
    "warm neutral color palette of creams, taupes, and sandy tones",
  "cool-neutrals": "cool neutral palette of whites, grays, and pale blues",
  bold: "bold saturated accent colors against neutral backgrounds",
  monochrome: "monochromatic tonal color scheme",
  earthy: "earthy palette of terracottas, ochres, olive greens, and raw umber",
  pastel: "soft pastel palette of muted delicate hues",
};
const WALL: Record<string, string> = {
  white: "white wall color",
  cream: "warm cream wall color",
  "light-gray": "soft gray wall color",
  beige: "warm beige wall color",
  dark: "deep dark wall color",
  textured: "textured wall finish",
  "wood-paneled": "wood-toned wall accent",
};
const FLOOR: Record<string, string> = {
  "light-hardwood": "light ash blonde hardwood flooring",
  "dark-hardwood": "rich dark walnut hardwood flooring",
  marble: "luxurious marble stone flooring",
  concrete: "polished concrete flooring",
  carpet: "plush carpet flooring",
  tile: "large format ceramic porcelain tile flooring",
  herringbone: "elegant herringbone parquet flooring",
};
const FURNITURE: Record<string, string> = {
  minimal: "minimal furniture only essential pieces clean open floor space",
  moderate: "balanced furniture arrangement functional and comfortable",
  "fully-furnished":
    "fully furnished richly layered with multiple seating and storage pieces",
};
const WOOD: Record<string, string> = {
  "light-ash": "light ash birch wood furniture",
  "medium-oak": "warm medium oak wood furniture",
  "dark-walnut": "deep dark walnut wood furniture",
  "painted-white": "painted white lacquered furniture",
  none: "",
};
const METAL: Record<string, string> = {
  "brushed-gold": "brushed gold brass metal accents and hardware",
  "polished-silver": "polished chrome silver metal accents",
  "matte-black": "matte black metal hardware and accents",
  "aged-bronze": "aged bronze copper metal accents",
  none: "",
};
const TEXTILE: Record<string, string> = {
  minimal: "minimal textiles clean lines simple fabrics",
  layered: "layered textiles with cushions throw blankets and area rug",
  "rich-and-textured":
    "richly textured textiles floor-to-ceiling curtains multiple rugs abundant soft furnishings",
};
const LIGHTING: Record<string, string> = {
  "bright-natural": "bright cool daylight color temperature",
  "warm-ambient": "warm golden color temperature",
  "dramatic-spotlit": "high-contrast dramatic shadows",
  "soft-diffused": "soft even neutral color temperature",
};
const GREENERY: Record<string, string> = {
  none: "",
  minimal: "one or two subtle indoor plants",
  moderate: "several indoor plants as decorative elements",
  "lush-botanical":
    "lush botanical statement plants abundant indoor greenery indoor jungle",
};
const SPECIAL: Record<string, string> = {
  fireplace: "",
  bookshelf: "",
  rug: "area rug on floor",
  curtains: "curtains on windows",
  artwork: "framed artwork on wall",
  mirrors: "decorative mirror on wall",
  "exposed-beams": "",
};

/* ─── Exterior-specific finish maps ──────────────────────────────────────── */
const EXT_FACADE: Record<string, string> = {
  white: "crisp white render/plaster facade",
  cream: "warm cream painted stucco facade",
  "light-gray": "light gray cement render facade",
  beige: "sandy beige stone cladding facade",
  dark: "dark charcoal or slate facade",
  textured: "textured exposed aggregate facade",
  "wood-paneled": "natural timber cladding facade",
};
const EXT_GROUND: Record<string, string> = {
  "light-hardwood": "light sandstone paving",
  "dark-hardwood": "dark basalt or granite paving",
  marble: "polished marble paving",
  concrete: "brushed concrete pathway",
  carpet: "lush manicured lawn",
  tile: "large format outdoor porcelain tiles",
  herringbone: "herringbone brick paving",
};

/* ─── Exterior prompt ───────────────────────────────────────────────────── */
const LIGHT_TO_SKY: Record<string, string> = {
  minimal:
    "dramatic twilight dusk sky with deep blue-purple gradient, city glow on horizon, lit building facade, golden artificial light spill",
  moderate:
    "overcast soft cloudy sky, diffused daylight, subtle blue-grey clouds, even natural light, realistic cloud texture",
  abundant:
    "vivid golden hour sky with warm orange and pink clouds, long directional sunlight, deep cast shadows, volumetric light rays",
};

function buildExteriorPrompt(q: DesignQuestionnaire): string {
  const matChanges: string[] = [];
  if (EXT_FACADE[q.wallFinish]) matChanges.push(EXT_FACADE[q.wallFinish]);
  if (EXT_GROUND[q.floorMaterial]) matChanges.push(EXT_GROUND[q.floorMaterial]);
  if (WOOD[q.woodTone])
    matChanges.push(`${WOOD[q.woodTone]} on doors and frames`);
  if (METAL[q.metalAccent])
    matChanges.push(`${METAL[q.metalAccent]} on railings and fixtures`);
  const palette = PALETTE[q.colorPalette] ?? "";
  const accentColorStr = q.accentColor
    ? `custom accent color ${q.accentColor} applied to key surfaces`
    : "";
  const skyDesc = LIGHT_TO_SKY[q.naturalLight] ?? LIGHT_TO_SKY["abundant"];
  const style = `${ERA[q.era] ?? ""} ${q.primaryStyle} ${q.roomType}`.trim();

  const EXT_STRUCTURE_LOCK =
    `ABSOLUTE HARD RULE — THIS IS AN IMAGE EDITING TASK, NOT IMAGE GENERATION: ` +
    `You are given an input image of a ${style} building. ` +
    `You MUST preserve with 100% fidelity: ` +
    `(1) exact camera angle, perspective, and distance from the building, ` +
    `(2) exact building massing — every wall, roof plane, overhang, balcony, parapet stays identical, ` +
    `(3) exact window positions, sizes, and shapes — do NOT move, resize, or add windows, ` +
    `(4) exact door positions and sizes, ` +
    `(5) exact number of floors and storey heights, ` +
    `(6) exact site context — driveway, boundary wall, gate, existing trees all stay in same positions. ` +
    `The output MUST show the exact same building form as the input. NO EXCEPTIONS. `;

  return (
    EXT_STRUCTURE_LOCK +
    `NOW apply photorealistic rendering quality to that exact building. ` +
    `${palette ? `Color scheme: ${palette}. ` : ""}` +
    `${accentColorStr ? `Accent: ${accentColorStr}. ` : ""}` +
    `Apply ONLY these surface/cladding changes: ${matChanges.join(", ")}. ` +
    `Sky: ${skyDesc}. ` +
    `GLASS: Realistic window glass — warm amber interior glow visible behind panes, ` +
    `mirror-like sky and tree reflections on outer surface, blue-green glass tint, specular glare, dark aluminium frames. ` +
    `LIGHTING: 3000K warm facade uplights and downlights, strong contrast with 7000K cool sky. ` +
    `Warm bloom tightly around each fixture only — no air scatter or fog. ` +
    `MATERIALS: PBR textures — concrete aggregate grain, stone veining, timber wood grain, brushed metal reflections. ` +
    `SHADOWS: Physically accurate sun shadows, sharp contact shadows at wall bases, deep AO in overhangs and soffits. ` +
    `GLASS INTERIOR: Sheer curtains and furniture silhouettes faintly visible through window glass, condensation on lower edges. ` +
    `GROUND: ${EXT_GROUND[q.floorMaterial] ?? "paving"} with joint lines, wet puddle reflections, individual gravel stones visible. ` +
    `SURFACE AGING: Subtle mineral staining at wall base, micro-crack hairlines, UV paint fade top to bottom, patina on metal. ` +
    `PHOTOGRAPHIC REALISM: ISO 800 grain, lens barrel distortion, chromatic aberration on edges, lens vignette, ` +
    `color temperature variation (warm lit vs cool shadowed). ` +
    `Crystal-clear air — NO haze, fog, or volumetric scatter. ` +
    `100% indistinguishable from a real DSLR photograph. ` +
    `8K. Canon EOS R5, 35mm f/1.4, ISO 800, RAW. ` +
    EXT_STRUCTURE_LOCK
  );
}

/* ─── Interior lighting mood → description ──────────────────────────────── */
const INTERIOR_LIGHT_DESC: Record<string, string> = {
  "bright-natural":
    "bright cool daylight streaming through windows with sharp window-frame shadows on walls and floor, 6500K color temperature",
  "warm-ambient":
    "warm golden ambient light from lamps and recessed lighting at 2700K, soft shadows, cozy glow filling the room",
  "dramatic-spotlit":
    "dramatic directional spotlighting with high contrast deep shadows, theatrical pools of warm light on key surfaces",
  "soft-diffused":
    "soft even diffused light, 4000K neutral temperature, gentle shadow gradients, no harsh highlights",
};

/* ─── Interior prompt ───────────────────────────────────────────────────── */
function buildEditPrompt(q: DesignQuestionnaire): string {
  const matChanges: string[] = [];
  const customWall = q.customColors?.[`wallFinish:${q.wallFinish}`];
  const customFloor = q.customColors?.[`floorMaterial:${q.floorMaterial}`];
  const customWood = q.customColors?.[`woodTone:${q.woodTone}`];
  const customMetal = q.customColors?.[`metalAccent:${q.metalAccent}`];
  if (customWall) matChanges.push(`walls: custom hex color ${customWall}`);
  else if (WALL[q.wallFinish]) matChanges.push(`walls: ${WALL[q.wallFinish]}`);
  if (customFloor) matChanges.push(`floor: custom hex color ${customFloor}`);
  else if (FLOOR[q.floorMaterial])
    matChanges.push(`floor: ${FLOOR[q.floorMaterial]}`);
  if (PALETTE[q.colorPalette])
    matChanges.push(`color scheme: ${PALETTE[q.colorPalette]}`);
  if (q.accentColor)
    matChanges.push(
      `custom accent color ${q.accentColor} on key decorative surfaces`
    );
  if (customWood) matChanges.push(`wood: custom hex color ${customWood}`);
  else if (WOOD[q.woodTone]) matChanges.push(`wood: ${WOOD[q.woodTone]}`);
  if (customMetal) matChanges.push(`metal: custom hex color ${customMetal}`);
  else if (METAL[q.metalAccent])
    matChanges.push(`metal: ${METAL[q.metalAccent]}`);
  if (TEXTILE[q.textileRichness])
    matChanges.push(`textiles: ${TEXTILE[q.textileRichness]}`);
  if (MOOD[q.mood]) matChanges.push(MOOD[q.mood]);

  const lightDesc =
    INTERIOR_LIGHT_DESC[q.lightingMood] ?? INTERIOR_LIGHT_DESC["warm-ambient"];
  const style = `${ERA[q.era] ?? ""} ${q.primaryStyle} ${q.roomType}`.trim();

  const STRUCTURE_LOCK =
    `ABSOLUTE HARD RULE — THIS IS AN IMAGE EDITING TASK, NOT IMAGE GENERATION: ` +
    `You are given an input image of a ${style}. ` +
    `You MUST preserve with 100% fidelity: ` +
    `(1) exact camera angle and perspective, ` +
    `(2) exact positions of every piece of furniture — bed, nightstands, lamps, ottoman, rugs, art, every object, ` +
    `(3) exact room dimensions, ceiling height, wall layout, window positions, door positions, ` +
    `(4) exact number and type of every object in the scene — do NOT add, remove, or replace any item, ` +
    `(5) exact lighting fixture positions — pendant lamps, floor lamps, ceiling lights stay exactly where they are. ` +
    `The output MUST look like the same room in the input image. If the input has a bed against a wall, the output has a bed against that same wall. If the input has two pendant lamps, the output has exactly two pendant lamps in the same positions. NO EXCEPTIONS. `;

  return (
    STRUCTURE_LOCK +
    `NOW apply photorealistic rendering quality to that exact layout. ` +
    `Style: ${style}. V-Ray / Corona / Enscape quality. ` +
    `Apply ONLY these surface/finish changes (do not change what objects exist): ${matChanges.join("; ")}. ` +
    `LIGHTING: ${lightDesc}. ` +
    `Physically accurate GI — lamp light in a tight pool on adjacent surfaces, ` +
    `window light casting sharp shadow patterns. ` +
    `NO haze, fog, mist, dust particles, or atmospheric scatter. Crystal-clear air. ` +
    `Emissive glow tightly around bulbs only. ` +
    `MATERIALS — razor-sharp PBR on every surface: ` +
    `wood grain with pores and micro-scratches; fabric weave texture with natural fold wrinkles; ` +
    `cushions with realistic pile compression; walls with matte/eggshell micro-texture; ` +
    `stone/tile with veining and grout lines; metal with correct IOR and brushed scratch pattern; ` +
    `glass with crisp reflections and transparency. ` +
    `SHADOWS: crisp contact shadows under every furniture leg, deep AO in wall-ceiling junctions and under bed frames, ` +
    `self-shadow on every fabric fold. NO foggy shadow wash. ` +
    `PHOTOGRAPHIC REALISM: ISO 400 grain, lens vignette, chromatic aberration on high-contrast edges, ` +
    `warm 2700K lamp zones vs cool 6500K daylight zones. NO fog. NO haze. CRYSTAL CLEAR air. ` +
    `Real imperfections: floor wear, micro-scratches on surfaces, uneven pillow compression. ` +
    `Architectural Digest quality — sharp, clean, crisp. ` +
    `8K. Canon EOS R5, 24mm f/2.8, ISO 400, RAW. ` +
    STRUCTURE_LOCK
  );
}

/* ─── Route handler ──────────────────────────────────────────────────────── */
export async function POST(request: Request) {
  try {
    // ── Auth & subscription gate ────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    let email = session?.user?.email;

    if (!email) {
      const clientHeader = request.headers.get("x-client");
      if (
        clientHeader === "sketchup" ||
        process.env.NODE_ENV === "development"
      ) {
        email = "sketchup-plugin@local.app";
      } else {
        return NextResponse.json(
          { error: "Sign in required", code: "auth_required" },
          { status: 401 }
        );
      }
    }

    // Check Stripe subscription if configured
    let subscriptionActive = false;
    if (process.env.STRIPE_SECRET_KEY && stripe) {
      try {
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (customers.data.length > 0) {
          const subs = await stripe.subscriptions.list({
            customer: customers.data[0].id,
            status: "all",
            limit: 5,
          });
          const active = subs.data.find(
            (s) =>
              (s.status === "active" || s.status === "trialing") &&
              !s.cancel_at_period_end
          );
          subscriptionActive = !!active;
        }
      } catch (err) {
        console.warn("Stripe check skipped:", err);
      }
    }

    // Always enforce trial limit for non-subscribers
    if (!subscriptionActive) {
      const currentCount = await getGenerationCount(email);
      if (currentCount >= TRIAL_GENERATION_LIMIT) {
        return NextResponse.json(
          {
            error: `Free trial limit reached (${TRIAL_GENERATION_LIMIT} renders). Please subscribe to continue.`,
            code: "trial_exhausted",
          },
          { status: 403 }
        );
      }
    }
    // ── End gate ────────────────────────────────────────────────────────────

    const req = await request.json();
    const image: string = req.image;
    const questionnaire: DesignQuestionnaire = req.questionnaire;

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        {
          error:
            "REPLICATE_API_TOKEN is not configured. Please add it to your .env.local file.",
        },
        { status: 500 }
      );
    }

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    // Route to correct prompt builder based on user's spaceType selection
    const prompt =
      questionnaire.spaceType === "exterior"
        ? buildExteriorPrompt(questionnaire)
        : buildEditPrompt(questionnaire);

    console.log("Prompt:", prompt.slice(0, 300) + "...");

    const input = {
      prompt,
      image_input: [image],
      aspect_ratio: req.aspect_ratio || "match_input_image",
      output_format: "png",
    };

    // User model selection (defaults to fast/cheap model if requested)
    const userModel = req.model || "google/nano-banana-2";
    const MODELS: Array<{ id: string; e003Retries: number }> = [
      { id: userModel, e003Retries: 2 },
      { id: "google/nano-banana-2", e003Retries: 2 },
      { id: "black-forest-labs/flux-1-schnell", e003Retries: 0 },
      { id: "google/nano-banana", e003Retries: 0 },
    ];
    const MAX_429_RETRIES = 4;
    let output: unknown;

    for (const { id: model, e003Retries } of MODELS) {
      let modelSucceeded = false;
      let e003Attempt = 0;

      for (let attempt = 0; attempt <= MAX_429_RETRIES; attempt++) {
        try {
          console.log(`Trying ${model} (attempt ${attempt + 1})…`);
          output = await replicate.run(model as `${string}/${string}`, {
            input,
          });
          modelSucceeded = true;
          console.log(`✓ Used model: ${model}`);
          break;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const is429 =
            msg.includes("429") ||
            msg.toLowerCase().includes("throttled") ||
            msg.toLowerCase().includes("rate limit");
          const isUnavailable =
            msg.includes("E003") ||
            msg.toLowerCase().includes("unavailable") ||
            msg.toLowerCase().includes("high demand") ||
            msg.includes("503");

          if (is429 && attempt < MAX_429_RETRIES) {
            const delay = Math.pow(2, attempt + 1) * 1000;
            console.warn(`Rate-limited on ${model}. Retrying in ${delay}ms…`);
            await new Promise((res) => setTimeout(res, delay));
            continue;
          }

          if (isUnavailable) {
            if (e003Attempt < e003Retries) {
              e003Attempt++;
              const delay = e003Attempt * 5000; // 5s, 10s, 15s
              console.warn(
                `${model} returned E003 (attempt ${e003Attempt}/${e003Retries}). Retrying in ${delay}ms…`
              );
              await new Promise((res) => setTimeout(res, delay));
              attempt--; // don't consume a 429 retry slot
              continue;
            }
            console.warn(
              `${model} consistently unavailable after ${e003Retries} retries. Falling back…`
            );
            break; // try next model
          }

          throw err; // unrecoverable — bubble up
        }
      }
      if (modelSucceeded) break;
    }

    if (!output) {
      return NextResponse.json(
        { error: "No output from model" },
        { status: 500 }
      );
    }

    const url = Array.isArray(output)
      ? (output[output.length - 1] as { toString(): string }).toString()
      : (output as { toString(): string }).toString();

    // Increment usage count for the authenticated user
    if (session?.user?.email) {
      await incrementGenerationCount(session.user.email);
    }

    console.log("Output URL:", url);
    return NextResponse.json({ output: [url] }, { status: 201 });
  } catch (err) {
    console.error("Replicate API error:", err);
    const raw =
      err instanceof Error ? err.message : "An unexpected error occurred";
    const is429 =
      raw.includes("429") ||
      raw.toLowerCase().includes("throttled") ||
      raw.toLowerCase().includes("rate limit");
    const message = is429
      ? "Rate limit reached. Add $5+ credits at https://replicate.com/account/billing to remove this restriction."
      : raw;
    return NextResponse.json({ error: message }, { status: is429 ? 429 : 500 });
  }
}
