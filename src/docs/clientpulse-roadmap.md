# ClientPulse CRM — Vibe Coding Blueprint
### Next.js 15 · Supabase · Vercel · shadcn/ui

---

## 🎯 Product Vision

A **lightweight CRM built for freelancers and small agencies** to track clients, manage deal pipelines, log notes, assign follow-up tasks, and collaborate as a team — all in one fast, beautiful web app.

**Target Users:** Freelancers, design/dev agencies, consultants (1–20 person teams)
**Core Promise:** Zero CRM bloat. Open your laptop, see what needs attention today, and act.

---

## 🗂️ Complete Feature List

### 🔐 Auth & Workspace
- [ ] Email/password signup & login (Supabase Auth)
- [ ] Google OAuth login
- [ ] Workspace creation on first login (org name, slug)
- [ ] Invite team members via email link
- [ ] Role-based access: Owner / Member / Viewer
- [ ] User profile with avatar and display name

### 👥 Client Management
- [ ] Create/edit/archive client profiles
- [ ] Client fields: Name, Company, Email, Phone, Website, Location, Tags
- [ ] Client avatar (initials-based or uploaded)
- [ ] Client status: Active / Inactive / Lead
- [ ] Search and filter clients by name, tag, status
- [ ] Client detail page with tabs: Overview, Deals, Notes, Tasks, Activity

### 💼 Deal Pipeline
- [ ] Kanban board with drag-and-drop stages
- [ ] Default stages: Lead → Proposal → Negotiation → Won → Lost
- [ ] Custom pipeline stages (add/rename/reorder/delete)
- [ ] Deal fields: Title, Client, Value (INR/USD), Stage, Close Date, Probability %
- [ ] Deal card previews on Kanban with value + due date
- [ ] Deal detail side panel (click to open without leaving board)
- [ ] Filter pipeline by team member, date range, value
- [ ] Won/Lost deal marking with reason capture
- [ ] Deal value total per stage shown on board header

### 📝 Notes
- [ ] Rich text notes per client and per deal
- [ ] Quick note composer (⌘+N shortcut)
- [ ] Note timestamps with author name
- [ ] Pin important notes to top
- [ ] Notes appear in client activity timeline
- [ ] Search notes across all clients

### ✅ Follow-up Tasks
- [ ] Create tasks linked to a client or deal
- [ ] Task fields: Title, Due Date, Priority (High/Medium/Low), Assigned To
- [ ] Task status: To Do / In Progress / Done
- [ ] Today view — tasks due today across all clients
- [ ] Overdue tasks highlighted in red on dashboard
- [ ] Assign tasks to any workspace team member
- [ ] Task list per client, per deal, and global "My Tasks"
- [ ] Mark complete with satisfying ✓ animation

### 📊 Dashboard & Analytics
- [ ] Daily briefing: tasks due today, deals closing soon
- [ ] Revenue pipeline total (sum of active deal values)
- [ ] Win rate % (Won deals / Total closed)
- [ ] Deal conversion funnel chart
- [ ] Recent activity feed (notes, status changes, tasks)
- [ ] Top clients by deal value
- [ ] Monthly revenue trend line chart

### 👨‍👩‍👧‍👦 Team Collaboration
- [ ] Shared workspace with all clients, deals, tasks visible to members
- [ ] Activity log: who did what, when (audit trail)
- [ ] @mention team members in notes
- [ ] Task assignment with email notification
- [ ] See who is assigned to which deals

### 🔔 Notifications
- [ ] In-app notification bell for task assignments, @mentions
- [ ] Email digest for overdue tasks (daily, via Supabase Edge Function)
- [ ] Deal stage change notifications

### ⚙️ Settings
- [ ] Workspace settings: name, logo, timezone
- [ ] Manage team members: invite, remove, change role
- [ ] Pipeline stage customization
- [ ] Tag management (create/delete/merge tags)
- [ ] Data export (clients + deals as CSV)
- [ ] Account deletion / workspace deletion

