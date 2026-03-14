# ClientPulse CRM — Feature List & Execution Plan

**Source:** ClientPulse CRM Blueprint (Hackathon Edition)  
**Stack reference:** Next.js 15 · Supabase · Vercel · shadcn/ui

---

## Product vision

Lightweight CRM for **freelancers and small agencies**: track clients, deal pipelines, notes, follow-up tasks, and team collaboration in one fast web app.

**Target users:** Freelancers, design/dev agencies, consultants (1–20 person teams).

---

## Complete feature list

### Auth & workspace

| # | Feature |
|---|--------|
| 1 | Email/password signup & login (Supabase Auth) |
| 2 | Google OAuth login |
| 3 | Workspace creation on first login (org name, slug) |
| 4 | Invite team members via email link (7-day expiry token) |
| 5 | Role-based access: Owner / Member / Viewer |
| 6 | User profile with avatar and display name |

### Client management

| # | Feature |
|---|--------|
| 1 | Create / edit / archive client profiles |
| 2 | Fields: Name, Company, Email, Phone, Website, Location, Tags |
| 3 | Status: Active / Inactive / Lead (colored badges) |
| 4 | Search and filter by name, tag, status |
| 5 | Client detail page: Overview, Deals, Notes, Tasks, Activity |
| 6 | Client activity timeline (all interactions) |

### Deal pipeline

| # | Feature |
|---|--------|
| 1 | Kanban board with drag-and-drop |
| 2 | Default stages: Lead → Proposal → Negotiation → Won → Lost |
| 3 | Custom stages (add / rename / reorder / delete) |
| 4 | Deal fields: Title, Client, Value (INR/USD), Stage, Close Date, Probability % |
| 5 | Deal cards: value + due date on board |
| 6 | Deal detail side panel (no full navigation away) |
| 7 | Filter by team member, date range, value |
| 8 | Won/Lost with reason |
| 9 | Stage value totals on board header |
| 10 | Supabase Realtime — live board sync |

### Notes

| # | Feature |
|---|--------|
| 1 | Rich text notes per client and per deal |
| 2 | Quick note composer (⌘/Cmd+N) |
| 3 | Timestamps + author name and avatar |
| 4 | Pin important notes |
| 5 | Notes on client activity timeline |
| 6 | Search notes across clients |

### Follow-up tasks

| # | Feature |
|---|--------|
| 1 | Tasks linked to client or deal |
| 2 | Title, Due Date, Priority (H/M/L), Assigned To |
| 3 | Status: To Do / In Progress / Done |
| 4 | Today view (tasks due today) |
| 5 | Overdue highlighted on dashboard |
| 6 | Assign to any workspace member |
| 7 | Lists: per client, per deal, global “My Tasks” |

### Dashboard & analytics

| # | Feature |
|---|--------|
| 1 | Daily briefing: today’s tasks, deals closing soon |
| 2 | Revenue pipeline total (active deals) |
| 3 | Win rate % (Won / total closed) |
| 4 | Deal conversion funnel (Recharts) |
| 5 | Recent activity feed (~15 entries) |
| 6 | Top clients by deal value |
| 7 | Monthly revenue trend line |

### Team collaboration

| # | Feature |
|---|--------|
| 1 | Shared workspace (clients, deals, tasks) |
| 2 | Activity log / audit trail |
| 3 | @mentions in notes |
| 4 | Task assignment + in-app + email notification |
| 5 | Daily email digest (overdue tasks) via Edge Function |

---

## Phase-wise execution plan

Each phase ≈ one focused build session. Order is tuned so you have a **deployed, authenticated app after Phase 1**.

### Phase 0 — Project bootstrap (~30 min)

**Goal:** Next.js app on Vercel with Supabase wired up.

