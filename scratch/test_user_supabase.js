const { createClient } = require("@supabase/supabase-js");

const url = "https://mckdzujpkttuvsufhpwb.supabase.co";
const anonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ja2R6dWpwa3R0dXZzdWZocHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MzUyOTYsImV4cCI6MjEwMTAxMTI5Nn0.eSr6mang6IPL3BxfdpyEe5HLVnLesOPcUVZBs_Ma91U";

const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ja2R6dWpwa3R0dXZzdWZocHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQzNTI5NiwiZXhwIjoyMTAxMDExMjk2fQ.sEDQJWHnqjWNU502tLyTVV5uw6bvvOlO-KO1qDsf4ls";

console.log("Testing user's specified Supabase URL:", url);

const client = createClient(url, serviceRoleKey);

async function run() {
  try {
    const { data, error } = await client.from("user_usage").select("*");
    console.log("Select result -> error:", error);
    console.log("Select result -> data:", data);
  } catch (err) {
    console.error("Exception:", err);
  }
}

run();
