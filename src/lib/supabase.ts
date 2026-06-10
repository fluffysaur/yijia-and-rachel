import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function shouldUseDemoData() {
    const enableSupabaseInDev = String(import.meta.env.VITE_ENABLE_SUPABASE_IN_DEV || "").toLowerCase() === "true";
    return import.meta.env.DEV && !enableSupabaseInDev;
}

export function getSupabaseBrowserClient() {
    if (shouldUseDemoData()) {
        return null;
    }

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
