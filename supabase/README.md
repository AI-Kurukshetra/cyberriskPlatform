# Supabase

- **`seed.sql`** — runs on `supabase db reset` (see `config.toml` → `[db.seed]`).
- **`demo_seed.sql`** — optional; run manually in SQL Editor after reset to add sample clients/deals for the `northwind` workspace.

## `created_by` on `workspaces`

If creating a workspace fails with:

> Could not find the 'created_by' column of 'workspaces' in the schema cache

your remote database never got the column (migrations not applied, or an old manual schema).

**Fix (pick one):**

1. **CLI** (from project root, linked project):
   ```bash
   supabase db push
   ```

2. **Dashboard** → **SQL Editor** → paste and run the contents of:
   `supabase/migrations/20260314120000_workspaces_add_created_by.sql`

PostgREST refreshes its schema cache shortly after `ALTER TABLE`; retry the app or wait a few seconds.

## RLS on INSERT workspace ("new row violates row-level security policy")

If insert fails even though `created_by` is set: **SELECT** RLS blocks `INSERT … RETURNING` until you’re a member. Apply:

`supabase/migrations/20260314130000_workspaces_select_creator.sql`

Or run:

```sql
create policy "workspaces_select_creator"
  on public.workspaces for select
  using (created_by = auth.uid());
```
