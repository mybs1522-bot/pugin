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
    `(2) exact building massing — every wall, roof plane, overhang, balcony stays identical, ` +
    `(3) exact window positions, sizes, and shapes — do NOT move or resize windows, ` +
    `(4) exact door positions and sizes, ` +
    `(5) exact number of floors and storey heights. `;

  return (
    EXT_STRUCTURE_LOCK +
    `NOW apply photorealistic rendering quality to that exact building layout. ` +
    `${palette ? `Color scheme: ${palette}. ` : ""}` +
    `${accentColorStr ? `Accent: ${accentColorStr}. ` : ""}` +
    `Surface changes: ${matChanges.join(", ")}. Sky: ${skyDesc}. ` +
    `GLASS: Realistic window glass with amber interior glow. ` +
    `MATERIALS: PBR textures — concrete aggregate grain, stone veining, timber wood grain. ` +
    `PHOTOGRAPHIC REALISM: Architectural Digest quality. 8K, RAW. ` +
    EXT_STRUCTURE_LOCK
  );
}

const INTERIOR_LIGHT_DESC: Record<string, string> = {
  "bright-natural":
    "bright cool daylight streaming through windows with sharp window shadows",
  "warm-ambient":
    "warm golden ambient light from lamps and recessed lighting at 2700K",
  "dramatic-spotlit":
    "dramatic directional spotlighting with high contrast deep shadows",
  "soft-diffused":
    "soft even diffused light, neutral temperature, no harsh highlights",
};

function buildEditPrompt(q: DesignQuestionnaire): string {
  const matChanges: string[] = [];
  if (WALL[q.wallFinish]) matChanges.push(`walls: ${WALL[q.wallFinish]}`);
  if (FLOOR[q.floorMaterial])
    matChanges.push(`floor: ${FLOOR[q.floorMaterial]}`);
  if (PALETTE[q.colorPalette])
    matChanges.push(`color scheme: ${PALETTE[q.colorPalette]}`);
  if (q.accentColor) matChanges.push(`custom accent color ${q.accentColor}`);
  if (WOOD[q.woodTone]) matChanges.push(`wood: ${WOOD[q.woodTone]}`);
  if (METAL[q.metalAccent]) matChanges.push(`metal: ${METAL[q.metalAccent]}`);
  if (MOOD[q.mood]) matChanges.push(MOOD[q.mood]);

  const lightDesc =
    INTERIOR_LIGHT_DESC[q.lightingMood] ?? INTERIOR_LIGHT_DESC["warm-ambient"];
  const style = `${ERA[q.era] ?? ""} ${q.primaryStyle} ${q.roomType}`.trim();

  const STRUCTURE_LOCK =
    `ABSOLUTE HARD RULE — THIS IS AN IMAGE EDITING TASK, NOT IMAGE GENERATION: ` +
    `You are given an input image of a ${style}. ` +
    `You MUST preserve with 100% fidelity: ` +
    `(1) exact camera angle and perspective, ` +
    `(2) exact positions of every piece of furniture — bed, lamps, rugs, art, ` +
    `(3) exact room dimensions, ceiling height, wall layout, window positions. `;

  return (
    STRUCTURE_LOCK +
    `NOW apply photorealistic rendering quality to that exact layout. ` +
    `Style: ${style}. V-Ray / Corona / Enscape quality. ` +
    `Apply ONLY these surface changes: ${matChanges.join("; ")}. ` +
    `LIGHTING: ${lightDesc}. ` +
    `MATERIALS: razor-sharp PBR textures on every surface. ` +
    `8K photographic realism, RAW. ` +
    STRUCTURE_LOCK
  );
}

function buildModelInput(
  modelId: string,
  prompt: string,
  image: string,
  aspect_ratio?: string
) {
  if (modelId.includes("flux")) {
    return {
      prompt,
      image,
      aspect_ratio:
        aspect_ratio === "match_input_image" ? "16:9" : aspect_ratio || "16:9",
      output_format: "png",
    };
  }
  return {
    prompt,
    image_input: [image],
    aspect_ratio: aspect_ratio || "match_input_image",
    output_format: "png",
  };
}

/* ─── Route handler ──────────────────────────────────────────────────────── */
export async function POST(request: Request) {
  try {
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

    const req = await request.json();
    const image: string = req.image;
    const questionnaire: DesignQuestionnaire = req.questionnaire;

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        {
          error:
            "REPLICATE_API_TOKEN is missing on Vercel server. Go to Vercel Settings -> Environment Variables, add REPLICATE_API_TOKEN, then Redeploy.",
        },
        { status: 400 }
      );
    }

    const replicate = new Replicate({ auth: apiToken });

    const prompt =
      questionnaire?.spaceType === "exterior"
        ? buildExteriorPrompt(questionnaire)
        : buildEditPrompt(questionnaire ?? {});

    const userModel = req.model || "google/nano-banana-2";
    const MODELS: Array<{ id: string; e003Retries: number }> = [
      { id: userModel, e003Retries: 2 },
      { id: "google/nano-banana-2", e003Retries: 2 },
      { id: "black-forest-labs/flux-1-schnell", e003Retries: 0 },
      { id: "google/nano-banana", e003Retries: 0 },
    ];

    const MAX_429_RETRIES = 3;
    let output: unknown;
    let lastError: string = "";

    for (const { id: model, e003Retries } of MODELS) {
      let modelSucceeded = false;
      let e003Attempt = 0;
      const modelInput = buildModelInput(
        model,
        prompt,
        image,
        req.aspect_ratio
      );

      for (let attempt = 0; attempt <= MAX_429_RETRIES; attempt++) {
        try {
          console.log(`Trying ${model} (attempt ${attempt + 1})…`);
          output = await replicate.run(model as `${string}/${string}`, {
            input: modelInput,
          });
          modelSucceeded = true;
          console.log(`✓ Used model: ${model}`);
          break;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          lastError = msg;
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

          if (isUnavailable && e003Attempt < e003Retries) {
            e003Attempt++;
            const delay = e003Attempt * 3000;
            await new Promise((res) => setTimeout(res, delay));
            attempt--;
            continue;
          }

          console.warn(`Model ${model} failed: ${msg}. Trying fallback…`);
          break;
        }
      }
      if (modelSucceeded) break;
    }

    if (!output) {
      return NextResponse.json(
        { error: lastError || "No output from AI models." },
        { status: 400 }
      );
    }

    const url = Array.isArray(output)
      ? (output[output.length - 1] as { toString(): string }).toString()
      : (output as { toString(): string }).toString();

    if (session?.user?.email) {
      await incrementGenerationCount(session.user.email);
    }

    return NextResponse.json({ output: [url] }, { status: 200 });
  } catch (err) {
    console.error("Replicate API error:", err);
    const raw =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: raw }, { status: 400 });
  }
}
