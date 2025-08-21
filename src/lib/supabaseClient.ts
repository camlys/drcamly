
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | undefined;


export function getSupabase(): SupabaseClient {
    if (supabase) {
        return supabase;
    }

    // IMPORTANT: Replace these placeholder values with your actual Supabase credentials.
    const supabaseUrl = "https://your-project-url.supabase.co";
    const supabaseAnonKey = "your-supabase-anon-key";


    if (supabaseUrl && supabaseUrl !== "https://your-project-url.supabase.co" && supabaseAnonKey && supabaseAnonKey !== "your-supabase-anon-key") {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        return supabase;
    } else {
        console.warn("Supabase URL or Anon Key is missing or is still the placeholder value. Please check your src/lib/supabaseClient.ts file and update the credentials.");
        
        const mockQueryBuilder = {
            select: () => mockQueryBuilder,
            insert: () => mockQueryBuilder,
            update: () => mockQueryBuilder,
            delete: () => mockQueryBuilder,
            match: () => mockQueryBuilder,
            eq: () => mockQueryBuilder,
            gt: () => mockQueryBuilder,
            lt: () => mockQueryBuilder,
            gte: () => mockQueryBuilder,
            lte: () => mockQueryBuilder,
            like: () => mockQueryBuilder,
            ilike: () => mockQueryBuilder,
            is: () => mockQueryBuilder,
            in: () => mockQueryBuilder,
            neq: () => mockQueryBuilder,
            order: () => mockQueryBuilder,
            limit: () => mockQueryBuilder,
            single: async () => ({ data: null, error: { message: "Supabase not configured", details: "Credentials are not set up.", hint: "Please update supabaseClient.ts", code: "404" } as any }),
            then: (onfulfilled: (value: any) => any) => onfulfilled({ data: null, error: { message: "Supabase not configured", details: "Credentials are not set up.", hint: "Please update supabaseClient.ts", code: "404" } as any }),
        };
        
        // Provide a mock client to avoid crashes, but it won't work.
        const mockSupabase = {
            from: () => mockQueryBuilder,
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
            removeChannel: () => {},
            rpc: async () => ({ data: null, error: { message: "Supabase not configured" } as any }),
        };
        return mockSupabase as any;
    }
}