---

## 🏗️ Tech Architecture

### Stack Overview

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Vercel)                  │
│          Next.js 15 App Router + TypeScript          │
│          shadcn/ui + Tailwind CSS + Framer Motion    │
└─────────────────────┬───────────────────────────────┘
                      │ API calls + Realtime
┌─────────────────────▼───────────────────────────────┐
│                 SUPABASE (Backend)                   │
│  Auth │ Postgres DB │ Row-Level Security │ Realtime  │
│  Storage │ Edge Functions │ Email (SMTP)             │
└─────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── invite/[token]/page.tsx
├── (app)/
│   ├── layout.tsx                  ← Sidebar + auth guard
│   ├── dashboard/page.tsx          ← Daily briefing
│   ├── clients/
│   │   ├── page.tsx                ← Client list
│   │   └── [id]/page.tsx           ← Client detail
│   ├── pipeline/page.tsx           ← Kanban board
│   ├── tasks/page.tsx              ← My tasks + Today view
│   └── settings/
│       ├── page.tsx
│       ├── team/page.tsx
│       └── pipeline/page.tsx
├── api/
│   └── webhooks/
│       └── email-digest/route.ts   ← Cron email handler
components/
├── ui/                             ← shadcn/ui primitives
├── clients/
│   ├── ClientCard.tsx
│   ├── ClientForm.tsx
│   └── ClientTimeline.tsx
├── pipeline/
│   ├── KanbanBoard.tsx
│   ├── DealCard.tsx
│   └── DealPanel.tsx
├── tasks/
│   ├── TaskList.tsx
│   └── TaskItem.tsx
├── notes/
│   └── NoteEditor.tsx
└── shared/
    ├── Sidebar.tsx
    ├── Header.tsx
    └── ActivityFeed.tsx
lib/
├── supabase/
│   ├── client.ts                   ← Browser client
│   ├── server.ts                   ← Server client (RSC)
│   └── middleware.ts
├── hooks/
│   ├── useClients.ts
│   ├── useDeals.ts
│   └── useTasks.ts
└── utils/
    ├── formatCurrency.ts
    └── dateHelpers.ts
```

### Supabase Database Schema

```sql
-- WORKSPACES
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  created_at timestamptz default now()
);

-- WORKSPACE MEMBERS
create table workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('owner','member','viewer')) default 'member',
  invited_by uuid references auth.users(id),
  joined_at timestamptz default now(),
  unique(workspace_id, user_id)
);

-- CLIENTS
create table clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  website text,
  location text,
  status text check (status in ('lead','active','inactive')) default 'lead',
  tags text[] default '{}',
  avatar_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PIPELINE STAGES
create table pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  position integer not null,
  color text default '#6b7280'
);

-- DEALS
create table deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  stage_id uuid references pipeline_stages(id),
  title text not null,
  value numeric(12,2) default 0,
  currency text default 'INR',
  probability integer default 50 check (probability between 0 and 100),
  close_date date,
  status text check (status in ('open','won','lost')) default 'open',
  lost_reason text,
  assigned_to uuid references auth.users(id),
  position integer default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NOTES
create table notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  deal_id uuid references deals(id) on delete set null,
  content text not null,
  is_pinned boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TASKS
create table tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  deal_id uuid references deals(id) on delete set null,
  title text not null,
  description text,
  due_date date,
  priority text check (priority in ('low','medium','high')) default 'medium',
  status text check (status in ('todo','inprogress','done')) default 'todo',
  assigned_to uuid references auth.users(id),
  created_by uuid references auth.users(id),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ACTIVITY LOG
create table activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id),
  entity_type text, -- 'client' | 'deal' | 'task' | 'note'
  entity_id uuid,
  action text,      -- 'created' | 'updated' | 'deleted' | 'stage_changed'
  meta jsonb,       -- { from_stage: 'Lead', to_stage: 'Proposal' }
  created_at timestamptz default now()
);

