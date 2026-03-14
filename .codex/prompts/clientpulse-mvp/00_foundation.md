Set up the ClientPulse CRM MVP foundation in this Next.js repo.

Tasks:
1. Verify the app uses App Router and TypeScript strict mode.
2. Verify install and configure dependencies for:
   - `@supabase/ssr`
   - `@supabase/supabase-js`
   - `react-hook-form`
   - `zod`
   - `@hookform/resolvers`
   - `date-fns`
   - `lucide-react`
   - `@dnd-kit/core`
   - `@dnd-kit/sortable`
   - `@dnd-kit/utilities`
   - `recharts`
3. Ensure `shadcn/ui` is used and generate components if missing:
   - `button`
   - `card`
   - `input`
   - `label`
   - `sheet`
   - `dialog`
   - `tabs`
   - `badge`
   - `select`
   - `textarea`
   - `sonner`
   - `skeleton`
   - `avatar`
4. Create clean project structure for:
   - `app/(marketing)`
   - `app/(auth)`
   - `app/(app)`
   - `components/shared`
   - `components/clients`
   - `components/pipeline`
   - `components/tasks`
   - `lib/supabase`
   - `lib/utils`
   - `types`
5. Create placeholder pages so routes compile:
   - `/`
   - `/login`
   - `/signup`
   - `/onboarding`
   - `/dashboard`
   - `/clients`
   - `/pipeline`
   - `/tasks`
6. Create a root layout that includes Toaster/Sonner support.

Constraints:
- Do not build full features yet.
- Just create a clean scaffold and ensure app compiles.
- Use `shadcn/ui` components, not raw Tailwind-only UI blocks for reusable pieces.
- After changes, run install if needed and then run a typecheck/build check.

At the end:
- summarize files created/updated
- list any env vars required
