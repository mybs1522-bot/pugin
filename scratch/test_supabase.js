const { createClient } = require("@supabase/supabase-js");

const url = "https://vgejrwpluijlhfvlmrhs.supabase.co";
const key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZWpyd3BsdWlqbGhmdmxtcmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjM3ODAsImV4cCI6MjA5NTYzOTc4MH0.SahuDH18dlGLMSMNn9L7Z-hF_ZDfZt6BRlyqMx1W_-Q";

const client = createClient(url, key);

async function run() {
  console.log("Testing Supabase connection...");
  const { data, error } = await client.from("user_usage").select("*").limit(5);
  console.log("Error:", error);
  console.log("Data:", data);
}

run();