| Step | Prompt topic |
|------|----------------|
| 1.0 | Create Next.js 15 + TypeScript + Tailwind + App Router |
| 2.0 | Install & configure `@supabase/ssr`, shadcn/ui (New York, zinc) |
| 3.0 | `lib/supabase/client.ts` (browser) + `server.ts` (RSC) |
| 4.0 | `middleware.ts` — session refresh on each request |
| 5.0 | Placeholder dashboard + login pages |
| 6.0 | GitHub → Vercel — live URL |

**Deliverable:** Live URL (even if placeholders only).

---

### Phase 1 — Auth & workspace (~45 min)

**Goal:** Sign up, login, workspace creation, route guards.

| Step | Prompt topic |
|------|----------------|
| 1.1 | SQL: `workspaces`, `workspace_members`, `invites` + RLS |
| 2.1 | RLS workspace isolation on auth-related tables |
| 3.1 | Login + Signup (shadcn Card + Supabase Auth) |
| 4.1 | Onboarding — create workspace, user as owner |
| 5.1 | Middleware: guard app routes; no workspace → onboarding |

---

### Phase 2 — App shell & navigation (~30 min)

**Goal:** Sidebar layout; all main sections reachable.

| Step | Prompt topic |
|------|----------------|
| 1.2 | `app/(app)/layout.tsx` — fixed ~240px sidebar |
| 2.2 | Nav: Dashboard, Clients, Pipeline, Tasks (lucide-react) |
| 3.2 | Workspace name + user avatar + Settings |
| 4.2 | Mobile: hamburger / collapse |
| 5.2 | Sidebar loading skeleton |

---

### Phase 3 — Client management (~60 min)

**Goal:** Full client CRUD, search, filter, detail.

| Step | Prompt topic |
|------|----------------|
| 1.3 | `clients` table + `tags[]` + RLS |
| 2.3 | Client list — table, avatar, status, tags |
| 3.3 | ClientForm in Sheet — react-hook-form + zod |
| 4.3 | Client detail — tabs: Overview, Deals, Notes, Tasks |
| 5.3 | Search (name/email) + status filter |
| 6.3 | Empty state + “Add first client” CTA |

---

### Phase 4 — Deal pipeline / Kanban (~60 min)

**Goal:** DnD board + realtime.

| Step | Prompt topic |
|------|----------------|
| 1.4 | `pipeline_stages`, `deals` + RLS |
| 2.4 | Seed default stages: Lead … Lost |
| 3.4 | Kanban with `@dnd-kit/core` + sortable |
| 4.4 | Cards: title, client, value, dates, probability, assignee |
| 5.4 | DealPanel Sheet — edit, auto-save on blur |
| 6.4 | Won/Lost + reason; notes/tasks in panel |
| 7.4 | Supabase Realtime subscription for board |

---

### Phase 5 — Notes & tasks (~45 min)

**Goal:** Notes and tasks globally and on client/deal.

| Step | Prompt topic |
|------|----------------|
| 1.5 | `notes`, `tasks` tables + RLS |
| 2.5 | NoteEditor — pinned first, Cmd+Enter compose |
| 3.5 | Tasks page: Today / Upcoming / Overdue |
| 4.5 | Task row — complete animation, priority, assignee |
| 5.5 | Task dialog: title, client, deal, due, priority, assign |
| 6.5 | Global “My Tasks” filter |

---

### Phase 6 — Dashboard & analytics (~45 min)

**Goal:** Single screen for “what matters today.”

| Step | Prompt topic |
|------|----------------|
| 1.6 | Dashboard RSC — parallel data fetch |
| 2.6 | Stat cards: pipeline value, closing this month, tasks today, win rate |
| 3.6 | “Today’s focus” — tasks + deals due today |
| 4.6 | Recent activity — last 15 log lines |
| 5.6 | Funnel chart (Recharts) by stage |
| 6.6 | Top 5 clients by pipeline value |

---

### Phase 7 — Team & settings (~30 min)

**Goal:** Invites + workspace customization.

