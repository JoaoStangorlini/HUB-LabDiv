import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client for **Client Components** ('use client').
 * Uses @supabase/ssr's createBrowserClient which automatically handles
 * cookie-based auth in the browser environment.
 */
// Bypass native browser lock to prevent timeouts in multi-tab environments
export function createClientSupabase() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        }
    });
}

// Singleton instance
let supabaseInstance: ReturnType<typeof createClientSupabase> | null = null;

export const supabase = (() => {
    if (typeof window === 'undefined') return createClientSupabase();
    if (!supabaseInstance) {
        supabaseInstance = createClientSupabase();
    }
    return supabaseInstance;
})();
