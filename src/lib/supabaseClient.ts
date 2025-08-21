
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | undefined;

export function getSupabase(): SupabaseClient {
    if (supabase) {
        return supabase;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseUrl.trim() !== '' && supabaseAnonKey && supabaseAnonKey.trim() !== '') {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        return supabase;
    } else {
        console.warn("Supabase URL or Anon Key is missing or empty. Please check your .env.local file and restart the server.");
        // Provide a mock client to avoid crashes, but it won't work.
        const mockSupabase = {
            from: () => ({
                select: async () => ({ data: null, error: { message: "Supabase not configured" } as any }),
                insert: async () => ({ data: null, error: { message: "Supabase not configured" } as any }),
                update: async () => ({ data: null, error: { message: "Supabase not configured" } as any }),
                delete: async () => ({ data: null, error: { message: "Supabase not configured" } as any }),
                rpc: async () => ({ data: null, error: { message: "Supabase not configured" } as any }),
            }),
            channel: () => ({
                on: () => ({
                    subscribe: () => ({
                        unsubscribe: () => {}
                    })
                }),
                subscribe: () => ({
                    unsubscribe: () => {}
                })
            }),
            removeChannel: () => {}
        };
        return mockSupabase as any;
    }
}
