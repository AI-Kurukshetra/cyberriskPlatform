import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient(): Promise<ReturnType<typeof createServerClient>> {
  const cookieStore = await cookies();

  return createServerClient(
    // Required env vars:
    // - NEXT_PUBLIC_SUPABASE_URL
    // - NEXT_PUBLIC_SUPABASE_ANON_KEY
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot call cookies().set (only Middleware / Route Handlers / Server Actions).
            // Session refresh + cookie writes happen in middleware (`updateSession`).
          }
        },
      },
    }
  );
}
