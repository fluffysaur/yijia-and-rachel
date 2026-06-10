import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !anonKey) {
    return null;
  }

  browserClient ??= createClient(url, anonKey);
  return browserClient;
}

export function isDemoMode() {
  return getSupabaseBrowserClient() === null;
}
