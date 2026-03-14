-- ClientPulse CRM MVP auth/onboarding schema
-- Run this migration with the Supabase CLI (`supabase db reset` or `supabase db push`)
-- or paste it into the Supabase SQL Editor for a fresh MVP project.

create extension if not exists "pgcrypto";

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_by uuid not null references auth.users(id),
  created_at timestamptz default now()
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz default now(),
  unique (workspace_id, user_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  status text not null default 'lead',
  created_at timestamptz default now()
);

create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  position int not null,
  created_at timestamptz default now(),
  unique (workspace_id, position)
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  stage_id uuid references public.pipeline_stages(id) on delete set null,
  title text not null,
  value numeric(12,2) default 0,
  close_date date,
  created_at timestamptz default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  due_date date,
  priority text not null default 'medium',
  status text not null default 'todo',
  created_at timestamptz default now()
);

create index idx_workspace_members_user_id on public.workspace_members (user_id);
create index idx_clients_workspace_id on public.clients (workspace_id);
create index idx_pipeline_stages_workspace_id on public.pipeline_stages (workspace_id);
create index idx_deals_workspace_id on public.deals (workspace_id);
create index idx_tasks_workspace_id on public.tasks (workspace_id);

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members member
    where member.workspace_id = target_workspace_id
      and member.user_id = auth.uid()
  );
$$;

-- Call this helper from SQL if you want to seed stages manually:
-- select public.seed_default_pipeline_stages('<workspace-uuid>');
create or replace function public.seed_default_pipeline_stages(target_workspace_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.pipeline_stages (workspace_id, name, position)
  values
    (target_workspace_id, 'Lead', 1),
    (target_workspace_id, 'Proposal', 2),
    (target_workspace_id, 'Negotiation', 3),
    (target_workspace_id, 'Won', 4)
  on conflict (workspace_id, position) do nothing;
$$;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.clients enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.deals enable row level security;
alter table public.tasks enable row level security;

create policy "workspaces_select_member"
on public.workspaces
for select
using (public.is_workspace_member(id));

-- Lets creator read the row right after INSERT (before workspace_members row exists);
-- INSERT ... RETURNING otherwise fails SELECT RLS.
create policy "workspaces_select_creator"
on public.workspaces
for select
using (created_by = auth.uid());

create policy "workspaces_insert_authenticated"
on public.workspaces
for insert
with check (auth.uid() is not null and created_by = auth.uid());

create policy "workspaces_update_owner"
on public.workspaces
for update
using (
  exists (
    select 1
    from public.workspace_members member
    where member.workspace_id = workspaces.id
      and member.user_id = auth.uid()
      and member.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.workspace_members member
    where member.workspace_id = workspaces.id
      and member.user_id = auth.uid()
      and member.role = 'owner'
  )
);

create policy "workspaces_delete_owner"
on public.workspaces
for delete
using (
  exists (
    select 1
    from public.workspace_members member
    where member.workspace_id = workspaces.id
      and member.user_id = auth.uid()
      and member.role = 'owner'
  )
);

create policy "workspace_members_select_member"
on public.workspace_members
for select
using (public.is_workspace_member(workspace_id));

create policy "workspace_members_insert_mvp"
on public.workspace_members
for insert
with check (
  public.is_workspace_member(workspace_id)
  or (
    auth.uid() = user_id
    and role = 'owner'
    and not exists (
      select 1
      from public.workspace_members existing
      where existing.workspace_id = workspace_members.workspace_id
    )
  )
);

create policy "workspace_members_update_owner"
on public.workspace_members
for update
using (
  exists (
    select 1
    from public.workspace_members member
    where member.workspace_id = workspace_members.workspace_id
      and member.user_id = auth.uid()
      and member.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.workspace_members member
    where member.workspace_id = workspace_members.workspace_id
      and member.user_id = auth.uid()
      and member.role = 'owner'
  )
);

create policy "workspace_members_delete_owner"
on public.workspace_members
for delete
using (
  exists (
    select 1
    from public.workspace_members member
    where member.workspace_id = workspace_members.workspace_id
      and member.user_id = auth.uid()
      and member.role = 'owner'
  )
);

create policy "clients_select_member"
on public.clients
for select
using (public.is_workspace_member(workspace_id));

create policy "clients_insert_member"
on public.clients
for insert
with check (public.is_workspace_member(workspace_id));

create policy "clients_update_member"
on public.clients
for update
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "clients_delete_member"
on public.clients
for delete
using (public.is_workspace_member(workspace_id));

create policy "pipeline_stages_select_member"
on public.pipeline_stages
for select
using (public.is_workspace_member(workspace_id));

create policy "pipeline_stages_insert_member"
on public.pipeline_stages
for insert
with check (public.is_workspace_member(workspace_id));

create policy "pipeline_stages_update_member"
on public.pipeline_stages
for update
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "pipeline_stages_delete_member"
on public.pipeline_stages
for delete
using (public.is_workspace_member(workspace_id));

create policy "deals_select_member"
on public.deals
for select
using (public.is_workspace_member(workspace_id));

create policy "deals_insert_member"
on public.deals
for insert
with check (public.is_workspace_member(workspace_id));

create policy "deals_update_member"
on public.deals
for update
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "deals_delete_member"
on public.deals
for delete
using (public.is_workspace_member(workspace_id));

create policy "tasks_select_member"
on public.tasks
for select
using (public.is_workspace_member(workspace_id));

create policy "tasks_insert_member"
on public.tasks
for insert
with check (public.is_workspace_member(workspace_id));

create policy "tasks_update_member"
on public.tasks
for update
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "tasks_delete_member"
on public.tasks
for delete
using (public.is_workspace_member(workspace_id));
