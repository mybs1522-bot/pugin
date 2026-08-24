const Replicate = require("replicate");

const defaultReplicateToken = Buffer.from(
  "cjhfNUY0Z2I0RWwzSVdjN2ZKTmNoZDBGdE9pWm1vbkZtbzRKNFdkbQ==",
  "base64"
).toString("utf-8");

const replicate = new Replicate({ auth: defaultReplicateToken });

async function testFLUX() {
  console.log("Starting FLUX Schnell...");
  const start = Date.now();
  try {
    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt:
          "A modern luxury architectural interior photograph, 8k resolution, ultra detailed photorealistic, daylight",
        aspect_ratio: "16:9",
        num_outputs: 1,
      },
    });
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`SUCCESS! Rendered in ${duration} seconds.`);
    console.log("Image URL:", output);
  } catch (err) {
    console.error("FLUX error:", err.message || err);
  }
}

testFLUX();
