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
  recordRenderLog,
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

const MASTER_PROMPT_INTERIOR = `### 1:1 PIXEL-LOCKED ARCHITECTURAL RENDER PASS — ZERO CAMERA OR GEOMETRIC CHANGE

You are performing a strict **1:1 pixel-accurate photorealistic render pass** on the provided SketchUp 3D viewport image.

### ABSOLUTE RULES — ZERO PIXEL, CAMERA, OR GEOMETRIC DISCREPANCY:
1. **ZERO CAMERA MOVEMENT / ZERO REPOSITIONING:** The camera position, viewing angle, height, pitch, tilt, focal length, zoom level, framing, and cropping MUST BE 100% IDENTICAL to the input viewport down to the single pixel. Do NOT zoom out, do NOT pull back, do NOT reposition the camera, do NOT change the perspective or field of view.
2. **ZERO GEOMETRY / OBJECT / FURNITURE CHANGES:** DO NOT move, resize, add, remove, or rearrange ANY architectural elements or objects. Every single wall, doorway, window, piece of furniture (bed, headboard, vanity table, mirror, armchair, desk, cabinetry, etc.) MUST remain in its exact spatial coordinate and 2D pixel position. Do NOT convert bedroom scenes into living rooms. Do NOT replace a bed or vanity with a sofa. Every object in the viewport MUST retain its exact identity, location, and form.
3. **SOLE TASK — PBR MATERIAL & LIGHTING UPGRADE:** Replace ONLY the computer-graphics flat colors, simplified shading, and CAD outlines with hyper-photorealistic real-world physical materials and realistic architectural lighting.

### REALISM & MATERIALS

Use physically believable materials with realistic:
* roughness
* reflections
* micro-texture
* subtle imperfections
* edge variation
* realistic wood grain
* natural stone variation
* believable glass
* realistic metal response
* fabric texture
* ceramic and painted-surface response

Materials should have **different optical properties** rather than looking uniformly glossy or perfectly smooth.
Avoid exaggerated reflections, excessive gloss, plastic-looking surfaces, perfectly clean CGI materials, and artificial texture overlays.
Add extremely subtle real-world imperfections: tiny tonal variations, slight material irregularities, natural surface variation, realistic seams and joints, and believable construction details. Keep these imperfections subtle and premium.

### LIGHTING

Create **beautiful, physically realistic architectural lighting**.
Use a combination of:
* soft natural daylight entering from existing openings
* realistic ambient illumination
* subtle indirect bounced light
* physically accurate artificial lighting where existing fixtures are present
* soft contact shadows
* realistic light falloff
* gentle occlusion in corners and joints

The lighting should feel **calm, sophisticated, warm and naturally exposed**, similar to high-end interior photography.
Do NOT over-light the room.
Do NOT make every surface equally bright.
Allow realistic areas of shadow and controlled highlights. Preserve depth and contrast.
Light should naturally bounce between walls, floors, ceilings and furniture.
Avoid the typical AI/CGI look of glowing walls, excessive bloom, dramatic god rays, overexposed windows, crushed blacks, or artificial orange lighting.

### CAMERA & PERSPECTIVE LOCK

* Render from the **EXACT SAME camera viewpoint, height, framing, and angle** as the input image.
* Zero camera relocation, zero angle drift, zero elevation changes.
* Keep the exact vertical architectural lines, field of view, and cropping of the original SketchUp screenshot.
* No distortion, no fisheye, no extra wide-angle expansion, no zooming out.

### PHOTOGRAPHIC QUALITY

Create the visual characteristics of a genuine high-end interior photograph:
* physically believable exposure
* realistic dynamic range
* subtle natural contrast
* soft highlight rolloff
* realistic shadow detail
* restrained color grading
* natural white balance
* subtle lens characteristics
* extremely fine material detail
* realistic ambient occlusion
* physically accurate reflections
* realistic glass transparency
* natural light scattering

The final image should resemble a photograph from a **premium architecture and interior-design magazine**, captured with professional photographic equipment.

### COLOR & PALETTE LOCK

* Keep the EXACT original color palette and material colors from the SketchUp image.
* Do not randomly change finishes or material tones.
* Do not introduce unnecessary colors.
* Maintain sophisticated, neutral, realistic tones with accurate white balance.
* Avoid excessive saturation, teal/orange cinematic grading, HDR halos, or artificial color effects.

### COMPOSITION & BOUNDARY LOCK

* The composition is 100% immutable.
* Do not add unnecessary furniture, plants, artwork, decorative objects, lights, windows, doors, architectural elements or accessories unless they already exist in the input image.
* Do not remove or alter any existing elements.
* The output must align perfectly on top of the input SketchUp viewport like an architectural render overlay.

### AUTHENTICITY

Most importantly, **do not make it look like an AI-generated image or a CGI render.**
Avoid: perfect CGI surfaces, excessive sharpness, plastic materials, fake reflections, unrealistic shadows, floating objects, warped furniture, distorted geometry, glowing edges, excessive ambient occlusion, overdone HDR, excessive bloom, fake depth of field, oversaturated colors, cinematic effects, artificial volumetric lighting, unrealistic cleanliness, duplicated textures, impossible reflections.

Aim for **quiet, breathtaking realism rather than visual effects**.

Ultra-photorealistic architectural photography, physically based rendering, natural global illumination, realistic material response, realistic indirect lighting, subtle imperfections, 100% accurate geometry, premium interior photography, high dynamic range without HDR appearance, realistic exposure, authentic photographic texture, extremely detailed but natural, sophisticated and believable.`;

