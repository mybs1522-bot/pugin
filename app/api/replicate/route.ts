import { NextResponse } from "next/server";
import Replicate from "replicate";
import OpenAI, { toFile } from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import {
  incrementImageCount,
  getImageCount,
  isUserPaid,
  verifyDeviceSession,
  TRIAL_IMAGE_LIMIT,
} from "@/lib/usage";
import type { DesignQuestionnaire } from "@/types";

async function renderWithOpenAI(
  image: string,
  prompt: string,
  modelName: string = "gpt-image-2"
): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey)
    throw new Error("OPENAI_API_KEY is not configured on server.");
  const openai = new OpenAI({ apiKey: openaiKey });

  // Convert base64 data URI to buffer and uploadable File
  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const file = await toFile(buffer, "sketchup_view.png", { type: "image/png" });

  const targetModel = modelName.includes("1.5")
    ? "gpt-image-1.5"
    : modelName.includes("gpt-image-1") && !modelName.includes("1.5")
      ? "gpt-image-1"
      : "gpt-image-2";

  const modelsToTry = [
    targetModel,
    "gpt-image-2",
    "gpt-image-1.5",
    "gpt-image-1",
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastErr = "";
  for (const m of modelsToTry) {
    try {
      console.log(`Rendering with OpenAI model: ${m}...`);
      const response = await openai.images.edit({
        model: m,
        image: file,
        prompt: prompt,
      });

      const firstItem = response.data?.[0];
      if (firstItem?.b64_json) {
        return `data:image/png;base64,${firstItem.b64_json}`;
      }
      if (firstItem?.url) {
        return firstItem.url;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      lastErr = msg;
      console.warn(`OpenAI model ${m} failed, trying next...`, msg);
    }
  }

  throw new Error(lastErr || "OpenAI returned an empty image output.");
}

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
  white: "crisp matte white plaster wall finish",
  cream: "warm cream lime-washed wall finish",
  "light-gray": "soft light-gray micro-cement wall finish",
  beige: "warm sandy beige plaster wall finish",
  dark: "deep charcoal matte accent wall finish",
  textured: "tactile Venetian plaster wall finish",
  "wood-paneled": "fluted natural timber wood wall paneling",
};
const FLOOR: Record<string, string> = {
  "light-hardwood": "light blonde Scandinavian hardwood parquet flooring",
  "dark-hardwood":
    "rich dark walnut hardwood flooring with subtle satin reflection",
  marble:
    "polished Italian Calacatta marble slab flooring with soft contact reflections",
  concrete: "seamless polished architectural concrete flooring",
  carpet: "plush high-density wool loop carpet flooring",
  tile: "large format matte porcelain architectural floor tiles",
  herringbone: "classic French oak herringbone parquet flooring",
};
const WOOD: Record<string, string> = {
  "light-ash": "light ash Scandinavian timber cabinetry",
  "medium-oak": "warm natural European oak cabinetry and millwork",
  "dark-walnut": "rich American dark walnut cabinetry with natural wood grain",
  "painted-white": "satin white lacquered cabinetry",
  none: "",
};
const METAL: Record<string, string> = {
  "brushed-gold":
    "brushed warm brass gold metal hardware with subtle satin sheen",
  "polished-silver": "polished chrome architectural hardware",
  "matte-black": "matte black architectural metal accents and hardware",
  "aged-bronze": "patinated antique bronze metal hardware",
  none: "",
};

const EXT_FACADE: Record<string, string> = {
  white: "crisp white architectural plaster facade",
  cream: "warm cream stucco and travertine facade",
  "light-gray": "board-formed architectural concrete facade",
  beige: "natural Jura limestone cladding facade",
  dark: "charred Shou Sugi Ban timber and dark zinc facade",
  textured: "tactile textured sandstone cladding facade",
  "wood-paneled": "vertical natural cedar timber rainscreen facade",
};
const EXT_GROUND: Record<string, string> = {
  "light-hardwood": "light natural sandstone terrace paving",
  "dark-hardwood": "dark granite outdoor paving",
  marble: "honed marble terrace paving",
  concrete: "smooth architectural concrete terrace paving",
  carpet: "lush manicured landscape lawn",
  tile: "large format non-slip porcelain terrace tiles",
  herringbone: "herringbone clay brick terrace paving",
};

const LIGHT_TO_SKY: Record<string, string> = {
  minimal:
    "dramatic twilight blue-hour sky with warm interior window glow and architectural spotlighting",
  moderate:
    "soft diffused overcast daylight with subtle natural cloud gradient",
  abundant:
    "warm directional golden-hour sunlight with crisp architectural shadows",
};

const INTERIOR_LIGHT_DESC: Record<string, string> = {
  "bright-natural":
    "bright natural daylight streaming through windows with soft realistic window shadows",
  "warm-ambient":
    "warm 2700K ambient illumination from recessed ceiling downlights with natural IES light cone falloff and glowing pendant lights",
  "dramatic-spotlit":
    "dramatic architectural spotlighting with high-contrast soft shadows and focused accent lights",
  "soft-diffused":
    "soft even ambient daylight with gentle balanced interior fill lighting",
};

