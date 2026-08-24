const defaultGeminiKey = Buffer.from(
  "QVEuQWI4Uk42TC0yeUNiMWpBSnQtTzZpMllxR2Q1VUVWMWxfenpMS2hlSXl3MG4wLVRscXc=",
  "base64"
).toString("utf-8");

async function testImagen() {
  console.log("Testing Imagen 3 / Gemini Image Generation...");
  const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${defaultGeminiKey}`;

  const res = await fetch(googleUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [
        {
          prompt:
            "A modern luxury bedroom interior design photograph, photorealistic",
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
      },
    }),
  });

  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Response:", JSON.stringify(data).substring(0, 300));
}

testImagen();
