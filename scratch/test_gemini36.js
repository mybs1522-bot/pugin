const defaultGeminiKey = Buffer.from(
  "QVEuQWI4Uk42TC0yeUNiMWpBSnQtTzZpMllxR2Q1VUVWMWxfenpMS2hlSXl3MG4wLVRscXc=",
  "base64"
).toString("utf-8");

async function testGemini36Flash() {
  console.log("Testing gemini-3.6-flash speed...");
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
                text: "A modern luxury bedroom interior design photorealistic architectural photograph",
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    });

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`Gemini 3.6 Flash status ${res.status} in ${duration}s`);
    const data = await res.json();
    console.log("Response sample:", JSON.stringify(data).substring(0, 400));
  } catch (err) {
    console.error("Gemini 3.6 Flash error:", err);
  }
}

testGemini36Flash();
