const Replicate = require("replicate");

const defaultReplicateToken = Buffer.from(
  "cjhfNUY0Z2I0RWwzSVdjN2ZKTmNoZDBGdE9pWm1vbkZtbzRKNFdkbQ==",
  "base64"
).toString("utf-8");

const replicate = new Replicate({ auth: defaultReplicateToken });

async function testFastRender() {
  console.log("Testing fast architectural rendering...");
  const start = Date.now();
  try {
    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt:
          "A high-end architectural digest photograph of a modern luxury bedroom interior with warm lighting, 8k photo",
        aspect_ratio: "16:9",
        num_outputs: 1,
      },
    });
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`Render complete in ${duration}s!`);
    console.log("Output:", output);
  } catch (err) {
    console.error("Error:", err);
  }
}

testFastRender();