-- INVITE TOKENS
create table invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  email text not null,
  role text default 'member',
  token text unique not null,
  invited_by uuid references auth.users(id),
  accepted_at timestamptz,
  expires_at timestamptz default now() + interval '7 days',
  created_at timestamptz default now()
);
```

### Row Level Security (RLS) Pattern

```sql
-- Enable RLS on all tables
alter table clients enable row level security;

-- Members can only see their workspace's clients
create policy "workspace_isolation" on clients
  for all using (
    workspace_id in (
      select workspace_id from workspace_members
      where user_id = auth.uid()
    )
  );
```

### Key Supabase Features Used

| Feature | Usage |
|---|---|
| **Auth** | Email/password + Google OAuth + invite tokens |
| **Postgres** | All data: clients, deals, tasks, notes |
| **Row Level Security** | Workspace isolation — users only see their data |
| **Realtime** | Live pipeline updates when teammates move deals |
| **Storage** | Client avatars, workspace logos |
| **Edge Functions** | Daily email digest for overdue tasks |

---

## 🗺️ Phase-wise Roadmap

Each phase = one focused prompt session. Copy the prompt, paste into your vibe coding tool (Cursor, v0, Claude), and ship.

---

### ⚡ PHASE 0 — Project Bootstrap (30 min)

**Goal:** Working Next.js app deployed to Vercel with Supabase connected.

**Prompt to use:**
```
Create a new Next.js 15 project with TypeScript, Tailwind CSS, and App Router.
Install and configure:
- shadcn/ui (with New York style, zinc color scheme)
- @supabase/ssr and @supabase/supabase-js
- Create lib/supabase/client.ts (browser client)
- Create lib/supabase/server.ts (server component client using cookies)
- Create middleware.ts that refreshes Supabase session on every request
- Add .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Create a placeholder app/(app)/dashboard/page.tsx that shows "Dashboard coming soon"
- Create a placeholder app/(auth)/login/page.tsx that shows "Login coming soon"
- Push to GitHub and deploy to Vercel
```

**Deliverable:** `https://clientpulse.vercel.app` is live, even if empty.

---

### 🔐 PHASE 1 — Auth & Workspace Setup (45 min)

**Goal:** Users can sign up, log in, create a workspace, and be gated behind auth.

**Prompt 1.1 — Supabase Schema:**
```
Run this SQL in my Supabase project SQL editor to create the auth tables:

[paste workspaces, workspace_members, invites tables from schema above]

Also enable RLS on workspaces and workspace_members with a policy that only lets
users see workspaces they are members of.
```

**Prompt 1.2 — Auth Pages:**
```
Build the Login and Signup pages for ClientPulse CRM using:
- Next.js 15 App Router at app/(auth)/login/page.tsx and app/(auth)/signup/page.tsx
- Supabase Auth with email/password
- shadcn/ui Card, Input, Button, Label components
- On signup: after creating user, redirect to /onboarding
- On login: redirect to /dashboard
- Show loading spinner on form submit
- Show error messages inline below the form
- Clean minimal design — white card on a light gray background, no sidebar
```

**Prompt 1.3 — Onboarding & Workspace:**
```
Build an onboarding page at app/onboarding/page.tsx for ClientPulse CRM.

It should:
- Only show if the user has no workspace yet (check workspace_members table)
- Show a form asking for: Workspace Name (required), Your Name (required)
- On submit: create a workspace row, add the user as 'owner' in workspace_members,
  update auth.users metadata with display_name
- Redirect to /dashboard on success
- Use shadcn/ui components, centered card layout
```

**Prompt 1.4 — Auth Middleware Guard:**
```
Update middleware.ts to:
- Redirect unauthenticated users to /login for any /dashboard, /clients,
  /pipeline, /tasks, /settings routes
- Redirect authenticated users away from /login and /signup to /dashboard
- Redirect authenticated users with no workspace to /onboarding
- Use Supabase SSR session checking
```

