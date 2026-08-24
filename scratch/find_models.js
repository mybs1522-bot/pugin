const defaultReplicateToken = Buffer.from(
  "cjhfNUY0Z2I0RWwzSVdjN2ZKTmNoZDBGdE9pWm1vbkZtbzRKNFdkbQ==",
  "base64"
).toString("utf-8");

console.log("Replicate token:", defaultReplicateToken.substring(0, 10) + "...");

async function testReplicate() {
  const res = await fetch("https://api.replicate.com/v1/models", {
    headers: { Authorization: `Token ${defaultReplicateToken}` },
  });
  console.log("Replicate models status:", res.status);
}

testReplicate();
