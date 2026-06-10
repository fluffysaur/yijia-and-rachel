import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

    if (!url || !publishableKey) {
        return null;
    }

    browserClient ??= createClient(url, publishableKey);
    return browserClient;
}

export function isDemoMode() {
    return getSupabaseBrowserClient() === null;
}
