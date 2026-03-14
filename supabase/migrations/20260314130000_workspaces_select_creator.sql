-- Fix: "new row violates row-level security policy" on workspaces INSERT
-- Cause: INSERT ... RETURNING is subject to SELECT RLS. Select policy only allowed
-- is_workspace_member(id), but the creator is not a member until the next insert.
-- Fix: Allow SELECT when you created the row (same session user).

drop policy if exists "workspaces_select_creator" on public.workspaces;

create policy "workspaces_select_creator"
  on public.workspaces
  for select
  using (created_by = auth.uid());
