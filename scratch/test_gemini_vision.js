const defaultGeminiKey = Buffer.from(
  "QVEuQWI4Uk42TC0yeUNiMWpBSnQtTzZpMllxR2Q1VUVWMWxfenpMS2hlSXl3MG4wLVRscXc=",
  "base64"
).toString("utf-8");

// Small 1x1 red PNG base64
const tinyImage =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function testGeminiVision() {
  console.log("Testing gemini-3.6-flash vision spatial render speed...");
  const start = Date.now();
  const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${defaultGeminiKey}`;

  try {
    const res = await fetch(googleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Transform this SketchUp 3D viewport line drawing into a photorealistic architectural photograph with warm lighting, 8k details, photorealistic materials, and interior design styling.",
              },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: tinyImage,
                },
              },
            ],
          },
        ],
      }),
    });

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`Gemini 3.6 Flash vision status ${res.status} in ${duration}s`);
    const data = await res.json();
    console.log("Response data:", JSON.stringify(data).substring(0, 400));
  } catch (err) {
    console.error("Error:", err);
  }
}

testGeminiVision();
