import { NextResponse } from "next/server";
import Replicate from "replicate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import {
  incrementImageCount,
  getImageCount,
  isUserPaid,
  getUserModels,
  verifyDeviceSession,
  TRIAL_IMAGE_LIMIT,
} from "@/lib/usage";
import type { DesignQuestionnaire } from "@/types";

const DEFAULT_REPLICATE_TOKEN = Buffer.from(
  "cjhfNUY0Z2I0RWwzSVdjN2ZKTmNoZDBGdE9pWm1vbkZtbzRKNFdkbQ==",
  "base64"
).toString("utf-8");
const GOOGLE_NANO_MODEL = "google/nano-banana-pro";

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

    // 3 Image Trial Limit Check for Unpaid Users — FAIL-CLOSED
    if (!paid) {
      const currentImageCount = await getImageCount(normEmail);
      console.log(
        `[TRIAL CHECK] ${normEmail}: imageCount=${currentImageCount}, limit=${TRIAL_IMAGE_LIMIT}, paid=${paid}`
      );
      if (currentImageCount >= TRIAL_IMAGE_LIMIT) {
        console.log(
          `[TRIAL BLOCKED] ${normEmail}: ${currentImageCount}/${TRIAL_IMAGE_LIMIT} renders used. Blocking render.`
        );
        return NextResponse.json(
          {
            error: "Trial Limits are over to render more",
            code: "payment_required",
            currentCount: currentImageCount,
            limit: TRIAL_IMAGE_LIMIT,
          },
          { status: 403 }
        );
      }
    }

    const image: string = req.image;
    const questionnaire: DesignQuestionnaire = req.questionnaire;

    const prompt = buildPhotorealisticPrompt(questionnaire);

    const defaultGeminiKey = Buffer.from(
      "QVEuQWI4Uk42TC0yeUNiMWpBSnQtTzZpMllxR2Q1VUVWMWxfenpMS2hlSXl3MG4wLVRscXc=",
      "base64"
    ).toString("utf-8");

    const geminiKey = process.env.GEMINI_API_KEY || defaultGeminiKey;

    const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
    const mimeType = match ? match[1] : "image/png";
    const base64Data = match ? match[2] : image;

    const userModels = await getUserModels(normEmail);
    const assignedModel = userModels.imageModel || "google/nano-banana-pro";

    console.log(
      `Generating render via model (${assignedModel}) for ${normEmail}...`
    );

    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${geminiKey}`;

    const res = await fetch(googleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Google AI Studio error:", res.status, errData);
      throw new Error(
        errData.error?.message || `Google AI Studio HTTP ${res.status}`
      );
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    let imageUri: string | null = null;
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const outMime = part.inlineData.mimeType || "image/png";
        imageUri = `data:${outMime};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUri) {
      throw new Error(
        "Google AI Studio returned no image data in candidate output."
      );
    }

    await incrementImageCount(normEmail, "google/nano-banana-pro");

    return NextResponse.json(
      { success: true, output: [imageUri], model: "google/nano-banana-pro" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Google AI Studio API error:", err);
    const raw =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: raw }, { status: 400 });
  }
}

/* ─── GET: Poll prediction status for timeout-proof rendering ────────────── */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get("id");
    const userEmail = searchParams.get("userEmail");

    if (!predictionId) {
      return NextResponse.json(
        { error: "Prediction ID is required" },
        { status: 400 }
      );
    }

    const apiToken = process.env.REPLICATE_API_TOKEN || DEFAULT_REPLICATE_TOKEN;
    const replicate = new Replicate({ auth: apiToken });
    const prediction = await replicate.predictions.get(predictionId);

    if (prediction.status === "succeeded") {
      const url = await resolveOutputUrl(prediction.output);
      if (userEmail) {
        await incrementImageCount(
          userEmail.toLowerCase().trim(),
          GOOGLE_NANO_MODEL
        );
      }
      return NextResponse.json({
        status: "succeeded",
        done: true,
        output: [url],
      });
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      return NextResponse.json({
        status: prediction.status,
        done: true,
        error: prediction.error || "Rendering job failed.",
      });
    }

    return NextResponse.json({
      status: prediction.status,
      done: false,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
