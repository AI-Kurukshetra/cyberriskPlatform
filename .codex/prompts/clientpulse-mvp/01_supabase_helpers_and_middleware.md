Create the minimum Supabase integration needed for a Next.js App Router MVP.

Tasks:
1. Create or verify:
   - `lib/supabase/client.ts`
   - `lib/supabase/server.ts`
   - `lib/supabase/middleware.ts`
2. Use `@supabase/ssr` patterns compatible with App Router.
3. Create `middleware.ts` in project root to refresh session and protect app routes:
   - Protected routes:
     - `/dashboard`
     - `/clients`
     - `/pipeline`
     - `/tasks`
     - `/onboarding`
   - If user is not authenticated, redirect to `/login`
4. Do not block:
   - `/`
   - `/login`
   - `/signup`
5. Add comments for required env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Make code simple and compile-safe.

After coding:
- verify imports
- run typecheck
- fix any errors
- summarize files changed and env vars used
