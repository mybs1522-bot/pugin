const Replicate = require("replicate");

const defaultReplicateToken = Buffer.from(
  "cjhfNUY0Z2I0RWwzSVdjN2ZKTmNoZDBGdE9pWm1vbkZtbzRKNFdkbQ==",
  "base64"
).toString("utf-8");

const replicate = new Replicate({ auth: defaultReplicateToken });

async function testSDXL() {
  console.log("Testing SDXL speed on Replicate...");
  const start = Date.now();
  try {
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt:
            "A modern luxury bedroom interior design photorealistic architectural photograph, 8k, architectural digest",
          num_inference_steps: 25,
          guidance_scale: 7.5,
        },
      }
    );
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`SDXL finished in ${duration}s! Output:`, output);
  } catch (err) {
    console.error("SDXL error:", err.message || err);
  }
}

testSDXL();
