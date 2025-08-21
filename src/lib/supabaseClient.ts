
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | undefined;

// IMPORTANT: Replace these placeholder values with your actual Supabase credentials.
// It is strongly recommended to use a secure secret management solution
// instead of hardcoding credentials in a production environment.
const supabaseUrl = "https://your-project-url.supabase.co";
const supabaseAnonKey = "your-supabase-anon-key";


export function getSupabase(): SupabaseClient {
    if (supabase) {
        return supabase;
    }

    if (supabaseUrl && supabaseUrl !== "https://your-project-url.supabase.co" && supabaseAnonKey && supabaseAnonKey !== "your-supabase-anon-key") {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        return supabase;
    } else {
        console.warn("Supabase URL or Anon Key is missing or is still the placeholder value. Please check your src/lib/supabaseClient.ts file and update the credentials.");
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
