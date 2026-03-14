# ClientPulse CRM — Supabase Database Schema

**Source:** ClientPulse CRM Blueprint (docx) — multi-tenant CRM (workspaces, clients, deals, tasks, notes).  
**Run order:** extensions → tables → indexes → RLS → triggers → optional Realtime.

---

## Entity overview

```
auth.users
     │
     ▼
workspaces ◄── workspace_members (user_id, role)
     │
     ├── pipeline_stages
     ├── clients
     │     └── deals ──► stage_id
     ├── notes (client_id | deal_id)
     ├── tasks (client_id | deal_id)
     ├── activities
     ├── invites
     └── notifications (recipient user_id)
```

Every tenant table carries **`workspace_id`** (directly or via parent) so RLS can isolate data per workspace.

---

## 1. Extensions (optional)

```sql
-- UUID generation (often already enabled in Supabase)
create extension if not exists "pgcrypto";
```

---

## 2. Tables (DDL)

### 2.1 `workspaces`

```sql
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  timezone text default 'UTC',
  created_at timestamptz not null default now()
);
```

### 2.2 `workspace_members`

```sql
create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'member', 'viewer')),
  invited_by uuid references auth.users(id),
  joined_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index idx_workspace_members_user on public.workspace_members (user_id);
create index idx_workspace_members_workspace on public.workspace_members (workspace_id);
```

### 2.3 `invites`

```sql
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role text not null default 'member'
    check (role in ('owner', 'member', 'viewer')),
  token text unique not null,
  invited_by uuid references auth.users(id),
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index idx_invites_token on public.invites (token);
create index idx_invites_workspace on public.invites (workspace_id);
```

### 2.4 `clients`

```sql
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  website text,
  location text,
  status text not null default 'lead'
    check (status in ('lead', 'active', 'inactive')),
  tags text[] not null default '{}',
  avatar_url text,
  archived_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_clients_workspace on public.clients (workspace_id);
create index idx_clients_workspace_status on public.clients (workspace_id, status)
  where archived_at is null;
```

### 2.5 `pipeline_stages`

```sql
create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  position integer not null,
  color text not null default '#6b7280',
  unique (workspace_id, position)
);

create index idx_pipeline_stages_workspace on public.pipeline_stages (workspace_id);
```

### 2.6 `deals`

```sql
create table public.deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  stage_id uuid references public.pipeline_stages(id) on delete set null,
  title text not null,
  value numeric(12, 2) not null default 0,
  currency text not null default 'INR',
  probability integer not null default 50
    check (probability between 0 and 100),
  close_date date,
  status text not null default 'open'
    check (status in ('open', 'won', 'lost')),
  lost_reason text,
  assigned_to uuid references auth.users(id),
  position integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_deals_workspace on public.deals (workspace_id);
create index idx_deals_client on public.deals (client_id);
create index idx_deals_stage on public.deals (stage_id);
```

### 2.7 `notes`

```sql
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  content text not null,
  is_pinned boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (client_id is not null or deal_id is not null)
);

create index idx_notes_workspace on public.notes (workspace_id);
create index idx_notes_client on public.notes (client_id) where client_id is not null;
create index idx_notes_deal on public.notes (deal_id) where deal_id is not null;
```

### 2.8 `tasks`

```sql
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  title text not null,
  description text,
  due_date date,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  status text not null default 'todo'
    check (status in ('todo', 'inprogress', 'done')),
  assigned_to uuid references auth.users(id),
  created_by uuid references auth.users(id),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tasks_workspace on public.tasks (workspace_id);
create index idx_tasks_assigned on public.tasks (assigned_to) where status != 'done';
create index idx_tasks_due on public.tasks (workspace_id, due_date) where status != 'done';
```

### 2.9 `activities` (audit log)

```sql
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id),
  entity_type text not null, -- 'client' | 'deal' | 'task' | 'note'
  entity_id uuid not null,
  action text not null,      -- 'created' | 'updated' | 'deleted' | 'stage_changed'
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_activities_workspace_created on public.activities (workspace_id, created_at desc);
create index idx_activities_entity on public.activities (entity_type, entity_id);
```

### 2.10 `notifications` (Phase 8 — in-app bell)

```sql
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, -- recipient
  actor_id uuid references auth.users(id),
  type text not null, -- e.g. 'task_assigned', 'deal_assigned', 'mentioned'
  entity_type text,
  entity_id uuid,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_unread on public.notifications (user_id, read, created_at desc);
```

---

## 3. Helper: `updated_at` trigger

```sql
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

create trigger deals_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
```

---

## 4. Row Level Security (RLS)

**Rule:** For any row with `workspace_id`, allow access only if the user is in `workspace_members` for that workspace.

**Helper (optional):**

```sql
create or replace function public.is_workspace_member(wid uuid)
returns boolean language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = wid and m.user_id = auth.uid()
  );
$$;
```

### 4.1 Enable RLS on all tables

```sql
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.invites enable row level security;
alter table public.clients enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.deals enable row level security;
alter table public.notes enable row level security;
alter table public.tasks enable row level security;
alter table public.activities enable row level security;
alter table public.notifications enable row level security;
```

