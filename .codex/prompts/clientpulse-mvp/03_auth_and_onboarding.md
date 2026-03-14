Build the MVP auth and onboarding flow for ClientPulse.

Part A: Supabase SQL migration
1. Create a single Supabase SQL migration for only these tables:
   - `workspaces`
   - `workspace_members`
   - `clients`
   - `pipeline_stages`
   - `deals`
   - `tasks`
2. Columns:
   - `workspaces`
     - `id uuid primary key default gen_random_uuid()`
     - `name text not null`
     - `slug text unique`
     - `created_at timestamptz default now()`
   - `workspace_members`
     - `id uuid primary key default gen_random_uuid()`
     - `workspace_id uuid references workspaces(id) on delete cascade`
     - `user_id uuid references auth.users(id) on delete cascade`
     - `role text not null default 'owner'`
     - `created_at timestamptz default now()`
     - `unique(workspace_id, user_id)`
   - `clients`
     - `id uuid primary key default gen_random_uuid()`
     - `workspace_id uuid references workspaces(id) on delete cascade`
     - `name text not null`
     - `company text`
     - `email text`
     - `phone text`
     - `status text not null default 'lead'`
     - `created_at timestamptz default now()`
   - `pipeline_stages`
     - `id uuid primary key default gen_random_uuid()`
     - `workspace_id uuid references workspaces(id) on delete cascade`
     - `name text not null`
     - `position int not null`
     - `created_at timestamptz default now()`
   - `deals`
     - `id uuid primary key default gen_random_uuid()`
     - `workspace_id uuid references workspaces(id) on delete cascade`
     - `client_id uuid references clients(id) on delete set null`
     - `stage_id uuid references pipeline_stages(id) on delete set null`
     - `title text not null`
     - `value numeric(12,2) default 0`
     - `close_date date`
     - `created_at timestamptz default now()`
   - `tasks`
     - `id uuid primary key default gen_random_uuid()`
     - `workspace_id uuid references workspaces(id) on delete cascade`
     - `client_id uuid references clients(id) on delete set null`
     - `title text not null`
     - `due_date date`
     - `priority text not null default 'medium'`
     - `status text not null default 'todo'`
     - `created_at timestamptz default now()`
3. Enable RLS on all tables.
4. Use a simple MVP-safe RLS pattern:
   - user can access rows only if `workspace_id` belongs to a workspace in `workspace_members` for `auth.uid()`
   - for `workspaces`, allow access if user is in `workspace_members` for that workspace
5. Add insert/select/update/delete policies as practical MVP-safe policies.
6. Add seed logic for default pipeline stages:
   - `Lead`
   - `Proposal`
   - `Negotiation`
   - `Won`
7. Put comments in the SQL explaining where to run it in Supabase.

Part B: Login + signup pages
Routes:
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`

Requirements:
1. Use `shadcn/ui` `Card`, `Input`, `Label`, `Button`
2. Email + password only for MVP
3. On signup:
   - create user with Supabase Auth
   - after success redirect to `/onboarding`
4. On login:
   - sign in with Supabase Auth
   - redirect to `/dashboard`
5. Show inline error state and loading state
6. Add links between login and signup
7. Keep styling consistent with landing page branding
8. If session already exists, redirect away from auth pages appropriately
9. Create reusable `AuthCard` component if useful
10. Use server actions or client-side implementation, whichever is fastest and compile-safe

Part C: Onboarding
Build onboarding at `/onboarding`.

Requirements:
1. Form fields:
   - `Workspace Name`
2. On submit:
   - create workspace row
   - generate slug from name
   - create `workspace_members` row for current user with role `owner`
   - insert default pipeline stages for that workspace:
     - `Lead`
     - `Proposal`
     - `Negotiation`
     - `Won`
3. Redirect to `/dashboard` after success
4. If the logged-in user already belongs to a workspace, redirect to `/dashboard`
5. Use `shadcn` `Card`, `Input`, `Button`
6. Keep code simple and MVP-safe
7. Add helper utility for slugify if needed

After coding:
- verify imports and types
- run typecheck/build
- fix any compile errors
- summarize files changed and env vars required
