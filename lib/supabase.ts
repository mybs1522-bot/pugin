import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

const REAL_SUPABASE_URL = "https://mckdzujpkttuvsufhpwb.supabase.co";
const REAL_SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ja2R6dWpwa3R0dXZzdWZocHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MzUyOTYsImV4cCI6MjEwMTAxMTI5Nn0.eSr6mang6IPL3BxfdpyEe5HLVnLesOPcUVZBs_Ma91U";
const REAL_SUPABASE_SERVICE_ROLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ja2R6dWpwa3R0dXZzdWZocHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQzNTI5NiwiZXhwIjoyMTAxMDExMjk2fQ.sEDQJWHnqjWNU502tLyTVV5uw6bvvOlO-KO1qDsf4ls";

/** Browser / public client — safe to use in client components */
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || REAL_SUPABASE_URL;
    const anon =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || REAL_SUPABASE_ANON;
    _supabase = createClient(url, anon);
  }
  return _supabase;
}

/** Server-side admin client — safe and uses service role key */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || REAL_SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      REAL_SUPABASE_SERVICE_ROLE ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      REAL_SUPABASE_ANON;
    _supabaseAdmin = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return _supabaseAdmin;
}
