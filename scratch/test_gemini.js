const defaultGeminiKey = Buffer.from(
  "QVEuQWI4Uk42TC0yeUNiMWpBSnQtTzZpMllxR2Q1VUVWMWxfenpMS2hlSXl3MG4wLVRscXc=",
  "base64"
).toString("utf-8");

console.log("Gemini Key:", defaultGeminiKey.substring(0, 10) + "...");

const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${defaultGeminiKey}`;

async function test() {
  const start = Date.now();
  console.log("Calling Gemini API...");
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${defaultGeminiKey}`
    );
    const data = await res.json();
    console.log("Available Models status:", res.status);
    if (data.models) {
      console.log(
        "Models list sample:",
        data.models.slice(0, 5).map((m) => m.name)
      );
    } else {
      console.log("Data:", data);
    }
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

test();
