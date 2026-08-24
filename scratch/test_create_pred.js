const Replicate = require("replicate");

const defaultReplicateToken = Buffer.from(
  "cjhfNUY0Z2I0RWwzSVdjN2ZKTmNoZDBGdE9pWm1vbkZtbzRKNFdkbQ==",
  "base64"
).toString("utf-8");

const replicate = new Replicate({ auth: defaultReplicateToken });

async function testPredictionCreate() {
  console.log("Testing replicate.predictions.create for nano-banana-pro...");
  const start = Date.now();
  try {
    const prediction = await replicate.predictions.create({
      model: "google/nano-banana-pro",
      input: {
        prompt:
          "A modern luxury master bedroom architectural photograph, 8k photorealistic",
        aspect_ratio: "16:9",
        output_format: "jpg",
      },
    });

    const duration = Date.now() - start;
    console.log(
      `Prediction created in ${duration}ms! Prediction ID:`,
      prediction.id
    );
    console.log("Initial status:", prediction.status);
  } catch (err) {
    console.error("Create prediction error:", err.message || err);
  }
}

testPredictionCreate();
