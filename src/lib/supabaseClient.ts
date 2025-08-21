
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient>;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.warn("Supabase URL or Anon Key is missing. Please check your .env.local file and restart the server.");
    // Provide a mock client to avoid crashes, but it won't work.
    supabase = {
        from: () => ({
            select: async () => ({ data: [], error: { message: "Supabase not configured", details: "", hint: "", code: "" } }),
            insert: async () => ({ data: [], error: { message: "Supabase not configured", details: "", hint: "", code: "" } }),
            update: async () => ({ data: [], error: { message: "Supabase not configured", details: "", hint: "", code: "" } }),
            delete: async () => ({ data: [], error: { message: "Supabase not configured", details: "", hint: "", code: "" } }),
        }),
    } as any;
}


export { supabase };