### 4.2 `workspaces`

```sql
-- Members can read their workspaces
create policy "workspaces_select_member"
  on public.workspaces for select
  using (public.is_workspace_member(id));

-- Only owners can update workspace (adjust if members may edit name)
create policy "workspaces_update_owner"
  on public.workspaces for update
  using (
    exists (
      select 1 from public.workspace_members m
      where m.workspace_id = workspaces.id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

-- Insert: allow authenticated user creating a workspace (first owner added in app)
create policy "workspaces_insert_authenticated"
  on public.workspaces for insert
  with check (auth.uid() is not null);
```

### 4.3 `workspace_members`

```sql
create policy "workspace_members_select"
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

create policy "workspace_members_insert"
  on public.workspace_members for insert
  with check (public.is_workspace_member(workspace_id));

create policy "workspace_members_update_owner"
  on public.workspace_members for update
  using (
    exists (
      select 1 from public.workspace_members m
      where m.workspace_id = workspace_members.workspace_id
        and m.user_id = auth.uid() and m.role = 'owner'
    )
  );

create policy "workspace_members_delete_owner"
  on public.workspace_members for delete
  using (
    exists (
      select 1 from public.workspace_members m
      where m.workspace_id = workspace_members.workspace_id
        and m.user_id = auth.uid() and m.role = 'owner'
    )
  );
```

*Note:* First owner row after workspace creation may need **service role** in app or a one-time policy; many apps insert owner via server action with service role.

### 4.4 `invites`

```sql
create policy "invites_select"
  on public.invites for select
  using (public.is_workspace_member(workspace_id));

create policy "invites_insert"
  on public.invites for insert
  with check (public.is_workspace_member(workspace_id));

create policy "invites_update"
  on public.invites for update
  using (public.is_workspace_member(workspace_id));

create policy "invites_delete"
  on public.invites for delete
  using (public.is_workspace_member(workspace_id));
```

*Accept by token:* often done via Edge Function (service role) or extra policy allowing `select` where `token = :token` for anonymous read of single row.

### 4.5 Tenant tables (same pattern)

Repeat for `clients`, `pipeline_stages`, `deals`, `notes`, `tasks`, `activities`:

```sql
-- Example: clients
create policy "clients_all"
  on public.clients for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- pipeline_stages
create policy "pipeline_stages_all"
  on public.pipeline_stages for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- deals
create policy "deals_all"
  on public.deals for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- notes
create policy "notes_all"
  on public.notes for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- tasks
create policy "tasks_all"
  on public.tasks for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- activities
create policy "activities_all"
  on public.activities for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
```

### 4.6 `notifications`

```sql
-- Recipients see their own notifications (still scoped by workspace)
create policy "notifications_select_own"
  on public.notifications for select
  using (user_id = auth.uid() and public.is_workspace_member(workspace_id));

create policy "notifications_update_own"
  on public.notifications for update
  using (user_id = auth.uid());

-- Insert: members can create notifications for others in same workspace (or use service role only)
create policy "notifications_insert_workspace"
  on public.notifications for insert
  with check (public.is_workspace_member(workspace_id));
```

**Viewers:** If `viewer` must be read-only, split policies per role (no insert on deals/clients, etc.) — blueprint uses Owner / Member / Viewer; tighten `with check` by role as needed.

---

## 5. Realtime (Kanban)

In Supabase Dashboard → **Database → Replication**, enable **`deals`** (and optionally **`pipeline_stages`**) for `postgres_changes`.

Client filter example: `filter: workspace_id=eq.<current_workspace_id>`.

---

## 6. Default pipeline stages (seed)

Run after a workspace is created (app or SQL):

```sql
-- :workspace_id = new workspace uuid
insert into public.pipeline_stages (workspace_id, name, position, color) values
  (:workspace_id, 'Lead', 1, '#3b82f6'),
  (:workspace_id, 'Proposal', 2, '#8b5cf6'),
  (:workspace_id, 'Negotiation', 3, '#f59e0b'),
  (:workspace_id, 'Won', 4, '#22c55e'),
  (:workspace_id, 'Lost', 5, '#ef4444');
```

---

## 7. Storage buckets (reference)

| Bucket        | Use              | RLS idea                          |
|---------------|------------------|-----------------------------------|
| `avatars`     | Client avatars   | path prefix per workspace         |
| `workspace-logos` | Workspace logo | owner upload only                 |

Create buckets in Dashboard; policies separate from tables.

---

## 8. Checklist before production

- [ ] All tables have RLS enabled  
- [ ] No anon key on server-only operations (invites accept, digests)  
- [ ] Indexes on `workspace_id` + hot filters  
- [ ] Realtime only on needed tables  
- [ ] `invites.expires_at` enforced in app + optional cron cleanup  

---

**Related:** `ClientPulse-CRM-Tech-Architecture.md`, `clientpulse-roadmap.md` (copy-paste prompts), `ClientPulse-Development-Phases.md`.
