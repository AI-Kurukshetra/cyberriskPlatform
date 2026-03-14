# ClientPulse CRM — Development Phases

Use this file **phase-by-phase** while building. Check boxes as you finish.  
**Full SQL + long prompts:** see `clientpulse-roadmap.md`.

**Rule:** Do not start phase **N+1** until phase **N** deliverable is done (unless noted).

---

## Phase overview

| Phase | Name | ~Time | Done |
|-------|------|-------|------|
| 0 | Bootstrap | 30m | [ ] |
| 1 | Auth & workspace | 45m | [ ] |
| 2 | App shell & nav | 30m | [ ] |
| 3 | Clients | 60m | [ ] |
| 4 | Pipeline (Kanban) | 60m | [ ] |
| 5 | Notes & tasks | 45m | [ ] |
| 6 | Dashboard | 45m | [ ] |
| 7 | Team & settings | 30m | [ ] |
| 8 | Notifications & polish | 30m | [ ] |
| 9 | Production | 15m | [ ] |

---

## PHASE 0 — Project bootstrap (~30 min)

**Goal:** Next.js 15 + Supabase clients + middleware + placeholders + Vercel live.

### Checklist

- [ ] Next.js 15, TypeScript, Tailwind, App Router
- [ ] shadcn/ui (New York, zinc)
- [ ] `@supabase/ssr` + `@supabase/supabase-js`
- [ ] `lib/supabase/client.ts` (browser)
- [ ] `lib/supabase/server.ts` (cookies / RSC)
- [ ] `middleware.ts` — refresh session every request
- [ ] `.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `app/(app)/dashboard/page.tsx` — placeholder
- [ ] `app/(auth)/login/page.tsx` — placeholder
- [ ] GitHub + Vercel deploy

**Deliverable:** Public URL loads; login/dashboard placeholders OK.

### Cursor prompt (paste)

```
Create Next.js 15 + TypeScript + Tailwind + App Router. Add shadcn/ui (New York, zinc).
Add @supabase/ssr: lib/supabase/client.ts, server.ts, middleware.ts for session refresh.
.env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.
Placeholder pages: app/(app)/dashboard/page.tsx, app/(auth)/login/page.tsx.
```

---

## PHASE 1 — Auth & workspace (~45 min)

**Goal:** Sign up / log in / onboarding workspace / route guards.

### Checklist

- [ ] Supabase SQL: `workspaces`, `workspace_members`, `invites` + RLS (see roadmap schema)
- [ ] Login + Signup pages — email/password, errors, loading
- [ ] Signup → `/onboarding`; Login → `/dashboard`
- [ ] Onboarding: workspace name + display name → create workspace + owner member
- [ ] Middleware: unauthenticated → `/login` for app routes; no workspace → `/onboarding`

**Deliverable:** New user can register, create workspace, reach dashboard.

### Cursor prompts (order)

1. **Schema:** Paste SQL for workspaces, workspace_members, invites + RLS from `clientpulse-roadmap.md`.
2. **Auth UI:** Login/signup with shadcn Card, Supabase Auth.
3. **Onboarding:** `app/onboarding/page.tsx` — only if zero workspace_members rows.
4. **Middleware:** Guard `/dashboard`, `/clients`, `/pipeline`, `/tasks`, `/settings`.

---

## PHASE 2 — App shell & navigation (~30 min)

**Goal:** Persistent layout: sidebar, nav, mobile, workspace context.

### Checklist

- [ ] `app/(app)/layout.tsx` — ~240px sidebar
- [ ] Nav: Dashboard, Clients, Pipeline, Tasks (+ icons)
- [ ] Active route styling
- [ ] Footer: workspace name, avatar, Settings
- [ ] Mobile hamburger / collapsible sidebar
- [ ] Optional: sidebar skeleton while loading workspace

**Deliverable:** All main routes reachable from shell.

### Cursor prompt (paste)

```
app/(app)/layout.tsx: fixed 240px sidebar, nav Dashboard/Clients/Pipeline/Tasks (lucide),
active state, bottom workspace + avatar + Settings, mobile hamburger, server-fetch workspace.
```

---

## PHASE 3 — Client management (~60 min)

**Goal:** Client CRUD, list, search/filter, detail tabs.

### Checklist

- [ ] `clients` table + RLS (workspace isolation)
- [ ] `app/(app)/clients/page.tsx` — table, Add Client Sheet
- [ ] ClientForm — rhf + zod; tags; create + edit
- [ ] `app/(app)/clients/[id]/page.tsx` — header, tabs: Overview, Deals, Notes, Tasks
- [ ] Search (name/email), status filter, empty state
- [ ] Archive client (optional this phase)

**Deliverable:** Full client lifecycle from list to detail.

### Cursor prompts

1. SQL: `clients` + RLS (roadmap).
2. List page + Sheet form.
3. Detail page + tabs (Notes/Tasks can be minimal until Phase 5).

---

## PHASE 4 — Deal pipeline (~60 min)

**Goal:** Kanban + DealPanel + default stages + Realtime.

### Checklist

- [ ] `pipeline_stages`, `deals` + RLS
- [ ] Seed stages: Lead → Proposal → Negotiation → Won → Lost
- [ ] `app/(app)/pipeline/page.tsx` — @dnd-kit, columns, cards
- [ ] Drop → update `stage_id` (and order if needed)
- [ ] DealPanel Sheet — edit fields, Won/Lost + reason
- [ ] Realtime subscription on `deals` for workspace

**Deliverable:** Drag deals; teammates see updates live.

### Cursor prompts

1. SQL: stages + deals + RLS; insert default stages per workspace.
2. Kanban UI + Supabase updates on drag.
3. DealPanel + Realtime `postgres_changes`.

---

## PHASE 5 — Notes & tasks (~45 min)

**Goal:** Global tasks page + notes/tasks on client/deal.

### Checklist

- [ ] `notes`, `tasks` + RLS
- [ ] Tasks page: Today / Upcoming / Overdue + My Tasks filter
- [ ] Task dialog: client, deal, due, priority, assignee
- [ ] NoteEditor: pin, Cmd+Enter, list by client/deal
- [ ] Wire client detail tabs to real notes/tasks

**Deliverable:** Tasks and notes usable app-wide.

### Cursor prompts

1. SQL: notes + tasks + RLS.
2. Tasks page + task form Dialog.
3. NoteEditor component; reuse on client + DealPanel.

---

## PHASE 6 — Dashboard & analytics (~45 min)

**Goal:** One screen for pipeline value, today, win rate, activity, charts.

### Checklist

- [ ] Stat cards: pipeline value, closing this month, tasks today, win rate
- [ ] Today’s focus (tasks + deals due today)
- [ ] Recent activity (~15 rows)
- [ ] Funnel chart (Recharts) by stage
- [ ] Top clients by pipeline value

**Deliverable:** Dashboard is demo-ready.

### Cursor prompt (paste)

```
dashboard/page.tsx: server-fetch Supabase; 4 stat cards; Today's Focus; Recent Activity;
Recharts funnel by stage; top 5 clients by open deal value. shadcn Cards.
```

---

## PHASE 7 — Team & settings (~30 min)

**Goal:** Workspace settings, team invites, pipeline stage editor.

### Checklist

- [ ] Settings: workspace name, logo (Storage), timezone
- [ ] Team: members table, invite dialog, pending invites, revoke
- [ ] Edge Function or API: send invite email (token in `invites`)
- [ ] `invite/[token]/page.tsx` — accept / expired / already used
- [ ] Settings → Pipeline: reorder, rename, add, delete stages

**Deliverable:** Invite flow works end-to-end (email can be stubbed first).

---

## PHASE 8 — Notifications & polish (~30 min)

**Goal:** Bell, digest, CMD+K, skeletons, toasts.

### Checklist

- [ ] `notifications` table + create on assign (task/deal)
- [ ] Header bell + Popover + mark read
- [ ] Edge Function: daily digest (e.g. 8 AM IST) — optional
- [ ] Command palette (cmdk) — search clients/deals, quick actions
- [ ] Skeletons on list/board/dashboard
- [ ] Sonner toasts on CRUD
- [ ] Confirm before delete; keyboard shortcuts help (?)

**Deliverable:** Feels production-polished.

---

## PHASE 9 — Production (~15 min)

**Goal:** Repo + deploy ready for real users.

### Checklist

- [ ] `vercel.json` if needed
- [ ] `next.config` — `images.remotePatterns` for Supabase Storage
- [ ] `.env.example` (URL, ANON, SERVICE_ROLE, RESEND, …)
- [ ] `seed.sql` or trigger: default pipeline stages on new workspace
- [ ] GitHub Action: `next build` on PR
- [ ] `GET /healthcheck` or `app/api/healthcheck` → `{ status: 'ok', timestamp }`

**Deliverable:** Clean deploy + monitoring hook.

---

## If you only have ~6 hours (MVP order)

| Block | Phase | Ship |
|-------|-------|------|
| 0:00–0:30 | 0 | Bootstrap + Vercel |
| 0:30–1:15 | 1 | Auth + workspace |
| 1:15–1:45 | 2 | Shell |
| 1:45–2:45 | 3 | Clients |
| 2:45–3:45 | 4 | Kanban |
| 3:45–4:15 | 5 | Tasks + notes (basic) |
| 4:15–4:45 | 6 | Dashboard |
| 4:45–5:15 | 7 | Team (minimal) |
| 5:15–5:45 | 8 | Polish |
| 5:45–6:00 | 9 | Final deploy |

**Skip first if time:** full invites, email digest, command palette, in-app notifications.

---

## Quick dependency install

```bash
npm install @supabase/ssr @supabase/supabase-js
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-hook-form zod @hookform/resolvers recharts date-fns lucide-react
# shadcn: button card input label sheet dialog tabs badge select textarea sonner skeleton avatar command popover
```

---

*End of phase guide — keep `clientpulse-roadmap.md` open for full SQL and long prompts.*
