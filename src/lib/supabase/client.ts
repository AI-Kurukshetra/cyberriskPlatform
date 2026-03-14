import { createBrowserClient } from "@supabase/ssr";

export function createClient(): ReturnType<typeof createBrowserClient> {
  return createBrowserClient(
    // Required env vars:
    // - NEXT_PUBLIC_SUPABASE_URL
    // - NEXT_PUBLIC_SUPABASE_ANON_KEY
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
