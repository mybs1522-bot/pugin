import { NextResponse } from "next/server";
import Replicate from "replicate";
import {
  isUserPaid,
  getVideoCount,
  incrementVideoCount,
  getUserModels,
  verifyDeviceSession,
  TRIAL_VIDEO_LIMIT,
} from "@/lib/usage";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function resolvePredictionOutput(output: unknown): string {
  if (!output) return "";
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length > 0) {
    const last = output[output.length - 1];
    if (typeof last === "string") return last;
    if (last && typeof last === "object" && "url" in last) {
      if (typeof (last as any).url === "function") {
        try {
          const u = (last as any).url();
          return u?.href || String(u);
        } catch {}
      }
      return String((last as any).url);
    }
  }
  if (typeof output === "object" && output !== null && "url" in output) {
    if (typeof (output as any).url === "function") {
      try {
        const u = (output as any).url();
        return u?.href || String(u);
      } catch {}
    }
    return String((output as any).url);
  }
  return String(output);
}

// GET: Poll prediction status by ID (immune to timeouts, takes < 200ms)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get("id");
    const userEmail = searchParams.get("userEmail");

    if (!predictionId) {
      return NextResponse.json(
        { error: "Prediction ID is required." },
        { status: 400 }
      );
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is missing on server." },
        { status: 500 }
      );
    }

    const replicate = new Replicate({ auth: apiToken });
    const prediction = await replicate.predictions.get(predictionId);

    if (prediction.status === "succeeded") {
      const videoUrl = resolvePredictionOutput(prediction.output);
      if (userEmail) {
        try {
          await incrementVideoCount(userEmail.toLowerCase().trim());
        } catch (e) {
          console.warn("Could not increment video count:", e);
        }
      }
      return NextResponse.json({
        status: "succeeded",
        videoUrl,
        done: true,
      });
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      return NextResponse.json({
        status: prediction.status,
        error: prediction.error || "Video generation failed or was canceled.",
        done: true,
      });
    }

    // In progress: "starting" or "processing"
    return NextResponse.json({
      status: prediction.status,
      done: false,
    });
  } catch (err) {
    console.error("Error polling video prediction:", err);
    const message =
      err instanceof Error ? err.message : "Failed to poll video status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Start video prediction job (returns in < 2s with predictionId)
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

    // 1 Video Walkthrough Trial Limit Check for Unpaid Users
    if (!paid) {
      const currentVideoCount = await getVideoCount(normEmail);
      if (currentVideoCount >= TRIAL_VIDEO_LIMIT) {
        return NextResponse.json(
          {
            error: `Free video trial limit reached (${TRIAL_VIDEO_LIMIT} video walkthrough used). Contact admin to activate unlimited paid access for ${normEmail}.`,
            code: "payment_required",
          },
          { status: 403 }
        );
      }
    }

    const imageUrl: string = req.image;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL or Base64 is required for video generation." },
        { status: 400 }
      );
    }

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
      req.prompt ||
      "Smooth cinematic 3D architectural camera pan walkthrough of interior space, steady camera movement, photorealistic lighting, high resolution";

    console.log("Starting asynchronous 3D Walkthrough Video prediction...");

    let prediction: any = null;
    let lastError = "";

    // Strategy 1: Kling AI 1.6 Standard (720p @ 30 FPS)
    try {
      prediction = await replicate.predictions.create({
        model: "kwaivgi/kling-v1.6-standard",
        input: {
          start_image: imageUrl,
          prompt: prompt,
          duration: 5,
          cfg_scale: 0.5,
          negative_prompt:
            "distortion, blur, jitter, flickering, shaking, morphing, low quality, glitch",
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      lastError = msg;
      console.warn(
        "Kling prediction creation failed, trying Luma Ray 2...",
        msg
      );
    }

    // Strategy 2: Luma Ray 2
    if (!prediction) {
      try {
        prediction = await replicate.predictions.create({
          model: "luma/ray-2-720p",
          input: {
            start_image: imageUrl,
            prompt: prompt,
            duration: 5,
            concepts: ["push_in", "dolly_zoom"],
            loop: true,
          },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = msg;
        console.warn(
          "Luma Ray 2 prediction creation failed, trying SVD...",
          msg
        );
      }
    }

    // Strategy 3: Stable Video Diffusion
    if (!prediction) {
      try {
        prediction = await replicate.predictions.create({
          version:
            "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
          input: {
            input_image: imageUrl,
            video_length: "25_frames_with_svd",
            sizing_strategy: "maintain_aspect_ratio",
            frames_per_second: 12,
            motion_bucket_id: 45,
          },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = msg;
      }
    }

    if (!prediction || !prediction.id) {
      return NextResponse.json(
        { error: lastError || "Failed to start video generation job." },
        { status: 400 }
      );
    }

    // Return prediction ID immediately so client can poll without timeout
    return NextResponse.json({
      success: true,
      predictionId: prediction.id,
      status: prediction.status,
    });
  } catch (err) {
    console.error("Replicate Video API Error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to start video generation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
