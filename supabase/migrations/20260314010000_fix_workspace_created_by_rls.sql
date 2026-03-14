alter table public.workspaces
add column if not exists created_by uuid references auth.users(id);

update public.workspaces as workspaces
set created_by = membership.user_id
from (
  select distinct on (workspace_id)
    workspace_id,
    user_id
  from public.workspace_members
  order by workspace_id, case when role = 'owner' then 0 else 1 end, user_id
) as membership
where workspaces.id = membership.workspace_id
  and workspaces.created_by is null;

do $$
begin
  if not exists (
    select 1
    from public.workspaces
    where created_by is null
  ) then
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