---

### 🏗️ PHASE 2 — App Shell & Navigation (30 min)

**Goal:** Persistent sidebar layout with all main sections navigable.

**Prompt 2.1 — Sidebar Layout:**
```
Build the main app layout for ClientPulse CRM at app/(app)/layout.tsx.

It should have:
- A fixed left sidebar (240px wide) with:
  - ClientPulse logo/wordmark at the top
  - Nav links: Dashboard, Clients, Pipeline, Tasks — each with a lucide-react icon
  - Active link highlighted with a subtle bg color
  - At the bottom: workspace name, user avatar (initials), and a Settings link
- A main content area that takes remaining width
- The layout fetches the current workspace from Supabase server-side
- Mobile-responsive: sidebar collapses to a hamburger menu on small screens
- Use shadcn/ui components, clean minimal design with a white/zinc color scheme
```

---

### 👥 PHASE 3 — Client Management (60 min)

**Goal:** Full CRUD for clients with search, filter, and detail page.

**Prompt 3.1 — Clients Table & RLS:**
```
Run this SQL to create the clients table with RLS:
[paste clients table SQL + RLS policy from schema above]
```

**Prompt 3.2 — Client List Page:**
```
Build the Clients list page at app/(app)/clients/page.tsx for ClientPulse CRM.

Features:
- Server component that fetches all clients for the current workspace from Supabase
- Display clients in a clean table with columns: Avatar (initials), Name, Company,
  Email, Status badge (Lead/Active/Inactive), Tags, Created date
- "Add Client" button that opens a shadcn/ui Sheet (slide-over panel) with the add form
- Client name is clickable and links to /clients/[id]
- Search bar that filters clients by name or email (client-side filter)
- Filter dropdown for Status
- Empty state with an illustration and "Add your first client" CTA
- Status badges colored: Lead=blue, Active=green, Inactive=gray
```

**Prompt 3.3 — Add/Edit Client Form:**
```
Build a ClientForm component for ClientPulse CRM used in a Sheet slide-over.

Fields:
- Name (required), Company, Email, Phone, Website, Location
- Status: select between Lead / Active / Inactive
- Tags: multi-input where user types a tag and presses Enter to add it, shown as
  removable badges

Behavior:
- Uses react-hook-form + zod validation
- Supabase insert on create, update on edit
- Shows loading state on submit button
- Calls onSuccess() prop which closes the Sheet and refreshes the client list
- Works for both creating a new client and editing an existing one (receives client prop)
```

**Prompt 3.4 — Client Detail Page:**
```
Build the Client detail page at app/(app)/clients/[id]/page.tsx for ClientPulse CRM.

Layout:
- Header: client avatar (large initials), name, company, status badge, Edit button,
  Archive button
- Contact info row: email, phone, website, location (with icons)
- Below: 4 tabs using shadcn/ui Tabs: Overview | Deals | Notes | Tasks

Overview tab:
- Key stats: Total deal value, Open deals count, Tasks due this week
- Recent activity feed (last 10 activity log entries for this client)

Deals tab:
- List of deals linked to this client
- Each deal shows: title, stage badge, value, close date, assigned to
- "Add Deal" button

Notes tab:
- List of notes with author, timestamp, content
- Quick note form at top (textarea + Save button)
- Pinned notes shown first

Tasks tab:
- List of tasks with: title, due date, priority badge, status, assigned to
- Overdue tasks highlighted
- "Add Task" button
```

---

### 💼 PHASE 4 — Deal Pipeline (60 min)

**Goal:** Drag-and-drop Kanban board with real-time updates.

**Prompt 4.1 — Pipeline Schema:**
```
Run this SQL:
[paste pipeline_stages and deals tables + RLS from schema above]

Also insert default stages for the current workspace:
Lead (position 1), Proposal (position 2), Negotiation (position 3),
Won (position 4), Lost (position 5)
```

