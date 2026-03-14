-- Demo seed helper for ClientPulse MVP.
-- Run this manually against a development database after the main schema is ready.
-- Update the workspace slug in the first CTE if you want to target a different workspace.

with workspace_context as (
  select id
  from public.workspaces
  where slug = 'northwind'
  limit 1
),
stage_map as (
  select ps.id, ps.name
  from public.pipeline_stages ps
  join workspace_context wc on wc.id = ps.workspace_id
)
insert into public.clients (workspace_id, name, company, email, phone, status)
select wc.id, seed.name, seed.company, seed.email, seed.phone, seed.status
from workspace_context wc
cross join (
  values
    ('Ava Brooks', 'Northwind Studio', 'ava@northwind.studio', '+1 555 101 1001', 'lead'),
    ('Milo Chen', 'Orbit Labs', 'milo@orbitlabs.ai', '+1 555 101 1002', 'active'),
    ('Nina Patel', 'Signal Partners', 'nina@signalpartners.co', '+1 555 101 1003', 'active')
) as seed(name, company, email, phone, status);

with workspace_context as (
  select id
  from public.workspaces
  where slug = 'northwind'
  limit 1
),
client_map as (
  select id, name
  from public.clients
  where workspace_id = (select id from workspace_context)
),
stage_map as (
  select id, name
  from public.pipeline_stages
  where workspace_id = (select id from workspace_context)
)
-- Deals use stage membership for "open vs won" in the current MVP schema.
insert into public.deals (workspace_id, client_id, stage_id, title, value, close_date)
select
  wc.id,
  client_map.id,
  stage_map.id,
  seed.title,
  seed.value,
  seed.close_date
from workspace_context wc
join (
  values
    ('Ava Brooks', 'Lead', 'Brand refresh retainer', 12000, current_date + 7),
    ('Milo Chen', 'Proposal', 'Product strategy sprint', 18000, current_date + 10),
    ('Nina Patel', 'Negotiation', 'Growth ops overhaul', 26000, current_date + 14),
    ('Milo Chen', 'Won', 'Analytics implementation', 9500, current_date - 2)
) as seed(client_name, stage_name, title, value, close_date)
  on true
join client_map on client_map.name = seed.client_name
join stage_map on stage_map.name = seed.stage_name;

with workspace_context as (
  select id
  from public.workspaces
  where slug = 'northwind'
  limit 1
),
client_map as (
  select id, name
  from public.clients
  where workspace_id = (select id from workspace_context)
)
insert into public.tasks (workspace_id, client_id, title, due_date, priority, status)
select
  wc.id,
  client_map.id,
  seed.title,
  seed.due_date,
  seed.priority,
  seed.status
from workspace_context wc
join (
  values
    ('Ava Brooks', 'Send proposal deck', current_date, 'high', 'todo'),
    ('Milo Chen', 'Book pricing call', current_date + 2, 'medium', 'todo'),
    ('Nina Patel', 'Confirm contract edits', current_date - 1, 'high', 'inprogress')
) as seed(client_name, title, due_date, priority, status)
  on true
join client_map on client_map.name = seed.client_name;