| Step | Prompt topic |
|------|----------------|
| 1.7 | Settings → Workspace: name, logo (Storage) |
| 2.7 | Settings → Team: members, invite (email + role), pending |
| 3.7 | Invite token + Edge Function email |
| 4.7 | `/invite/[token]` — expired / used handling |
| 5.7 | Settings → Pipeline: reorder, rename, add, delete stages |

---

### Phase 8 — Notifications & polish (~30 min)

**Goal:** Bell, digests, UX polish.

| Step | Prompt topic |
|------|----------------|
| 1.8 | `notifications` table; create on assign events |
| 2.8 | Header bell + unread badge + Popover |
| 3.8 | Edge Function: daily digest ~8 AM IST |
| 4.8 | Command palette (cmdk) — search + quick actions |
| 5.8 | Skeletons on lists/board; toasts on CRUD |
| 6.8 | Shortcuts (N/T/?); confirm before deletes |

---

### Phase 9 — Deployment & production (~15 min)

**Goal:** Production-ready Vercel deploy.

| Step | Prompt topic |
|------|----------------|
| 1.9 | `vercel.json` + env references |
| 2.9 | `next.config` — Supabase Storage in `images.remotePatterns` |
| 3.9 | `.env.example` (URL, ANON, SERVICE_ROLE, RESEND, …) |
| 4.9 | `seed.sql` — default stages per new workspace |
| 5.9 | GitHub Actions — `next build` on PR |
| 6.9 | `/healthcheck` — `{ status, timestamp }` |

---

## 6-hour hackathon sprint

| Time | Phase | Deliverable |
|------|--------|-------------|
| 0:00–0:30 | 0 Bootstrap | Next + Supabase + Vercel URL |
| 0:30–1:15 | 1 Auth | Signup, login, workspace, guards |
| 1:15–1:45 | 2 Shell | Sidebar, mobile |
| 1:45–2:45 | 3 Clients | List, form, detail |
| 2:45–3:45 | 4 Pipeline | Kanban + DnD |
| 3:45–4:15 | 5 Notes/Tasks | Notes + Today tasks |
| 4:15–4:45 | 6 Dashboard | Stats + activity + funnel |
| 4:45–5:15 | 7 Team | Basic invite |
| 5:15–5:45 | 8 Polish | Toasts, skeletons |
| 5:45–6:00 | 9 Deploy | Final deploy + demo prep |

### MVP must-haves for demo

**Include:** Auth → workspace → add client → Kanban DnD → tasks today → dashboard stats.  
**Defer if short on time:** Team invites, email digest, command palette, in-app notifications.

---

## Install commands (reference)

```bash
# Bootstrap
npx create-next-app@latest clientpulse --typescript --tailwind --app
cd clientpulse

# Supabase
npm install @supabase/ssr @supabase/supabase-js

# UI (shadcn)
npx shadcn@latest init   # New York | zinc | CSS variables
npx shadcn@latest add button card input label sheet dialog tabs badge
npx shadcn@latest add select textarea sonner skeleton avatar command popover

# Kanban
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Forms
npm install react-hook-form zod @hookform/resolvers

# Charts & dates
npm install recharts date-fns lucide-react
```

---

## 5-minute demo script (judges)

| # | Step | Show |
|---|------|------|
| 1 | Sign up | Account → workspace “Pixel Agency” → dashboard |
| 2 | Clients | Nike (Active), Spotify (Lead), Airbnb (Active) + tags |
| 3 | Pipeline | Drag deal Lead → Proposal → Negotiation |
| 4 | Notes | Client note: “Great discovery call today” |
| 5 | Task | “Send proposal to Nike” due today → Today view |
| 6 | Dashboard | Pipeline value, win rate, today tasks, activity |
| 7 | Realtime | Two browsers — move card, watch sync |
| 8 | Team | Settings → Team → email invite |

**Talking points:** Next.js + Supabase + Vercel; Realtime collaboration; RLS workspace isolation; Edge functions + serverless; minimal custom backend.
