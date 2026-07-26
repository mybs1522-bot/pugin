import { NextResponse } from "next/server";
import Replicate from "replicate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function resolveVideoUrl(output: unknown): Promise<string> {
  if (!output) return "";
  let item = Array.isArray(output) ? output[output.length - 1] : output;

  if (item && typeof item === "object" && "getReader" in item) {
    const reader = (item as ReadableStream<Uint8Array>).getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const buffer = Buffer.concat(chunks);
    return `data:video/mp4;base64,${buffer.toString("base64")}`;
  }

  if (typeof item === "string") return item;
  if (item && typeof item === "object" && "url" in item) {
    return String((item as { url: unknown }).url);
  }
  return String(item);
}

export async function POST(request: Request) {
  try {
    const clientHeader = request.headers.get("x-client");
    let email: string | undefined = undefined;

    if (clientHeader === "sketchup" || process.env.NODE_ENV === "development") {
      email = "sketchup-plugin@local.app";
    } else {
      try {
        const session = await getServerSession(authOptions);
        email = session?.user?.email ?? undefined;
      } catch (err) {
        console.warn("Session check error:", err);
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: "Sign in required", code: "auth_required" },
        { status: 401 }
      );
    }

    const req = await request.json();
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

    // Strategy 1: stability-ai/stable-video-diffusion (Robust image-to-video with base64 support)
    try {
      console.log("Trying stable-video-diffusion...");
      const output = await replicate.run(
        "stability-ai/stable-video-diffusion:3f0463197e5427de3e788a65d03522c562947dcb732e147160ed0ba936e3d9d7",
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

    console.log("Generated Walkthrough Video Result successfully");
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
