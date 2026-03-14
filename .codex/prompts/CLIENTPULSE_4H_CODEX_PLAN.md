Set up the ClientPulse CRM MVP foundation in this Next.js 15 repo.

Tasks:
1. Verify the app uses App Router and TypeScript strict mode.
2. Install and configure dependencies for:
   - @supabase/ssr
   - @supabase/supabase-js
   - react-hook-form
   - zod
   - @hookform/resolvers
   - date-fns
   - lucide-react
   - @dnd-kit/core
   - @dnd-kit/sortable
   - @dnd-kit/utilities
   - recharts
3. Ensure shadcn/ui is used and generate components if missing:
   - button, card, input, label, sheet, dialog, tabs, badge, select, textarea, sonner, skeleton, avatar
4. Create clean project structure for:
   - app/(marketing)
   - app/(auth)
   - app/(app)
   - components/shared
   - components/clients
   - components/pipeline
   - components/tasks
   - lib/supabase
   - lib/utils
   - types
5. Create placeholder pages so routes compile:
   - /
   - /login
   - /signup
   - /onboarding
   - /dashboard
   - /clients
   - /pipeline
   - /tasks
6. Create a root layout that includes Toaster/Sonner support.

Constraints:
- Do not build full features yet.
- Just create clean scaffold and ensure app compiles.
- After changes, run npm install if needed and then run a typecheck/build check.
Prompt 0.2 — Supabase Helpers + Middleware
Create the minimum Supabase integration needed for a Next.js 15 App Router MVP.

Tasks:
1. Create:
   - lib/supabase/client.ts
   - lib/supabase/server.ts
   - lib/supabase/middleware.ts
2. Use @supabase/ssr patterns compatible with Next.js App Router.
3. Create middleware.ts in project root to refresh session and protect app routes:
   - Protected routes:
     /dashboard
     /clients
     /pipeline
     /tasks
     /onboarding
   - If user is not authenticated, redirect to /login
4. Do NOT block /, /login, /signup
5. Add comments for required env vars:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
6. Make code simple and compile-safe.

After coding:
- verify imports
- run typecheck
- fix any errors
Phase 1 — Landing Page
Prompt 1.1 — Build Landing Page
Build a high-converting SaaS landing page for ClientPulse CRM at app/(marketing)/page.tsx and make it the homepage route.

Product:
ClientPulse CRM = lightweight CRM for freelancers and small agencies to manage clients, deals, notes, and follow-up tasks.

Landing page goals:
- Premium, startup-quality look
- Strong first impression for hackathon judges
- Mobile responsive
- Fast to implement
- Use shadcn/ui components only where appropriate
- Use Tailwind for layout styling, but keep componentized
- Keep it elegant, modern, and minimal

Sections to include:
1. Hero section
   - Headline: “Close more clients without the chaos”
   - Subheadline about freelancers/agencies managing clients, deals, and follow-ups in one workspace
   - Primary CTA: Get Started
   - Secondary CTA: View Demo Flow
   - Right side: product mockup card showing mini CRM dashboard preview
2. Social proof strip
   - “Built for freelancers, consultants, and boutique agencies”
3. Features section (3 cards only)
   - Client management
   - Deal pipeline
   - Follow-up tasks
4. How it works (3 steps)
   - Add clients
   - Move deals in pipeline
   - Track follow-ups
5. MVP demo section
   - Show simple product workflow cards
6. Final CTA section
   - “Launch your client ops in minutes”
7. Footer

Requirements:
- Create reusable small sections/components inside components/shared if helpful
- Use lucide-react icons
- Add subtle gradients and card shadows
- Make CTA buttons route to /signup and /login
- Add anchor link navigation in header
- Include a sticky top nav with logo text “ClientPulse”

Do not add external images.
Use clean placeholder product mock UI built from cards and badges.
Ensure the homepage route is / and compiles.
Prompt 1.2 — Landing Page Polish
Polish the existing ClientPulse landing page for demo quality.

Tasks:
1. Improve spacing, typography hierarchy, and responsive behavior.
2. Add subtle hover states on cards and buttons.
3. Add a "Why ClientPulse" mini comparison strip:
   - Scattered spreadsheets ❌
   - Missed follow-ups ❌
   - One shared CRM workspace ✅
4. Ensure the page looks excellent on:
   - desktop
   - tablet
   - mobile
5. Keep it lightweight and no animation libraries.
6. Do not break routing.

