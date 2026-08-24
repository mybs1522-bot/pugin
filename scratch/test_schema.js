const { createClient } = require("@supabase/supabase-js");

const url = "https://mckdzujpkttuvsufhpwb.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ja2R6dWpwa3R0dXZzdWZocHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQzNTI5NiwiZXhwIjoyMTAxMDExMjk2fQ.sEDQJWHnqjWNU502tLyTVV5uw6bvvOlO-KO1qDsf4ls";

const client = createClient(url, serviceRoleKey);

async function test() {
  console.log("Upserting test row for ipzyboxghgh@gmail.com...");
  const { data, error } = await client
    .from("user_usage")
    .upsert({
      email: "ipzyboxghgh@gmail.com",
      count: 3,
      image_count: 3,
      is_paid: false,
      last_active_at: new Date().toISOString(),
    })
    .select();

  console.log("Upsert error:", error);
  console.log("Upsert data:", data);
}

test();