function buildPhotorealisticPrompt(q?: DesignQuestionnaire): string {
  // If user made NO selection or left default (Auto Realism Viewport Mode)
  if (!q || !q.primaryStyle || (q.primaryStyle as string) === "auto") {
    return (
      "Award-winning architectural photograph of this exact space, published in Architectural Digest. " +
      "Masterful Corona Renderer / V-Ray physical camera capture. " +
      "Maintain 100% exact 3D geometry, walls, window openings, doors, cabinetry, and furniture positions with complete precision. " +
      "Transform flat computer graphics into hyper-realistic physical materials: rich authentic wood grain textures with subtle specular sheen, " +
      "polished Italian marble / stone flooring with realistic soft contact reflections and grout seams, " +
      "matte emulsion wall paint with tactile micro-plaster texture, brushed brass and matte metal hardware. " +
      "Lighting: physically accurate global illumination, soft natural daylight streaming through windows, " +
      "warm 2700K recessed downlights with realistic IES light cone falloff, glowing designer pendant lamps, " +
      "deep ambient occlusion in corners, crisp contact shadows beneath all furniture, soft bloom on light sources. " +
      "Shot on Hasselblad H6D-100c, 24mm tilt-shift architectural lens, photorealistic 8K, crisp depth of field, RAW magazine quality."
    );
  }

  const isExterior = q.spaceType === "exterior";
  const styleStr =
    `${q.era ? `${ERA[q.era] ?? q.era} ` : ""}${q.primaryStyle || "Modern"} ${q.roomType || (isExterior ? "Architecture" : "Interior")}`.trim();

  const matDetails: string[] = [];
  if (q.wallFinish && (WALL[q.wallFinish] || EXT_FACADE[q.wallFinish])) {
    matDetails.push(
      isExterior ? EXT_FACADE[q.wallFinish] : `walls: ${WALL[q.wallFinish]}`
    );
  }
  if (
    q.floorMaterial &&
    (FLOOR[q.floorMaterial] || EXT_GROUND[q.floorMaterial])
  ) {
    matDetails.push(
      isExterior
        ? EXT_GROUND[q.floorMaterial]
        : `floors: ${FLOOR[q.floorMaterial]}`
    );
  }
  if (q.woodTone && WOOD[q.woodTone]) {
    matDetails.push(`cabinetry & woodwork: ${WOOD[q.woodTone]}`);
  }
  if (q.metalAccent && METAL[q.metalAccent]) {
    matDetails.push(`metal hardware: ${METAL[q.metalAccent]}`);
  }
  if (q.colorPalette && PALETTE[q.colorPalette]) {
    matDetails.push(`color scheme: ${PALETTE[q.colorPalette]}`);
  }
  if (q.accentColor) {
    matDetails.push(`custom accent tone: ${q.accentColor}`);
  }
  if (q.mood && MOOD[q.mood]) {
    matDetails.push(`mood: ${MOOD[q.mood]}`);
  }

  const lightingDesc = isExterior
    ? (LIGHT_TO_SKY[q.naturalLight] ??
      "golden hour natural daylight with soft shadows")
    : (INTERIOR_LIGHT_DESC[q.lightingMood] ??
      "warm 2700K ambient glow with realistic downlights and soft window daylight");

  return (
    `Award-winning architectural photograph of this ${styleStr}. ` +
    `Masterful V-Ray / Corona Renderer photorealism, published in Architectural Digest. ` +
    `Preserve with 100% precision the exact 3D geometry, walls, windows, doors, cabinetry, and furniture layout from the input view. ` +
    `Render with physical PBR materials: ${matDetails.length > 0 ? matDetails.join(", ") + ". " : "authentic luxury textures. "}` +
    `Lighting: ${lightingDesc}, physically accurate global illumination, contact shadows (ambient occlusion), natural specular highlights. ` +
    `Shot on Hasselblad H6D-100c, 24mm tilt-shift architectural lens, photorealistic 8K, RAW magazine quality.`
  );
}

function buildModelInput(
  modelId: string,
  prompt: string,
  image: string,
  aspect_ratio?: string
) {
  if (modelId.includes("pix2pix")) {
    return {
      image: image,
      prompt: prompt,
      image_guidance_scale: 1.5,
      text_guidance_scale: 7.5,
      num_inference_steps: 30,
    };
  }
  if (modelId.includes("sdxl") || modelId.includes("stability")) {
    return {
      image: image,
      prompt: prompt,
      prompt_strength: 0.5,
      num_inference_steps: 30,
    };
  }
  return {
    prompt,
    image_input: [image],
    aspect_ratio: aspect_ratio || "match_input_image",
    output_format: "png",
  };
}

