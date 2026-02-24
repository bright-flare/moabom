import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabase = Boolean(url && (anonKey || serviceRole));

export function getSupabaseServerClient() {
  if (!url) return null;
  const key = serviceRole || anonKey;
  if (!key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