**Prompt 4.2 — Kanban Board:**
```
Build the Pipeline Kanban board at app/(app)/pipeline/page.tsx for ClientPulse CRM.

Requirements:
- Fetch all pipeline stages and deals for the workspace from Supabase
- Use @dnd-kit/core and @dnd-kit/sortable for drag-and-drop
- Each column shows: stage name, total deal count, total value sum in header
- Deal cards show: deal title, client name, value, close date, probability %,
  assigned user avatar
- Clicking a deal card opens a shadcn/ui Sheet with the DealPanel (full deal details)
- "Add Deal" button in each column header → opens an inline quick-add form in that column
- When a card is dropped into a new column: update deal's stage_id in Supabase instantly
- Filter bar at top: filter by assigned user, close date range
- Won/Lost stages are visually distinct (green/red tinted header)
- Empty column state shows "No deals" placeholder
```

**Prompt 4.3 — Deal Detail Panel:**
```
Build a DealPanel component for ClientPulse CRM displayed in a Sheet slide-over.

It should show and allow editing of:
- Title (inline editable)
- Client (linked, clickable)
- Stage selector (dropdown to move between stages)
- Value and currency
- Probability % slider
- Close date picker
- Assigned to (select team member)
- Status: Open / Won / Lost — with a "Mark Won" and "Mark Lost" button
- When marking Lost: show a small reason textarea
- Notes section (add/view notes)
- Tasks section (add/view tasks)
- Activity log for this deal at the bottom

All edits auto-save to Supabase on blur/change with a subtle "Saved ✓" toast
```

**Prompt 4.4 — Realtime Kanban:**
```
Add Supabase Realtime to the Pipeline Kanban board in ClientPulse CRM.

When any team member moves a deal card or creates a new deal:
- All other users on the same workspace see the board update instantly
- Use Supabase's postgres_changes subscription on the deals table
- Filter by workspace_id so users only get their workspace's updates
- Show a subtle animated indicator when a card moves on another user's action
```

---

### 📝 PHASE 5 — Notes & Tasks (45 min)

**Goal:** Notes and tasks work globally and inside client/deal detail pages.

**Prompt 5.1 — Notes & Tasks Schema:**
```
Run this SQL:
[paste notes and tasks tables + RLS from schema above]
```

**Prompt 5.2 — Task Management Page:**
```
Build the Tasks page at app/(app)/tasks/page.tsx for ClientPulse CRM.

Layout has two sections:
1. "Today" section — tasks with due_date = today
2. "Upcoming" section — tasks due in next 7 days
3. "Overdue" section — tasks past due date and not done (shown in red)

Each task item shows:
- Checkbox to mark complete (with strikethrough animation on check)
- Task title, priority badge (High=red, Medium=yellow, Low=gray)
- Linked client name (clickable) and linked deal name if any
- Due date, assigned to avatar
- On hover: edit and delete icon buttons

Filter bar: All / My Tasks / Assigned to others
"Add Task" button opens a shadcn/ui Dialog with the task form

Task form fields: Title, Description, Client (searchable select), Deal (dependent on client),
Due Date, Priority, Assign To
```

**Prompt 5.3 — NoteEditor Component:**
```
Build a NoteEditor component for ClientPulse CRM.

It should:
- Show existing notes in a clean list sorted by pinned first, then newest
- Each note: author avatar + name, relative timestamp (e.g. "2 hours ago"),
  content text, pin/unpin button, delete button
- Quick compose area at the top: a textarea that expands on focus, with a
  "Save Note" button and Cmd+Enter keyboard shortcut
- Optimistic UI: note appears immediately before Supabase confirms
- Accept clientId and/or dealId as props and filter accordingly
- Handle empty state with "No notes yet" message
```

---

### 📊 PHASE 6 — Dashboard & Analytics (45 min)

**Goal:** Beautiful data-rich dashboard that shows what matters today.