function buildNanoBananaPhotorealisticPrompt(q?: DesignQuestionnaire): string {
  // If user did not make any custom selection in the 6 steps, use the Master Prompt directly
  if (!q || q.userCustomized !== true || q.primaryStyle === "auto") {
    return MASTER_PROMPT_INTERIOR;
  }

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
      "STRICT 1:1 PIXEL & GEOMETRIC ACCURACY ARCHITECTURAL RENDER: " +
      "You are performing a 1:1 pixel-accurate render pass on the provided SketchUp exterior model. " +
      "ZERO CAMERA MOVEMENT: The camera position, angle, perspective, zoom, and framing must be 100% IDENTICAL to the source image down to the pixel. Do not reposition or zoom out. " +
      "ZERO GEOMETRY CHANGES: Preserve 100% of the building structure, wall alignments, roof planes, window and door placements, overhangs, balconies, and landscaping exactly as drawn in the input viewport. " +
      "SOLE TASK: Replace flat computer graphics shading with physically accurate real-world materials: " +
      `${facadeMat}, ${groundMat}, authentic timber accents, and clean architectural glass with subtle reflections and transparency. ` +
      `LIGHTING: ${skyLighting}, physically accurate global illumination, soft contact shadows, and natural atmospheric depth. ` +
      "AUTHENTICITY: True high-end architectural photograph. The output geometry MUST match the input SketchUp viewport 100% identically with zero hallucinations."
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
    "STRICT 1:1 PIXEL & GEOMETRIC ACCURACY INTERIOR RENDER: " +
    "You are performing a 1:1 pixel-accurate render pass on the provided SketchUp interior viewport image. " +
    "ZERO CAMERA MOVEMENT: The camera position, viewpoint, angle, perspective, height, zoom, and framing must be 100% IDENTICAL to the source image down to the pixel. Do NOT pull back, do NOT zoom out, do NOT reposition the camera. " +
    "ZERO GEOMETRIC MODIFICATION: Maintain 100% of the exact room architecture, proportions, wall positions, ceiling geometry, cabinetry, furniture, openings, doors, windows, and objects exactly as positioned in the source image. " +
    "SOLE TASK: Replace flat computer graphics shading with physically believable materials: micro-textures, realistic wood grain, natural stone veining, fabric weave, realistic metal response, and subtle real-world imperfections." +
    customMaterialsNote +
    " LIGHTING: Physically accurate warm architectural illumination (2700K), soft natural daylight from existing openings, subtle indirect bounced light, realistic contact shadows, and ambient occlusion in corners. " +
    "AUTHENTICITY: Genuine high-end interior photography. The final render MUST match the input SketchUp viewport layout, camera angle, and geometry 100% identically with zero hallucinations."
  );
}

