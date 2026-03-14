alter table public.workspaces
add column if not exists logo_url text,
add column if not exists timezone text default 'Asia/Kolkata';

alter table public.workspace_members
add column if not exists invited_by uuid references auth.users(id),
add column if not exists joined_at timestamptz not null default now(),
add column if not exists email text,
add column if not exists display_name text,
add column if not exists avatar_url text;

update public.workspace_members as members
set
  email = users.email,
  display_name = coalesce(users.raw_user_meta_data ->> 'display_name', split_part(users.email, '@', 1)),
  avatar_url = users.raw_user_meta_data ->> 'avatar_url'
from auth.users as users
where users.id = members.user_id
  and (members.email is null or members.display_name is null or members.avatar_url is null);

alter table public.clients
add column if not exists website text,
add column if not exists location text,
add column if not exists tags text[] not null default '{}',
add column if not exists avatar_url text,
add column if not exists created_by uuid references auth.users(id),
add column if not exists updated_at timestamptz not null default now(),
add column if not exists archived_at timestamptz;

alter table public.pipeline_stages
add column if not exists color text not null default '#f97316';

alter table public.deals
add column if not exists currency text not null default 'USD',
add column if not exists probability integer not null default 50,
add column if not exists status text not null default 'open',
add column if not exists lost_reason text,
add column if not exists assigned_to uuid references auth.users(id),
add column if not exists position integer not null default 0,
add column if not exists created_by uuid references auth.users(id),
add column if not exists updated_at timestamptz not null default now();

alter table public.tasks
add column if not exists deal_id uuid references public.deals(id) on delete set null,
add column if not exists description text,
add column if not exists assigned_to uuid references auth.users(id),
add column if not exists updated_at timestamptz not null default now();

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  content text not null,
  is_pinned boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  summary text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role text not null default 'member',
  token text not null unique,
  invited_by uuid references auth.users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id),
  type text not null,
  entity_type text,
  entity_id uuid,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notes_workspace on public.notes (workspace_id, created_at desc);
create index if not exists idx_notes_client on public.notes (client_id) where client_id is not null;
create index if not exists idx_notes_deal on public.notes (deal_id) where deal_id is not null;
create index if not exists idx_activities_workspace_created on public.activities (workspace_id, created_at desc);
create index if not exists idx_invites_workspace on public.invites (workspace_id, created_at desc);
create index if not exists idx_invites_token on public.invites (token);
create index if not exists idx_notifications_user_unread on public.notifications (user_id, read, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists deals_updated_at on public.deals;
create trigger deals_updated_at
before update on public.deals
for each row execute function public.set_updated_at();

drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists notes_updated_at on public.notes;
create trigger notes_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

update public.deals
set status = case
  when lower(coalesce(status, '')) = 'won' then 'won'
  when lower(coalesce(status, '')) = 'lost' then 'lost'
  else 'open'
end;

alter table public.deals
drop constraint if exists deals_probability_check;

alter table public.deals
add constraint deals_probability_check check (probability between 0 and 100);

alter table public.deals
drop constraint if exists deals_status_check;

alter table public.deals
add constraint deals_status_check check (status in ('open', 'won', 'lost'));

alter table public.pipeline_stages
drop constraint if exists pipeline_stages_position_key;

alter table public.pipeline_stages
add constraint pipeline_stages_position_key unique (workspace_id, position);

insert into public.pipeline_stages (workspace_id, name, position, color)
select workspace_id, 'Lost', 5, '#ef4444'
from (
  select distinct workspace_id
  from public.pipeline_stages
) as workspaces
where not exists (
  select 1
  from public.pipeline_stages as stages
  where stages.workspace_id = workspaces.workspace_id
    and lower(stages.name) = 'lost'
);

create or replace function public.seed_default_pipeline_stages(target_workspace_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.pipeline_stages (workspace_id, name, position, color)
  values
    (target_workspace_id, 'Lead', 1, '#3b82f6'),
    (target_workspace_id, 'Proposal', 2, '#8b5cf6'),
    (target_workspace_id, 'Negotiation', 3, '#f59e0b'),
    (target_workspace_id, 'Won', 4, '#22c55e'),
    (target_workspace_id, 'Lost', 5, '#ef4444')
  on conflict (workspace_id, position) do update
  set
    name = excluded.name,
    color = excluded.color;
$$;

alter table public.notes enable row level security;
alter table public.activities enable row level security;
alter table public.invites enable row level security;
alter table public.notifications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notes' and policyname = 'notes_all'
  ) then
    create policy "notes_all"
    on public.notes
    for all
    using (public.is_workspace_member(workspace_id))
    with check (public.is_workspace_member(workspace_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'activities' and policyname = 'activities_all'
  ) then
    create policy "activities_all"
    on public.activities
    for all
    using (public.is_workspace_member(workspace_id))
    with check (public.is_workspace_member(workspace_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'invites' and policyname = 'invites_member_access'
  ) then
    create policy "invites_member_access"
    on public.invites
    for all
    using (public.is_workspace_member(workspace_id))
    with check (public.is_workspace_member(workspace_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'invites' and policyname = 'invites_read_own_email'
  ) then
    create policy "invites_read_own_email"
    on public.invites
    for select
    using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'invites' and policyname = 'invites_accept_own_email'
  ) then
    create policy "invites_accept_own_email"
    on public.invites
    for update
    using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    with check (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'workspace_members' and policyname = 'workspace_members_insert_from_invite'
  ) then
    create policy "workspace_members_insert_from_invite"
    on public.workspace_members
    for insert
    with check (
      auth.uid() = user_id
      and exists (
        select 1
        from public.invites as invites
        where invites.workspace_id = workspace_members.workspace_id
          and lower(invites.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
          and invites.role = workspace_members.role
          and invites.accepted_at is null
          and invites.expires_at > now()
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_select_own'
  ) then
    create policy "notifications_select_own"
    on public.notifications
    for select
    using (user_id = auth.uid() and public.is_workspace_member(workspace_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_update_own'
  ) then
    create policy "notifications_update_own"
    on public.notifications
    for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_insert_workspace'
  ) then
    create policy "notifications_insert_workspace"
    on public.notifications
    for insert
    with check (public.is_workspace_member(workspace_id));
  end if;
end
$$;
