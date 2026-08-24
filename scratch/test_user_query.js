const { createClient } = require("@supabase/supabase-js");

const url = "https://mckdzujpkttuvsufhpwb.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ja2R6dWpwa3R0dXZzdWZocHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQzNTI5NiwiZXhwIjoyMTAxMDExMjk2fQ.sEDQJWHnqjWNU502tLyTVV5uw6bvvOlO-KO1qDsf4ls";

const client = createClient(url, serviceRoleKey);

async function test() {
  console.log("Checking user ipzyboxghgh@gmail.com...");
  const { data, error } = await client
    .from("user_usage")
    .select("count, is_paid")
    .eq("email", "ipzyboxghgh@gmail.com")
    .single();

  console.log("Query error:", error);
  console.log("Query data:", data);
}

test();