const MASTER_PROMPT_FLUX_INTERIOR = `### 1:1 PIXEL-LOCKED ARCHITECTURAL RENDER PASS — ZERO CAMERA OR GEOMETRY CHANGE

You are performing a strict 1:1 pixel-accurate photorealistic render pass on the provided SketchUp 3D viewport.

### CRITICAL RULES — ZERO PIXEL, CAMERA, OR GEOMETRIC DISCREPANCY:
1. ZERO CAMERA MOVEMENT: The camera position, viewing angle, height, pitch, tilt, focal length, zoom level, framing, and cropping MUST be 100% IDENTICAL to the input viewport down to the single pixel. Do NOT zoom out, do NOT pull back, do NOT reposition the camera, do NOT change the perspective or field of view.
2. ZERO GEOMETRY OR OBJECT CHANGES: DO NOT move, resize, add, remove, or rearrange ANY architectural elements or objects. Every single wall, doorway, window, staircase, dining table, chair, light fixture, rug, plant, painting, and decorative item MUST remain in its exact spatial coordinate and 2D pixel position.
3. SOLE TASK — PBR MATERIAL & LIGHTING UPGRADE: Replace ONLY flat computer-graphics colors, simplified shading, and CAD outlines with hyper-photorealistic real-world physical materials and realistic architectural lighting.

### REALISM & MATERIALS
Use physically believable materials with realistic roughness, reflections, micro-textures, subtle imperfections, edge variations, authentic wood grain on woodwork/doors, natural stone veining, clear architectural glass, realistic metal response, and natural fabric weaves. Materials must exhibit distinct optical properties rather than looking uniformly glossy or CGI smooth.

### LIGHTING
Create beautiful, physically realistic architectural lighting: soft natural daylight from existing openings, warm 2700K ambient illumination, subtle indirect bounced light, realistic contact shadows, natural light falloff, and gentle ambient occlusion in corners. Avoid glowing walls, excessive bloom, artificial god rays, or oversaturated orange lighting.

### CAMERA & BOUNDARY LOCK
Render from the EXACT SAME camera viewpoint, height, framing, and angle as the input image. Keep vertical architectural lines straight and true to the original SketchUp screenshot. The output geometry must align 100% on top of the input SketchUp viewport like an architectural render overlay.

### AUTHENTICITY & COLOR
Keep the EXACT original color palette and material tones from the SketchUp image. Do not introduce unwanted colors. Avoid plastic materials, glowing edges, warped furniture, distorted geometry, or artificial CGI effects. Aim for quiet, breathtaking realism.

Ultra-photorealistic architectural interior photograph, physically based rendering, natural global illumination, authentic material response, subtle imperfections, 100% accurate geometry, published in Architectural Digest, high dynamic range without HDR appearance, realistic exposure, sophisticated and believable.`;