After changes:
- verify the homepage still compiles
- fix any TypeScript/import issues
Phase 2 — Auth + Onboarding
Prompt 2.1 — Supabase SQL Migration
Create a single Supabase SQL migration file for the 4-hour ClientPulse CRM MVP.

Create only these tables:
1. workspaces
2. workspace_members
3. clients
4. pipeline_stages
5. deals
6. tasks

Detailed columns:
1. workspaces
   - id uuid primary key default gen_random_uuid()
   - name text not null
   - slug text unique
   - created_at timestamptz default now()

2. workspace_members
   - id uuid primary key default gen_random_uuid()
   - workspace_id uuid references workspaces(id) on delete cascade
   - user_id uuid references auth.users(id) on delete cascade
   - role text not null default 'owner'
   - created_at timestamptz default now()
   - unique(workspace_id, user_id)

3. clients
   - id uuid primary key default gen_random_uuid()
   - workspace_id uuid references workspaces(id) on delete cascade
   - name text not null
   - company text
   - email text
   - phone text
   - status text not null default 'lead'
   - created_at timestamptz default now()

4. pipeline_stages
   - id uuid primary key default gen_random_uuid()
   - workspace_id uuid references workspaces(id) on delete cascade
   - name text not null
   - position int not null
   - created_at timestamptz default now()

5. deals
   - id uuid primary key default gen_random_uuid()
   - workspace_id uuid references workspaces(id) on delete cascade
   - client_id uuid references clients(id) on delete set null
   - stage_id uuid references pipeline_stages(id) on delete set null
   - title text not null
   - value numeric(12,2) default 0
   - close_date date
   - created_at timestamptz default now()

6. tasks
   - id uuid primary key default gen_random_uuid()
   - workspace_id uuid references workspaces(id) on delete cascade
   - client_id uuid references clients(id) on delete set null
   - title text not null
   - due_date date
   - priority text not null default 'medium'
   - status text not null default 'todo'
   - created_at timestamptz default now()

Requirements:
- Enable RLS on all tables.
- Add simple MVP RLS policy pattern:
  user can access rows only if workspace_id belongs to a workspace in workspace_members for auth.uid().
- For workspaces table, allow access if user is in workspace_members for that workspace.
- Add insert/select/update/delete policies as practical MVP-safe policies.
- Add a SQL seed section for default pipeline stages:
  Lead, Proposal, Negotiation, Won
- Put comments in the SQL explaining where to run it in Supabase.

Do not overcomplicate. This is hackathon MVP SQL only.
Prompt 2.2 — Login + Signup
Build simple, polished authentication pages for ClientPulse using Supabase Auth.

Routes:
- app/(auth)/login/page.tsx
- app/(auth)/signup/page.tsx

Requirements:
1. Use shadcn/ui Card, Input, Label, Button.
2. Email + password only for MVP.
3. On signup:
   - create user with Supabase auth
   - after success redirect to /onboarding
4. On login:
   - sign in with Supabase auth
   - redirect to /dashboard
5. Show inline error state and loading state.
6. Add links between login and signup.
7. Keep styling consistent with landing page branding.
8. If session already exists, redirect away from auth pages appropriately.

Also:
- create reusable AuthCard component if useful
- use server actions or client-side implementation, whichever is fastest and compile-safe
- prioritize working auth flow over architectural purity

After coding:
- verify no TS errors
- ensure routes compile
Prompt 2.3 — Onboarding
Build the onboarding flow at /onboarding for ClientPulse CRM.

Goal:
After signup, the user creates their first workspace and becomes the owner.

Requirements:
1. Page route: app/(app)/onboarding/page.tsx or equivalent protected route setup.
2. Form fields:
   - Workspace Name
3. On submit:
   - create workspace row
   - generate slug from name
   - create workspace_members row for current user with role 'owner'
   - insert default pipeline stages for that workspace:
     Lead, Proposal, Negotiation, Won
4. Redirect to /dashboard after success.
5. If the logged-in user already belongs to a workspace, redirect to /dashboard.
6. Use shadcn Card + Input + Button.
7. Keep code simple and MVP-safe.
8. Add helper utility for slugify if needed.

After coding:
- verify imports and types
- fix any compile errors
Phase 3 — App Shell
Prompt 3.1 — Layout + Sidebar
Build the main authenticated app shell for ClientPulse.

Create:
- app/(app)/layout.tsx