**Prompt 6.1 — Dashboard Page:**
```
Build the Dashboard page at app/(app)/dashboard/page.tsx for ClientPulse CRM.

All data is fetched server-side from Supabase.

Top row — 4 stat cards:
- Total Pipeline Value (sum of open deal values)
- Deals Closing This Month (count + total value)
- Tasks Due Today (count, overdue shown in red)
- Win Rate % (won / total closed deals × 100)

Middle row:
- Left (60%): "Today's Focus" — list of tasks due today and deals with close_date today
- Right (40%): "Recent Activity" — last 15 activity log entries with actor name,
  action description, and timestamp

Bottom row:
- Left: Deal Conversion Funnel — horizontal bar chart using recharts showing deal count
  per stage
- Right: Top 5 Clients by Pipeline Value — simple ranked list with progress bars

Use shadcn/ui Card components for each section, clean data visualization
```

---

### 👨‍👩‍👧 PHASE 7 — Team & Settings (30 min)

**Goal:** Invite team members and customize workspace.

**Prompt 7.1 — Settings Pages:**
```
Build the Settings section for ClientPulse CRM.

app/(app)/settings/page.tsx — Workspace Settings:
- Edit workspace name and upload logo (Supabase Storage)
- Timezone selector
- Danger zone: Delete workspace (with confirmation dialog)

app/(app)/settings/team/page.tsx — Team Management:
- Table of current members: avatar, name, email, role badge, joined date
- "Invite Member" button → Dialog with email input + role selector (Member/Viewer)
- On invite: generate a unique token, store in invites table, send email via
  Supabase Edge Function
- Pending invites section showing email + expiry + Revoke button
- Remove member button (owners only)
- Transfer ownership option

app/(app)/settings/pipeline/page.tsx — Pipeline Stages:
- Drag to reorder stages
- Rename stages inline
- Add new stage with name and color picker
- Delete stage (with warning if deals exist in it)
```

**Prompt 7.2 — Invite Accept Flow:**
```
Build the invite acceptance flow for ClientPulse CRM.

app/(auth)/invite/[token]/page.tsx:
- Fetch invite by token from Supabase (server component)
- If token expired or already accepted: show error state
- If user is not logged in: show signup/login form first, then accept
- If user is logged in: show workspace name + "Accept Invitation" button
- On accept: add user to workspace_members, mark invite as accepted, redirect to /dashboard
```

---

### 🔔 PHASE 8 — Notifications & Polish (30 min)

**Goal:** Notification bell, email digests, and final UX polish.

**Prompt 8.1 — In-App Notifications:**
```
Add an in-app notification bell to the ClientPulse CRM header.

Create a notifications table in Supabase:
- id, workspace_id, user_id (recipient), actor_id, type (task_assigned, mentioned),
  entity_type, entity_id, read boolean, created_at

Bell icon in header shows unread count badge.
Click opens a Popover with:
- Unread notifications at top, read below
- Each notification: actor avatar, description ("Alex assigned you a task"), timestamp
- Click notification: mark as read + navigate to entity
- "Mark all read" button

Generate notifications server-side when:
- A task is assigned to someone (create notification for assignee)
- A deal is assigned to someone
```

**Prompt 8.2 — Daily Email Digest:**
```
Create a Supabase Edge Function called daily-digest for ClientPulse CRM.

It runs on a cron schedule (every day at 8:00 AM IST).

For each workspace member:
- Query their overdue tasks (not done, due_date < today)
- Query their tasks due today
- If either list is non-empty: send an email via Supabase's built-in SMTP

Email content:
- Subject: "Your ClientPulse digest for [date]"
- Overdue tasks section (if any)
- Today's tasks section
- Link to open the app

Use the Deno runtime and Resend or Supabase email
```

