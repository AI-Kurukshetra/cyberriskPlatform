-- Fix: "Could not find the 'created_by' column of 'workspaces' in the schema cache"
-- Run via: supabase db push   OR paste into Supabase Dashboard → SQL Editor → Run
-- Safe to run multiple times.

alter table public.workspaces
  add column if not exists created_by uuid references auth.users(id);

-- Backfill from first owner (or any member) per workspace
update public.workspaces as w
set created_by = m.user_id
from (
  select distinct on (workspace_id)
    workspace_id,
    user_id
  from public.workspace_members
  order by workspace_id, case when role = 'owner' then 0 else 1 end, user_id
) as m
where w.id = m.workspace_id
  and w.created_by is null;

-- NOT NULL only when every row has created_by (avoids failing on orphan rows)
do $$
begin
  if not exists (select 1 from public.workspaces where created_by is null) then
    alter table public.workspaces
      alter column created_by set not null;
  end if;
end
$$;

drop policy if exists "workspaces_insert_authenticated" on public.workspaces;

create policy "workspaces_insert_authenticated"
  on public.workspaces
  for insert
  with check (auth.uid() is not null and created_by = auth.uid());