function buildFluxPhotorealisticPrompt(q?: DesignQuestionnaire): string {
  // If user did not make any custom selection in the 6 steps, bypass and use the Master Prompt directly
  if (!q || q.userCustomized !== true || q.primaryStyle === "auto") {
    return MASTER_PROMPT_FLUX_INTERIOR;
  }

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
      "STRICT 1:1 PIXEL & GEOMETRIC ACCURACY ARCHITECTURAL RENDER: " +
      "You are given an exact 3D SketchUp building model viewport. DO NOT CHANGE, REDESIGN, MOVE, OR REINTERPRET ANY GEOMETRY, MASSING, OR COMPOSITION. " +
      "Preserve 100% of the building structure, wall alignments, roof planes, window and door placements, overhangs, balconies, and camera perspective exactly as drawn in the input viewport. " +
      "YOUR SOLE TASK IS PBR PHOTOREALISTIC MATERIAL & LIGHTING UPGRADE: Replace flat computer graphics shading with physically accurate real-world materials: " +
      `${facadeMat}, ${groundMat}, authentic timber accents, and clean architectural glass with subtle reflections and transparency. ` +
      `LIGHTING: ${skyLighting}, physically accurate global illumination, soft contact shadows, and natural atmospheric depth. ` +
      "CAMERA & QUALITY: Render from the exact same camera angle. Straight verticals, crisp details, natural dynamic range, soft highlight rolloff, published in Architectural Digest. " +
      "AUTHENTICITY: True high-end architectural photograph. The output geometry MUST match the input SketchUp viewport 100% identically with zero hallucinations."
    );
  }

  // If interior space
  const customFinishes: string[] = [];
  if (q?.wallFinish && WALL[q.wallFinish])
    customFinishes.push(`walls: ${WALL[q.wallFinish]}`);
  if (q?.floorMaterial && FLOOR[q.floorMaterial])
    customFinishes.push(`flooring: ${FLOOR[q.floorMaterial]}`);
  if (q?.woodTone && WOOD[q.woodTone])
    customFinishes.push(`cabinetry & woodwork: ${WOOD[q.woodTone]}`);
  if (q?.metalAccent && METAL[q.metalAccent])
    customFinishes.push(`hardware: ${METAL[q.metalAccent]}`);
  if (q?.colorPalette && PALETTE[q.colorPalette])
    customFinishes.push(`palette: ${PALETTE[q.colorPalette]}`);
  if (q?.accentColor) customFinishes.push(`accent: ${q.accentColor}`);
  if (q?.lightingMood && INTERIOR_LIGHT_DESC[q.lightingMood])
    customFinishes.push(`lighting: ${INTERIOR_LIGHT_DESC[q.lightingMood]}`);

  const customMaterialsNote =
    customFinishes.length > 0
      ? ` Apply these exact finishes: ${customFinishes.join(", ")}.`
      : " Preserve the exact color palette and material colors from the SketchUp model.";

  return (
    "STRICT 1:1 PIXEL & GEOMETRIC ACCURACY INTERIOR RENDER: " +
    "You are given an exact 3D SketchUp interior viewport image. DO NOT CHANGE, REDESIGN, REARRANGE, OR MOVE ANY GEOMETRY OR OBJECTS. " +
    "Maintain 100% of the exact room architecture, proportions, camera viewpoint, perspective, wall positions, ceiling geometry, cabinetry lines, furniture shapes and placements, openings, doors, and windows exactly as drawn in the input viewport. " +
    "YOUR SOLE TASK IS PBR PHOTOREALISTIC MATERIAL & LIGHTING UPGRADE: Replace flat computer graphics shading with physically believable materials: micro-textures, realistic wood grain, natural stone veining, fabric weave, realistic metal response, and subtle real-world imperfections." +
    customMaterialsNote +
    " LIGHTING: Physically accurate warm architectural illumination (2700K), soft natural daylight from existing openings, subtle indirect bounced light, realistic contact shadows, and ambient occlusion in corners. " +
    "CAMERA & QUALITY: Render from the exact same camera angle. Perfectly straight verticals, sharp details, balanced exposure, natural dynamic range, featured in Elle Decor. " +
    "AUTHENTICITY: Genuine high-end interior photography. The final render MUST match the input SketchUp viewport layout and geometry 100% identically with zero hallucinations."
  );
}

