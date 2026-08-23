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
  const isExterior = q?.spaceType === "exterior";

  // If exterior space
  if (isExterior) {
    const facadeMat =
      q?.wallFinish && EXT_FACADE[q.wallFinish]
        ? EXT_FACADE[q.wallFinish]
        : "authentic architectural facade cladding";
    const groundMat =
      q?.floorMaterial && EXT_GROUND[q.floorMaterial]
        ? EXT_GROUND[q.floorMaterial]
        : "realistic stone paving and landscaping";
    const skyLighting =
      q?.naturalLight && LIGHT_TO_SKY[q.naturalLight]
        ? LIGHT_TO_SKY[q.naturalLight]
        : "natural daylight with soft architectural shadows";

    return (
      "Transform the provided SketchUp exterior into an extremely photorealistic, premium architectural photograph. " +
      "CRITICAL: Preserve the original building design exactly. Do not redesign, remodel, or reinterpret the building massing. " +
      "Maintain the exact architectural geometry, facade proportions, roof planes, window and door placements, overhangs, balconies, materials, ground landscape layout, camera perspective, and composition from the source image. " +
      "REALISM: Use physically believable materials with realistic roughness, reflections, micro-texture, subtle imperfections: " +
      `${facadeMat}, ${groundMat}, authentic timber accents, and architectural glass with realistic subtle outdoor reflections and transparency. ` +
      "LIGHTING: " +
      skyLighting +
      ", physically accurate global illumination, soft realistic contact shadows, and natural atmospheric depth. " +
      "CAMERA: Captured by a professional architectural photographer using a full-frame camera and 24–35mm architectural tilt-shift lens. Keep vertical architectural lines straight and realistic. " +
      "PHOTOGRAPHIC QUALITY: Genuine high-end architectural photograph, physically believable exposure, realistic dynamic range, subtle natural contrast, soft highlight rolloff, published in Architectural Record magazine. " +
      "AUTHENTICITY: Do not make it look like an AI-generated image or CGI render. Avoid plastic materials, glowing edges, fake bloom, or cinematic effects. Aim for quiet, breathtaking realism."
    );
  }

  // If user customized specific finishes
  const customFinishes: string[] = [];
  if (q?.wallFinish && WALL[q.wallFinish])
    customFinishes.push(`walls: ${WALL[q.wallFinish]}`);
  if (q?.floorMaterial && FLOOR[q.floorMaterial])
    customFinishes.push(`flooring: ${FLOOR[q.floorMaterial]}`);
  if (q?.woodTone && WOOD[q.woodTone])
    customFinishes.push(`cabinetry & woodwork: ${WOOD[q.woodTone]}`);
  if (q?.metalAccent && METAL[q.metalAccent])
    customFinishes.push(`metal hardware: ${METAL[q.metalAccent]}`);
  if (q?.colorPalette && PALETTE[q.colorPalette])
    customFinishes.push(`color scheme: ${PALETTE[q.colorPalette]}`);
  if (q?.accentColor) customFinishes.push(`accent tone: ${q.accentColor}`);
  if (q?.lightingMood && INTERIOR_LIGHT_DESC[q.lightingMood])
    customFinishes.push(`lighting: ${INTERIOR_LIGHT_DESC[q.lightingMood]}`);

  const customMaterialsNote =
    customFinishes.length > 0
      ? ` Apply these specific finishes: ${customFinishes.join(", ")}.`
      : " Keep the exact original color palette and material colors from the SketchUp image without randomly changing finishes.";

  return (
    "Transform the provided SketchUp interior into an extremely photorealistic, premium architectural photograph. " +
    "CRITICAL: Preserve the original design exactly. Do not redesign, remodel, rearrange, or reinterpret the space. " +
    "Maintain the exact architecture, room proportions, camera perspective, wall positions, ceiling geometry, cabinetry, furniture, openings, shelves, doors, windows, built-ins, material placement, colors, finishes, and overall composition from the source image. " +
    "The goal is to make the SketchUp scene look like it was actually photographed inside a beautifully designed real interior, not like a 3D render. " +
    "REALISM: Use physically believable materials with realistic roughness, reflections, micro-texture, subtle imperfections, edge variation, realistic wood grain, natural stone variation, believable glass, realistic metal response, fabric texture, ceramic and painted-surface response. " +
    "Materials should have different optical properties rather than looking uniformly glossy or perfectly smooth. Avoid exaggerated reflections, excessive gloss, plastic-looking surfaces, perfectly clean CGI materials, and artificial texture overlays. " +
    "Add extremely subtle real-world imperfections: tiny tonal variations, slight material irregularities, natural surface variation, realistic seams and joints, and believable construction details." +
    customMaterialsNote +
    " " +
    "LIGHTING: Create beautiful, physically realistic architectural lighting with soft natural daylight entering from existing openings, realistic ambient illumination, subtle indirect bounced light, physically accurate artificial lighting where existing fixtures are present, soft contact shadows, realistic light falloff, gentle occlusion in corners and joints. " +
    "The lighting should feel calm, sophisticated, warm and naturally exposed (2700K). Do NOT over-light the room. Do NOT make every surface equally bright. Allow realistic areas of shadow and controlled highlights. Preserve depth and contrast. Light should naturally bounce between walls, floors, ceilings and furniture. " +
    "Avoid glowing walls, excessive bloom, dramatic god rays, overexposed windows, crushed blacks, or artificial orange lighting. " +
    "CAMERA: Captured by a professional architectural photographer using a full-frame camera and high-quality 24–35mm architectural lens. Keep vertical architectural lines straight and realistic. Use subtle photographic depth and lens characteristics, but keep the entire interior predominantly sharp. No distortion. Camera height should feel like a real person standing naturally inside the room (1.4–1.6m). " +
    "PHOTOGRAPHIC QUALITY: Genuine high-end interior photograph: physically believable exposure, realistic dynamic range, subtle natural contrast, soft highlight rolloff, realistic shadow detail, restrained color grading, natural white balance, subtle lens characteristics, extremely fine material detail, realistic ambient occlusion, physically accurate reflections. Resemble a photograph from a premium architecture and interior-design magazine. " +
    "COMPOSITION: Keep the original camera composition and geometry. Do not add or remove furniture, plants, artwork, decorative objects, lights, windows, doors, or architectural elements. " +
    "AUTHENTICITY: Most importantly, do not make it look like an AI-generated image or a CGI render. Avoid perfect CGI surfaces, excessive sharpness, plastic materials, fake reflections, unrealistic shadows, floating objects, warped furniture, distorted geometry, glowing edges, excessive bloom, oversaturated colors, or artificial volumetric lighting. Aim for quiet realism rather than visual effects."
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
