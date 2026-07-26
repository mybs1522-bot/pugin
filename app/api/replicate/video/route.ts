import { NextResponse } from "next/server";
import Replicate from "replicate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Auth check (allow sketchup client or session)
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

    const req = await request.json();
    const imageUrl: string = req.image;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL or Base64 is required for video generation." },
        { status: 400 }
      );
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        {
          error:
            "REPLICATE_API_TOKEN is not configured in environment variables.",
        },
        { status: 500 }
      );
    }

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    // Motion prompt for 3D architectural camera walkthrough
    const prompt =
      req.prompt ||
      "Smooth cinematic 3D architectural camera pan walkthrough of interior space, steady camera movement, photorealistic lighting, high resolution";

    console.log("Generating 3D Walkthrough Video for image...", prompt);

    // Call Replicate Image-to-Video model (minimax/video-01-live or svd)
    let videoUrl: string | null = null;

    try {
      // Primary model: minimax/video-01-live (high quality image-to-video)
      const output = await replicate.run("minimax/video-01-live", {
        input: {
          prompt: prompt,
          first_frame_image: imageUrl,
        },
      });

      videoUrl = Array.isArray(output)
        ? String(output[output.length - 1])
        : String(output);
    } catch (err) {
      console.warn(
        "minimax/video-01-live failed, falling back to stable-video-diffusion...",
        err
      );

      // Fallback model: stability-ai/stable-video-diffusion
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

      videoUrl = Array.isArray(output)
        ? String(output[output.length - 1])
        : String(output);
    }

    console.log("Generated Walkthrough Video URL:", videoUrl);

    return NextResponse.json({ videoUrl }, { status: 200 });
  } catch (err) {
    console.error("Replicate Video API Error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Failed to generate video walkthrough";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
