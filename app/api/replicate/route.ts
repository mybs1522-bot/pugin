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
  prompt: string
): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey)
    throw new Error("OPENAI_API_KEY is not configured on server.");
  const openai = new OpenAI({ apiKey: openaiKey });

  // Convert base64 data URI to buffer and uploadable File
  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const file = await toFile(buffer, "sketchup_view.png", { type: "image/png" });

  const response = await openai.images.edit({
    model: "gpt-image-1",
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
  throw new Error("OpenAI returned an empty image output.");
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
    "dramatic twilight dusk sky with deep blue-purple gradient, city glow on horizon",
  moderate:
    "overcast soft cloudy sky, diffused daylight, subtle blue-grey clouds",
  abundant:
    "vivid golden hour sky with warm orange and pink clouds, long directional sunlight",
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
    ? `custom accent color ${q.accentColor}`
    : "";
  const skyDesc = LIGHT_TO_SKY[q.naturalLight] ?? LIGHT_TO_SKY["abundant"];
  const style = `${ERA[q.era] ?? ""} ${q.primaryStyle} ${q.roomType}`.trim();

  const EXT_STRUCTURE_LOCK =
    `ABSOLUTE HARD RULE — THIS IS AN IMAGE EDITING TASK: ` +
    `You are given an input image of a ${style} building. ` +
    `You MUST preserve with 100% fidelity: ` +
    `(1) exact camera angle, perspective, and distance, ` +
    `(2) exact building massing — every wall, roof plane, overhang stays identical, ` +
    `(3) exact window positions, sizes, and shapes. `;

  return (
    EXT_STRUCTURE_LOCK +
    `NOW apply photorealistic rendering quality to that exact building. ` +
    `${palette ? `Color scheme: ${palette}. ` : ""}` +
    `${accentColorStr ? `Accent: ${accentColorStr}. ` : ""}` +
    `Surface changes: ${matChanges.join(", ")}. Sky: ${skyDesc}. ` +
    `8K RAW architectural photograph. `
  );
}

const INTERIOR_LIGHT_DESC: Record<string, string> = {
  "bright-natural":
    "bright cool daylight streaming through windows with sharp window shadows",
  "warm-ambient":
    "warm golden ambient light from lamps and recessed lighting at 2700K",
  "dramatic-spotlit":
    "dramatic directional spotlighting with high contrast deep shadows",
  "soft-diffused": "soft even diffused light, neutral temperature",
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
    `ABSOLUTE HARD RULE — THIS IS AN IMAGE EDITING TASK: ` +
    `You are given an input image of a ${style}. ` +
    `You MUST preserve with 100% fidelity: ` +
    `(1) exact camera angle and perspective, ` +
    `(2) exact positions of every piece of furniture, ` +
    `(3) exact room dimensions, wall layout, window positions. `;

  return (
    STRUCTURE_LOCK +
    `NOW apply photorealistic rendering quality to that exact layout. ` +
    `Style: ${style}. V-Ray / Corona / Enscape render quality. ` +
    `Apply ONLY these surface changes: ${matChanges.join("; ")}. ` +
    `LIGHTING: ${lightDesc}. ` +
    `8K photographic realism, RAW architectural photography.`
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

    const selectedModel = req.model || "";
    const isOpenAI =
      selectedModel.includes("openai") || selectedModel.includes("gpt");

    if (isOpenAI) {
      console.log(
        `Generating render with OpenAI gpt-image-1 for ${normEmail}...`
      );
      try {
        const url = await renderWithOpenAI(image, prompt);
        await incrementImageCount(normEmail, "openai/gpt-image-1");
        return NextResponse.json({ output: [url] }, { status: 200 });
      } catch (err) {
        console.error(
          "OpenAI rendering error, attempting Replicate fallback...",
          err
        );
      }
    }

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
