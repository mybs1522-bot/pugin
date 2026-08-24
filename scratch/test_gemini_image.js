const defaultGeminiKey = Buffer.from(
  "QVEuQWI4Uk42TC0yeUNiMWpBSnQtTzZpMllxR2Q1VUVWMWxfenpMS2hlSXl3MG4wLVRscXc=",
  "base64"
).toString("utf-8");

async function testGeminiImage() {
  console.log("Testing gemini-3.6-flash image output speed...");
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
                text: "Render this interior design as a realistic architectural photograph.",
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      }),
    });

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(
      `Gemini 3.6 Flash image output status ${res.status} in ${duration}s`
    );
    const data = await res.json();
    console.log("Response data:", JSON.stringify(data).substring(0, 500));
  } catch (err) {
    console.error("Error:", err);
  }
}

testGeminiImage();
