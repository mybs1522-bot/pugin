const Replicate = require("replicate");

const defaultReplicateToken = Buffer.from(
  "cjhfNUY0Z2I0RWwzSVdjN2ZKTmNoZDBGdE9pWm1vbkZtbzRKNFdkbQ==",
  "base64"
).toString("utf-8");

const replicate = new Replicate({ auth: defaultReplicateToken });

async function testFLUX() {
  console.log("Testing Replicate FLUX speed...");
  const start = Date.now();
  try {
    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt:
          "A photorealistic luxury modern bedroom interior design, warm lighting, architectural photography",
        aspect_ratio: "16:9",
        num_outputs: 1,
      },
    });
    const duration = (Date.now() - start) / 1000;
    console.log(`FLUX Schnell finished in ${duration}s! Output:`, output);
  } catch (err) {
    console.error("FLUX error:", err);
  }
}

testFLUX();