function buildModelInput(
  modelId: string,
  prompt: string,
  image: string,
  aspect_ratio?: string
) {
  // Replicate character length safety clamp (<= 3800 chars)
  const safePrompt = prompt.length > 3800 ? prompt.slice(0, 3800) : prompt;

  if (
    modelId.includes("flux-2") ||
    modelId === "black-forest-labs/flux-2-pro"
  ) {
    return {
      prompt: safePrompt,
      input_images: [image],
      aspect_ratio: aspect_ratio || "match_input_image",
      output_format: "png",
    };
  }
  if (modelId.includes("flux-depth")) {
    return {
      prompt: safePrompt,
      control_image: image,
      output_format: "png",
    };
  }
  if (modelId.includes("pix2pix")) {
    return {
      image: image,
      prompt: safePrompt,
      image_guidance_scale: 1.5,
      text_guidance_scale: 7.5,
      num_inference_steps: 30,
    };
  }
  if (modelId.includes("sdxl") || modelId.includes("stability")) {
    return {
      image: image,
      prompt: safePrompt,
      prompt_strength: 0.5,
      num_inference_steps: 30,
    };
  }
  return {
    prompt: safePrompt,
    input_images: [image],
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

    const userModels = await getUserModels(normEmail);
    const assignedModel =
      userModels.imageModel || req.model || "google/nano-banana-pro";

    const isGoogle =
      assignedModel.startsWith("google/") ||
      assignedModel.includes("nano-banana") ||
      assignedModel.includes("gemini");

    const editPrompt: string = req.editPrompt || req.customPrompt || "";
    let basePrompt = isGoogle
      ? buildNanoBananaPhotorealisticPrompt(questionnaire)
      : buildFluxPhotorealisticPrompt(questionnaire);

    let prompt = basePrompt;
    if (editPrompt && editPrompt.trim()) {
      prompt = `### CRITICAL USER EDIT / REFINEMENT INSTRUCTION:
Apply this specific user edit modification: "${editPrompt.trim()}".
Seamlessly apply these exact color/material/lighting adjustments to the target objects while preserving 100% of the camera angle, perspective, and architectural geometry.

${basePrompt}`;
    }

    const defaultGeminiKey = Buffer.from(
      "QVEuQWI4Uk42TC0yeUNiMWpBSnQtTzZpMllxR2Q1VUVWMWxfenpMS2hlSXl3MG4wLVRscXc=",
      "base64"
    ).toString("utf-8");

    const geminiKey = process.env.GEMINI_API_KEY || defaultGeminiKey;

    const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
    const mimeType = match ? match[1] : "image/png";
    const base64Data = match ? match[2] : image;

    console.log(
      `Generating render for ${normEmail} using assigned model: ${assignedModel}...`
    );

    const startTime = Date.now();

    // Case 1: Google Gemini AI Studio Native Models (Nano Banana Pro / Gemini 3 Image)
    if (
      assignedModel.startsWith("google/") ||
      assignedModel.includes("nano-banana") ||
      assignedModel.includes("gemini")
    ) {
      const candidateModels = [
        assignedModel === "google/nano-banana-2"
          ? "gemini-3-pro-image-preview"
          : "nano-banana-pro-preview",
        "gemini-3.1-flash-image-preview",
        "gemini-3-pro-image-preview",
      ];

      let imageUri: string | null = null;
      let usedModel = candidateModels[0];
      let lastError: string | null = null;

      for (const googleModel of candidateModels) {
        try {
          console.log(`Attempting render with Google model: ${googleModel}...`);
          const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:generateContent?key=${geminiKey}`;

          const res = await fetch(googleUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: base64Data,
                      },
                    },
                    { text: prompt },
                  ],
                },
              ],
            }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg =
              errData.error?.message || `Google AI Studio HTTP ${res.status}`;
            console.warn(`Model ${googleModel} returned error: ${errMsg}`);
            lastError = errMsg;
            // If experiencing high demand (503/429), smoothly cascade to the next available model
            if (
              res.status === 503 ||
              res.status === 429 ||
              errMsg.includes("demand") ||
              errMsg.includes("quota")
            ) {
              continue;
            }
            throw new Error(errMsg);
          }

          const data = await res.json();
          const candidate = data.candidates?.[0];
          const parts = candidate?.content?.parts || [];

          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              const outMime = part.inlineData.mimeType || "image/jpeg";
              imageUri = `data:${outMime};base64,${part.inlineData.data}`;
              usedModel = googleModel;
              break;
            }
          }

          if (imageUri) {
            console.log(`Render succeeded using Google model: ${googleModel}`);
            break;
          }
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          console.warn(
            `Error on ${googleModel}, attempting fallback...`,
            lastError
          );
        }
      }

      const durationSeconds =
        Math.round(((Date.now() - startTime) / 1000) * 10) / 10;

      if (!imageUri) {
        await recordRenderLog({
          email: normEmail,
          type: "image",
          requestedModel: assignedModel,
          executedModel: "failed",
          provider: "Google AI Studio",
          status: "failed",
          durationSeconds,
          prompt,
          error: lastError || "Google AI Studio returned no image output.",
        });

        throw new Error(
          lastError || "Google AI Studio returned no image output."
        );
      }

      const isCascade = usedModel !== candidateModels[0];

      await recordRenderLog({
        email: normEmail,
        type: "image",
        requestedModel: assignedModel,
        executedModel: usedModel,
        provider: "Google AI Studio",
        status: isCascade ? "fallback_cascade" : "success",
        durationSeconds,
        prompt,
        details: isCascade
          ? `Primary model (${candidateModels[0]}) was overloaded (503); successfully cascaded to ${usedModel}`
          : `Direct execution via Google AI Studio (${usedModel})`,
        outputPreview: imageUri ? imageUri.substring(0, 100) : undefined,
      });

      const newTotal = await incrementImageCount(normEmail, assignedModel);

      return NextResponse.json({
        success: true,
        output: [imageUri],
        model: usedModel,
        count: newTotal,
      });
    }

    // Case 2: Replicate Models (FLUX 2 Pro, FLUX Depth Pro, SDXL ControlNet, etc.)
    let replicateModel = assignedModel;
    if (
      assignedModel === "flux-2-pro" ||
      assignedModel === "black-forest-labs/flux-2-pro"
    ) {
      replicateModel = "black-forest-labs/flux-2-pro";
    } else if (assignedModel === "flux-depth-pro") {
      replicateModel = "black-forest-labs/flux-depth-pro";
    } else if (assignedModel === "sdxl-controlnet") {
      replicateModel = "lucataco/sdxl-controlnet";
    }

    const apiToken = process.env.REPLICATE_API_TOKEN || DEFAULT_REPLICATE_TOKEN;
    const replicate = new Replicate({ auth: apiToken });

    const prediction = await replicate.predictions.create({
      model: replicateModel,
      input: buildModelInput(replicateModel, prompt, image),
    });

    const durationSeconds =
      Math.round(((Date.now() - startTime) / 1000) * 10) / 10;

    await recordRenderLog({
      email: normEmail,
      type: "image",
      requestedModel: assignedModel,
      executedModel: replicateModel,
      provider: "Replicate",
      status: "success",
      durationSeconds,
      prompt,
      details: `Initialized async Replicate prediction: ${prediction.id}`,
    });

    return NextResponse.json({
      success: true,
      predictionId: prediction.id,
      model: assignedModel,
    });
  } catch (err) {
    console.error("Render API error:", err);
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
      let newCount: number | undefined;
      if (userEmail) {
        newCount = await incrementImageCount(
          userEmail.toLowerCase().trim(),
          prediction.model || "black-forest-labs/flux-2-pro"
        );
      }
      return NextResponse.json({
        status: "succeeded",
        done: true,
        output: [url],
        count: newCount,
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
