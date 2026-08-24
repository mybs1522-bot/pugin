const Replicate = require("replicate");

const defaultReplicateToken = Buffer.from(
  "cjhfNUY0Z2I0RWwzSVdjN2ZKTmNoZDBGdE9pWm1vbkZtbzRKNFdkbQ==",
  "base64"
).toString("utf-8");

const replicate = new Replicate({ auth: defaultReplicateToken });

async function pollPrediction(predictionId) {
  console.log("Polling prediction:", predictionId);
  const start = Date.now();

  while (true) {
    const prediction = await replicate.predictions.get(predictionId);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`Status at ${elapsed}s: ${prediction.status}`);

    if (prediction.status === "succeeded") {
      console.log("SUCCESS! Output:", prediction.output);
      break;
    }
    if (prediction.status === "failed" || prediction.status === "canceled") {
      console.error("FAILED:", prediction.error);
      break;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

pollPrediction("tqkt8tz8x9rmy0d06dgrhv55w4");
