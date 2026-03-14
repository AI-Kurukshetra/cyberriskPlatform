# ClientPulse CRM — Technical Architecture

**Source:** ClientPulse CRM Blueprint (Hackathon Edition)

---

## Stack overview

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router, TypeScript, Tailwind, shadcn/ui) |
| **Auth** | Supabase Auth — email/password + Google OAuth |
| **Database** | Supabase Postgres + Row-Level Security (RLS) |
| **Realtime** | Supabase Realtime (`postgres_changes` subscriptions) |
| **Storage** | Supabase Storage (avatars, workspace logos) |
| **Server logic** | Supabase Edge Functions (digests, invite emails) |
| **Deployment** | Vercel (GitHub-connected deploys) |
| **Charts** | Recharts (funnel, trends) |
| **Drag & drop** | `@dnd-kit/core` + `@dnd-kit/sortable` |
| **Forms** | react-hook-form + Zod |

### High-level diagram

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Vercel)                  │
│     Next.js 15 App Router · TypeScript · shadcn/ui   │
└─────────────────────┬───────────────────────────────┘
                      │  API + Realtime + Auth
┌─────────────────────▼───────────────────────────────┐
│                    SUPABASE                          │
│  Auth │ Postgres │ RLS │ Realtime │ Storage │ Edge  │
└─────────────────────────────────────────────────────┘
```

---

## Supabase feature usage

| Feature | Use in ClientPulse |
|---------|-------------------|
| **Auth** | Signup/login, Google OAuth, sessions, invite tokens |
| **Postgres** | Clients, deals, tasks, notes, activities, invites |
| **RLS** | Workspace isolation — only member data visible |
| **Realtime** | Live Kanban updates across teammates |
| **Storage** | Client avatars, workspace logos |
| **Edge Functions** | Daily overdue digest, invite emails |

---

## Next.js App Router structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── invite/[token]/page.tsx
├── (app)/
│   ├── layout.tsx              ← Sidebar + auth guard
│   ├── dashboard/page.tsx
│   ├── clients/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx       ← Detail + tabs
│   ├── pipeline/page.tsx      ← Kanban
│   ├── tasks/page.tsx         ← Today / Upcoming / Overdue
│   └── settings/
│       ├── page.tsx
│       ├── team/page.tsx
│       └── pipeline/page.tsx
├── api/
│   └── webhooks/
│       └── email-digest/route.ts

components/
├── ui/                         ← shadcn primitives
├── clients/
├── pipeline/
├── tasks/
├── notes/
└── shared/

lib/
├── supabase/
│   ├── client.ts               ← Browser
│   ├── server.ts               ← Server / RSC
│   └── middleware.ts
├── hooks/                      ← useClients, useDeals, useTasks
└── utils/                      ← formatCurrency, dates
```

---

## Database schema (key tables)

| Table | Key columns | Purpose |
|-------|-------------|---------|
| **workspaces** | `id`, `name`, `slug` | Tenant root |
| **workspace_members** | `workspace_id`, `user_id`, `role` | Membership + RBAC |
| **clients** | `name`, `company`, `email`, `status`, `tags[]` | CRM records |
| **pipeline_stages** | `name`, `position`, `color` | Kanban columns |
| **deals** | `client_id`, `stage_id`, `value`, `probability`, `status` | Pipeline |
| **notes** | `content`, `client_id`, `deal_id`, `is_pinned` | Notes |
| **tasks** | `title`, `due_date`, `priority`, `status`, `assigned_to` | Tasks |
| **activities** | `entity_type`, `action`, `meta` (jsonb) | Audit log |
| **invites** | `email`, `token`, `expires_at`, `accepted_at` | Team invites |

Full SQL (create tables, indexes, triggers) can live in Supabase migrations; blueprint aligns with normalized multi-tenant model: every business table includes `workspace_id` (directly or via parent).

---

## RLS pattern (all tables)

**Rule:** A row is visible/readable/writable only if its `workspace_id` is in the set of workspaces where `auth.uid()` appears in `workspace_members`.

- Apply the same idea to every tenant table (`clients`, `deals`, `tasks`, `notes`, `activities`, `pipeline_stages`, `invites`, …).
- Guarantees isolation even if someone calls the API with another workspace’s id.

Example policy shape:

```sql
-- Example: clients
alter table clients enable row level security;

create policy "workspace_members_only" on clients
  for all
  using (
    workspace_id in (
      select workspace_id from workspace_members
      where user_id = auth.uid()
    )
  );
```

Repeat per table with the appropriate `workspace_id` (or join through parent entity that carries `workspace_id`).

---

## Realtime (pipeline)

- Subscribe to `postgres_changes` on `deals` (and optionally `pipeline_stages`) filtered by current `workspace_id`.
- On insert/update (e.g. `stage_id`, `position`), refresh column state or patch local board so all connected clients stay in sync.

---

## Edge Functions

| Function | Role |
|----------|------|
| **daily-digest** | Cron — email users overdue + due-today tasks (e.g. 08:00 IST) |
| **invite-email** | Send invite link after token stored in `invites` |

Use **Resend** (or similar) from Edge Functions; store API keys in Supabase secrets / Vercel env.

---

## Vercel & env

- **Build:** standard Next.js on Vercel.
- **Env:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; server-only `SUPABASE_SERVICE_ROLE_KEY` for admin scripts; email provider key for digests/invites.
- **Images:** add Supabase Storage host to `images.remotePatterns` in `next.config.ts`.

---

## Security checklist

- [ ] RLS enabled on all tenant tables  
- [ ] No service role key in client bundle  
- [ ] Invite tokens single-use + expiry  
- [ ] OAuth redirect URLs configured in Supabase  
- [ ] CORS / auth callbacks only for known origins  

---

## Related docs

- **Feature list & execution plan:** `ClientPulse-CRM-Feature-List-and-Execution-Plan.md`
- **Extended roadmap / prompts:** `clientpulse-roadmap.md`