export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function resolveOutputUrl(output: unknown): Promise<string> {
  if (!output) return "";
  let item = Array.isArray(output) ? output[output.length - 1] : output;
  if (!item) return "";

  if (typeof item === "string") return item;

  if (typeof item === "object") {
    if ("url" in item) {
      if (typeof (item as any).url === "function") {
        try {
          const u = (item as any).url();
          if (u) return typeof u === "string" ? u : u.href || String(u);
        } catch {}
      } else if (typeof (item as any).url === "string") {
        return (item as any).url;
      }
    }

    if (typeof (item as any).toString === "function") {
      const str = (item as any).toString();
      if (str && (str.startsWith("http://") || str.startsWith("https://"))) {
        return str;
      }
    }

    if ("getReader" in item) {
      try {
        const reader = (item as ReadableStream<Uint8Array>).getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }
        const buffer = Buffer.concat(chunks);
        return `data:image/png;base64,${buffer.toString("base64")}`;
      } catch (e) {
        console.warn("Error reading stream chunks for image:", e);
      }
    }
  }

  return String(item);
}

/* ─── Route handler ──────────────────────────────────────────────────────── */
export async function POST(request: Request) {
  try {
    const req = await request.json();
    const userEmailHeader = request.headers.get("x-user-email");
    const sessionIdHeader = request.headers.get("x-session-id");
    const userEmail = userEmailHeader || req.userEmail;
    const sessionId = sessionIdHeader || req.sessionId;

    if (!userEmail) {
      return NextResponse.json(
        {
          error:
            "Email verification required. Please verify your email in SketchUp.",
          code: "auth_required",
        },
        { status: 401 }
      );
    }

    const normEmail = userEmail.toLowerCase().trim();

    // Single PC Device Session Check
    if (sessionId) {
      const validSession = await verifyDeviceSession(normEmail, sessionId);
      if (!validSession) {
        return NextResponse.json(
          {
            error:
              "This email logged in on another computer. You have been logged out of this PC.",
            code: "session_invalid",
          },
          { status: 401 }
        );
      }
    }

    const paid = await isUserPaid(normEmail);

    // 3 Image Trial Limit Check for Unpaid Users
    if (!paid) {
      const currentImageCount = await getImageCount(normEmail);
      if (currentImageCount >= TRIAL_IMAGE_LIMIT) {
        return NextResponse.json(
          {
            error: `Free image trial limit reached (${TRIAL_IMAGE_LIMIT} image renders used). Contact admin to activate unlimited paid access for ${normEmail}.`,
            code: "payment_required",
          },
          { status: 403 }
        );
      }
    }

    const image: string = req.image;
    const questionnaire: DesignQuestionnaire = req.questionnaire;

    const prompt = buildPhotorealisticPrompt(questionnaire);

    const selectedModel = req.model || "openai/gpt-image-2";
    const isOpenAI =
      selectedModel.includes("openai") ||
      selectedModel.includes("gpt") ||
      Boolean(
        process.env.OPENAI_API_KEY &&
        !req.model?.includes("google") &&
        !req.model?.includes("banana")
      );

    if (isOpenAI && process.env.OPENAI_API_KEY) {
      console.log(
        `Generating render with OpenAI (model: ${selectedModel}) for ${normEmail}...`
      );
      try {
        const url = await renderWithOpenAI(image, prompt, selectedModel);
        await incrementImageCount(
          normEmail,
          selectedModel || "openai/gpt-image-2"
        );
        return NextResponse.json({ output: [url] }, { status: 200 });
      } catch (err) {
        console.error(
          "OpenAI rendering error, attempting Replicate fallback...",
          err
        );
      }
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        {
          error:
            "REPLICATE_API_TOKEN or OPENAI_API_KEY is missing on Vercel server. Please add them in Vercel Settings -> Environment Variables.",
        },
        { status: 400 }
      );
    }

    const replicate = new Replicate({ auth: apiToken });

    // Model Routing Strategy:
    // Trial Users -> ALWAYS Nano Banana Pro (google/nano-banana-pro)
    // Paid Users  -> SHIFT to Nano Banana 2 (google/nano-banana-2)
    const primaryModel = paid
      ? "google/nano-banana-2"
      : "google/nano-banana-pro";
    const secondaryModel = paid
      ? "google/nano-banana-pro"
      : "google/nano-banana-2";

    const MODELS: Array<{ id: string; e003Retries: number }> = [
      { id: primaryModel, e003Retries: 2 },
      { id: secondaryModel, e003Retries: 2 },
      {
        id: "timothybrooks/instruct-pix2pix:30c1d0b916a6f8ef208843f382a90098df241aa721f4864c0557457a4e69d7b4",
        e003Retries: 1,
      },
    ];

    const MAX_429_RETRIES = 3;
    let output: unknown;
    let lastError: string = "";

    let usedModel = primaryModel;

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
          console.log(
            `Trying ${model} (attempt ${attempt + 1}) for ${paid ? "paid" : "trial"} user…`
          );
          output = await replicate.run(model as `${string}/${string}`, {
            input: modelInput,
          });
          modelSucceeded = true;
          usedModel = model;
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

    const url = await resolveOutputUrl(output);

    await incrementImageCount(normEmail, usedModel);
    return NextResponse.json({ output: [url] }, { status: 200 });
  } catch (err) {
    console.error("Replicate API error:", err);
    const raw =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: raw }, { status: 400 });
  }
}
