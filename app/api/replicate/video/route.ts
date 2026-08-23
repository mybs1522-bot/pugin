import { NextResponse } from "next/server";
import Replicate from "replicate";
import {
  isUserPaid,
  getVideoCount,
  incrementVideoCount,
  verifyDeviceSession,
  TRIAL_VIDEO_LIMIT,
} from "@/lib/usage";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function resolveVideoUrl(output: unknown): Promise<string> {
  if (!output) return "";
  let item = Array.isArray(output) ? output[output.length - 1] : output;
  if (!item) return "";

  // 1. Direct string URL
  if (typeof item === "string") return item;

  // 2. Replicate FileOutput object (has url() method or url property)
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

    // 3. Fallback: ReadableStream binary chunks
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
        return `data:video/mp4;base64,${buffer.toString("base64")}`;
      } catch (e) {
        console.warn("Error reading stream chunks for video:", e);
      }
    }
  }

  return String(item);
}

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

    console.log("Generating 3D Walkthrough Video for image...");

    let videoUrl: string | null = null;
    let lastError = "";

    // Strategy 1: stability-ai/stable-video-diffusion (latest working version)
    try {
      console.log(
        "Trying stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438..."
      );
      const output = await replicate.run(
        "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
        {
          input: {
            input_image: imageUrl,
            video_length: "14_frames_with_svd",
            sizing_strategy: "maintain_aspect_ratio",
            frames_per_second: 6,
            motion_bucket_id: 127,
          },
        }
      );
      videoUrl = await resolveVideoUrl(output);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      lastError = msg;
      console.warn(
        "stable-video-diffusion failed, trying minimax/video-01-live...",
        msg
      );
    }

    // Strategy 2: minimax/video-01-live
    if (!videoUrl) {
      try {
        console.log("Trying minimax/video-01-live...");
        const output = await replicate.run("minimax/video-01-live", {
          input: {
            prompt: prompt,
            first_frame_image: imageUrl,
          },
        });
        videoUrl = await resolveVideoUrl(output);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = msg;
        console.warn("minimax/video-01-live failed...", msg);
      }
    }

    if (!videoUrl) {
      return NextResponse.json(
        { error: lastError || "Failed to generate 3D video walkthrough." },
        { status: 400 }
      );
    }

    await incrementVideoCount(normEmail);
    return NextResponse.json({ videoUrl }, { status: 200 });
  } catch (err) {
    console.error("Replicate Video API Error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Failed to generate video walkthrough";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
