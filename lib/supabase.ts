import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

const ACTIVE_SUPABASE_URL = "https://vgejrwpluijlhfvlmrhs.supabase.co";
const ACTIVE_SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZWpyd3BsdWlqbGhmdmxtcmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjM3ODAsImV4cCI6MjA5NTYzOTc4MH0.SahuDH18dlGLMSMNn9L7Z-hF_ZDfZt6BRlyqMx1W_-Q";

/** Browser / public client — safe to use in client components */
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ACTIVE_SUPABASE_URL;
    const anon =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ACTIVE_SUPABASE_ANON;
    _supabase = createClient(url, anon);
  }
  return _supabase;
}

/** Server-side admin client — safe and uses service role key */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ACTIVE_SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      ACTIVE_SUPABASE_ANON;
    _supabaseAdmin = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return _supabaseAdmin;
}