**Prompt 8.3 — UX Polish:**
```
Polish the ClientPulse CRM app with these improvements:

1. Add a global Command Palette (Cmd+K) using cmdk library:
   - Search clients by name
   - Search deals by title
   - Quick actions: Add Client, Add Deal, Add Task

2. Add keyboard shortcuts:
   - N = Quick add note (opens modal)
   - T = Add task
   - ? = Show shortcuts help dialog

3. Add loading skeletons (shadcn/ui Skeleton) on:
   - Client list while fetching
   - Pipeline board while fetching
   - Dashboard stats while fetching

4. Add toast notifications (shadcn/ui Sonner) for:
   - Client created/updated/archived
   - Deal stage changed
   - Task marked complete
   - Note saved

5. Add a "Back to top" button on long client lists
6. Confirm dialogs before delete actions
7. Empty states with helpful CTAs on every list page
```

---

### 🚀 PHASE 9 — Deployment & Production (15 min)

**Prompt 9.1 — Production Checklist:**
```
Prepare ClientPulse CRM for production deployment on Vercel.

1. Create a vercel.json with:
   - Build command and output directory settings
   - Environment variable references

2. Update next.config.ts:
   - Add Supabase storage domain to images.remotePatterns for avatar images
   - Enable React strict mode

3. Create a .env.example file documenting all required environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (for edge functions)
   - RESEND_API_KEY (for emails)

4. Add a seed.sql script that creates default pipeline stages when a new workspace is created

5. Create a GitHub Actions workflow that runs next build on every PR to catch build errors

6. Add a /healthcheck route that returns { status: 'ok', timestamp } for uptime monitoring
```

---

## 📅 6-Hour Hackathon Sprint Plan

If you're building this in a single hackathon session, here's the cutdown plan:

| Time | Phase | What to Ship |
|---|---|---|
| 0:00–0:30 | Phase 0 | Bootstrap + Vercel deploy |
| 0:30–1:15 | Phase 1 | Auth + Workspace creation |
| 1:15–1:45 | Phase 2 | App shell + sidebar nav |
| 1:45–2:45 | Phase 3 | Client list + add/edit form |
| 2:45–3:45 | Phase 4 | Kanban pipeline + deal cards |
| 3:45–4:15 | Phase 5 | Notes + Tasks (basic) |
| 4:15–4:45 | Phase 6 | Dashboard with stats |
| 4:45–5:15 | Phase 7 | Team invite (basic) |
| 5:15–5:45 | Phase 8 | Polish + toasts + skeletons |
| 5:45–6:00 | Phase 9 | Final deploy + demo prep |

**MVP Scope (must-haves for demo):** Auth → Workspace → Add Client → Kanban Pipeline → Tasks Today → Dashboard Stats

**Cut if short on time:** Team invites, email digest, command palette, notifications

---

## 🧰 Dependencies to Install

```bash
npx create-next-app@latest clientpulse --typescript --tailwind --app
cd clientpulse

# Supabase
npm install @supabase/ssr @supabase/supabase-js

# UI
npx shadcn@latest init
npx shadcn@latest add button card input label sheet dialog tabs badge
npx shadcn@latest add select textarea toast sonner skeleton avatar
npx shadcn@latest add command popover dropdown-menu separator

# DnD for Kanban
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Charts
npm install recharts

# Date handling
npm install date-fns

# Icons (included with shadcn but explicit)
npm install lucide-react
```

---

## 🎯 Demo Script (for judges)

1. **Sign up** → create workspace "Pixel Agency"
2. **Add 3 clients** → "Nike", "Spotify", "Airbnb"
3. **Show Pipeline** → drag Nike deal from Lead → Proposal → Negotiation
4. **Add a note** on Nike client: "Had a great discovery call today"
5. **Add a task** due today: "Send proposal to Nike"
6. **Show Dashboard** → see pipeline value, win rate, today's tasks
7. **Invite a teammate** → show team settings
8. **Show realtime** → open two browser windows, move a card in one, watch it move in the other

**Key talking points:**
- Built in 6 hours with Next.js, Supabase, and Vercel
- Real-time collaboration across team members
- Row-level security ensures teams never see each other's data
- Production-ready: auth, RLS, edge functions, Vercel deployment
