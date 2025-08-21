
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient>;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.warn("Supabase URL or Anon Key is missing. Please check your .env.local file and restart the server.");
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
            })
        }),
        removeChannel: () => {}
    };
    supabase = mockSupabase as any;
}


export { supabase };

