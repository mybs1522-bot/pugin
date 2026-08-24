const defaultGeminiKey = Buffer.from(
  "QVEuQWI4Uk42TC0yeUNiMWpBSnQtTzZpMllxR2Q1VUVWMWxfenpMS2hlSXl3MG4wLVRscXc=",
  "base64"
).toString("utf-8");

async function testFastImagen() {
  console.log("Testing imagen-3.0-fast-generate-001 speed...");
  const start = Date.now();
  const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-fast-generate-001:predict?key=${defaultGeminiKey}`;

  try {
    const res = await fetch(googleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [
          {
            prompt:
              "A modern luxury master bedroom interior architectural design photograph",
          },
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
        },
      }),
    });

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`Imagen Fast status ${res.status} in ${duration}s`);
    const data = await res.json();
    console.log("Response data:", JSON.stringify(data).substring(0, 400));
  } catch (err) {
    console.error("Error:", err);
  }
}

testFastImagen();
