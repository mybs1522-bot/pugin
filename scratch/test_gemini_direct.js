const defaultGeminiKey = Buffer.from(
  "QVEuQWI4Uk42TC0yeUNiMWpBSnQtTzZpMllxR2Q1VUVWMWxfenpMS2hlSXl3MG4wLVRscXc=",
  "base64"
).toString("utf-8");

const tinyImage =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function testGeminiDirect() {
  console.log(
    "Testing Google AI Studio Gemini API direct call with gemini-3.6-flash..."
  );
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
                text: "Transform this 3D viewport drawing into a photorealistic architectural interior render photograph, 8k details.",
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

    console.log("Status:", res.status);
    const data = await res.json();
    console.log(
      "Response candidates:",
      JSON.stringify(data.candidates?.[0]?.content?.parts).substring(0, 300)
    );
  } catch (err) {
    console.error("Error:", err);
  }
}

testGeminiDirect();