Requirements:
1. Persistent sidebar layout
2. Sidebar width around 240px on desktop
3. Mobile-friendly top header with menu fallback
4. Nav items:
   - Dashboard
   - Clients
   - Pipeline
   - Tasks
5. Use lucide-react icons
6. Show:
   - workspace name
   - user email or avatar placeholder in sidebar footer
7. Add a top bar on mobile / content header area
8. Use shadcn/ui and clean Tailwind layout
9. All routes should render inside the layout

Also:
- create reusable sidebar component in components/shared/app-sidebar.tsx
- highlight active route
- keep it simple, beautiful, and compile-safe
Prompt 3.2 — Workspace Membership Guards
Improve route protection for the ClientPulse MVP.

Requirements:
1. For authenticated app routes:
   - if user is logged in but has no workspace membership, redirect to /onboarding
2. For /login and /signup:
   - if user is logged in and has a workspace, redirect to /dashboard
   - if user is logged in and has no workspace, redirect to /onboarding
3. Keep middleware simple and safe
4. If middleware becomes too complex, move workspace checks into layouts/pages where appropriate
5. Do not break public homepage access

After coding:
- verify route behavior
- fix compile issues
Phase 4 — Clients
Prompt 4.1 — Clients List
Build the ClientPulse Clients page at /clients.

Requirements:
1. Fetch clients for the current user's workspace from Supabase.
2. Display in a clean responsive table/list.
3. Columns:
   - Name
   - Company
   - Email
   - Status
   - Created date
4. Status badge styles:
   - lead
   - active
   - inactive
5. Header section:
   - page title
   - subtitle
   - "Add Client" button
6. Add search by name/company/email (client-side filtering is acceptable for MVP)
7. Add empty state:
   - "No clients yet"
   - CTA to add first client
8. Use shadcn Table/Card/Badge/Button if available
9. Keep server-side data fetching simple and stable

Also:
- create a small client type in types/
- make the page compile even if there are zero records
Prompt 4.2 — Create/Edit Client
Add create and edit client functionality to the /clients page.

Requirements:
1. Create reusable component:
   - components/clients/client-form-dialog.tsx
2. Use shadcn Dialog
3. Fields:
   - Name (required)
   - Company
   - Email
   - Phone
   - Status (lead, active, inactive)
4. Support:
   - Create new client
   - Edit existing client
5. Save to Supabase for the current workspace
6. Refresh the clients page after save
7. Add row action for Edit
8. Add Delete action only if quick and safe; otherwise skip delete for now
9. Show loading and error states

Keep implementation simple:
- fastest stable approach wins
- use react-hook-form + zod if fast, otherwise minimal controlled form is acceptable
Prompt 4.3 — Client Detail
Build a lightweight client detail page at /clients/[id].

Requirements:
1. Show client header:
   - name
   - company
   - email
   - phone
   - status badge
2. Show 2 simple sections only for MVP:
   - Deals for this client
   - Tasks for this client
3. Add quick action buttons:
   - Add Deal
   - Add Task
4. If related data is empty, show clean empty states
5. Keep it simple and visually polished
6. Use server component data fetching where possible
7. Ensure route is protected and workspace-scoped

Do not build tabs or notes yet.
This is MVP detail page only.
Phase 5 — Pipeline
Prompt 5.1 — Pipeline Board
Build the /pipeline page for ClientPulse as a lightweight Kanban board.

Requirements:
1. Fetch pipeline stages for current workspace ordered by position
2. Fetch deals grouped by stage
3. Render 4 columns:
   - Lead
   - Proposal
   - Negotiation
   - Won
4. Each column card should show:
   - stage name
   - deal count
   - total deal value
5. Each deal card should show:
   - title
   - client name if available
   - value
   - close date if available
6. Add "New Deal" button in page header
7. Add empty state per column
8. Make it visually impressive for demo

Implementation:
- First build non-drag version if faster
- Structure code so drag-and-drop can be added next
- Use shadcn Card components
- Create components/pipeline/kanban-board.tsx and related small components
Prompt 5.2 — Deal Dialog
Add create and edit deal support to the /pipeline page.

Requirements:
1. Create reusable dialog component:
   - components/pipeline/deal-form-dialog.tsx
2. Fields:
   - Title (required)
   - Client (select from workspace clients)
   - Stage (select from pipeline stages)
   - Value
   - Close date
3. On create:
   - save deal with current workspace_id
4. On edit:
   - update existing deal
5. Clicking a deal card opens edit dialog
6. Add "New Deal" button in page header
7. Refresh board after save
8. Use shadcn Dialog + Select + Input

Keep it MVP fast and stable.
Prompt 5.3 — Drag & Drop (Optional)
Upgrade the existing ClientPulse pipeline board to support basic drag-and-drop between stages using @dnd-kit.

Requirements:
1. Allow dragging a deal card from one stage column to another
2. On drop:
   - update deal.stage_id in Supabase
3. Optimistically update UI if straightforward
4. If optimistic update is risky, refresh after successful update
5. Keep the implementation simple and reliable
6. Do not over-engineer sensors or fancy animations
7. If complexity gets too high, preserve a stable fallback:
   - add quick "Move to next stage" action on each card instead

Important:
- If drag-and-drop introduces instability, choose the fallback button-based stage move
- App stability is more important than perfect Kanban
Phase 6 — Tasks
Prompt 6.1 — Tasks Page
Build the /tasks page for ClientPulse CRM.

Requirements:
1. Fetch tasks for current workspace
2. Create 3 sections:
   - Due Today
   - Upcoming
   - Completed
3. Each task item shows:
   - title
   - related client name if available
   - due date
   - priority badge
   - status
4. Add page header with:
   - title
   - subtitle
   - "Add Task" button
5. Use clean cards/lists and clear empty states
6. Prioritize fast, readable UI over complexity
7. Make the page demo-friendly and visually polished
Prompt 6.2 — Create + Complete Task
Add task creation and completion flow to the /tasks page.

Requirements:
1. Create reusable dialog:
   - components/tasks/task-form-dialog.tsx
2. Fields:
   - Title (required)
   - Client (optional select)
   - Due date
   - Priority (low, medium, high)
3. On create:
   - save task with workspace_id
   - default status = todo
4. Add checkbox/button to mark task completed
   - update status to done
5. Completed tasks should move to Completed section
6. Add quick task creation from client detail page if simple
7. Keep implementation minimal and stable

Use shadcn Dialog, Input, Select, Button.
Phase 7 — Dashboard + Polish
Prompt 7.1 — Dashboard
Build the /dashboard page for ClientPulse CRM.

Goal:
Create a highly demoable dashboard that summarizes the workspace.

Requirements:
1. Fetch data for current workspace:
   - clients
   - deals
   - tasks
   - pipeline stages
2. Create 4 stat cards:
   - Total Clients
   - Pipeline Value
   - Deals Open
   - Tasks Due Today
3. Create a "Today's Focus" section:
   - tasks due today
   - deals closing soon (today or nearest upcoming)
4. Create a "Pipeline Snapshot" section:
   - show stage counts in simple cards or horizontal bars
5. Create a "Recent Clients" section:
   - latest 5 clients
6. Use clean shadcn cards
7. Make it feel premium and polished
8. If charts slow things down, skip Recharts and use card summaries instead

Important:
- Optimize for demo impact, not analytics completeness
Prompt 7.2 — Final Polish + Seed Helper
Polish the ClientPulse MVP across all main pages.

Tasks:
1. Improve empty states on:
   - dashboard
   - clients
   - pipeline
   - tasks
2. Ensure all page headers are visually consistent
3. Add loading-safe states where easy
4. Add simple currency formatting helper for deal values
5. Add a temporary demo seed helper (developer-only utility or SQL snippet) that can quickly create:
   - 3 clients
   - 4 deals across stages
   - 3 tasks
6. Ensure navigation is smooth and routes are consistent
7. Fix any rough UI issues
8. Keep everything compile-safe

At the end:
- run typecheck
- list all files changed
- summarize any remaining manual steps
Final Deploy Prep Prompt
Prepare ClientPulse CRM for Vercel deployment.

Tasks:
1. Create .env.example with:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
2. Verify no server-only secrets are accidentally required for MVP runtime
3. Ensure Next.js build passes
4. Fix any TypeScript issues
5. Ensure middleware and route structure work in production
6. Add a simple /api/healthcheck route returning:
   { "status": "ok", "timestamp": "<iso>" }
7. Summarize exact deployment steps for Vercel

Now run a full typecheck, fix all TypeScript errors, fix imports, and ensure the route compiles without breaking existing pages. Keep changes minimal.
UI Polish Prompt
Polish spacing, typography, empty states, and mobile responsiveness for the page you just built. Do not change the core logic.