-- Demo seed data for the MVP schema.

-- Demo auth users for seeded CRM data.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'demo-owner@clientpulse.app',
    crypt('ClientPulseDemo123!', gen_salt('bf')),
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    null,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Demo Owner"}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'demo-manager@clientpulse.app',
    crypt('ClientPulseDemo123!', gen_salt('bf')),
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    null,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Demo Manager"}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  )
on conflict (id) do update
set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  last_sign_in_at = excluded.last_sign_in_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = excluded.updated_at;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '{"sub":"00000000-0000-0000-0000-000000000001","email":"demo-owner@clientpulse.app","email_verified":true,"phone_verified":false}',
    'email',
    'demo-owner@clientpulse.app',
    now(),
    now(),
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '{"sub":"00000000-0000-0000-0000-000000000002","email":"demo-manager@clientpulse.app","email_verified":true,"phone_verified":false}',
    'email',
    'demo-manager@clientpulse.app',
    now(),
    now(),
    now()
  )
on conflict (id) do update
set
  identity_data = excluded.identity_data,
  last_sign_in_at = excluded.last_sign_in_at,
  updated_at = excluded.updated_at;

-- Workspaces (created_by required by RLS + app inserts)
insert into public.workspaces (id, name, slug, created_by, created_at)
values
  ('11111111-1111-1111-1111-111111111111', 'Northwind Consulting', 'northwind', '00000000-0000-0000-0000-000000000001', now()),
  ('22222222-2222-2222-2222-222222222222', 'Acme Ventures', 'acme-ventures', '00000000-0000-0000-0000-000000000002', now())
on conflict (id) do nothing;

-- Members (assuming two demo users exist in auth.users)
insert into public.workspace_members (id, workspace_id, user_id, role)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'owner')
on conflict (id) do update
set
  workspace_id = excluded.workspace_id,
  user_id = excluded.user_id,
  role = excluded.role;

-- Pipeline stages (workspace 1)
insert into public.pipeline_stages (id, workspace_id, name, position)
values
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Lead', 1),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Proposal', 2),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Negotiation', 3),
  ('33333333-3333-3333-3333-333333333334', '11111111-1111-1111-1111-111111111111', 'Won', 4)
on conflict (id) do nothing;

-- Clients (workspace 1)
insert into public.clients (id, workspace_id, name, company, email, phone, status)
values
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'Lisa Wong', 'Wong Imports', 'lisa@wongimports.com', '+1-212-555-0101', 'lead'),
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', 'Orbit Labs', 'Orbit Labs', 'founder@orbitlabs.ai', '+1-415-555-0102', 'active')
on conflict (id) do nothing;

-- Deals (workspace 1)
insert into public.deals (id, workspace_id, client_id, stage_id, title, value, close_date)
values
  ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331', 'CRM rollout', 25000, current_date + 7),
  ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333332', 'AI pilot', 18000, current_date + 14)
on conflict (id) do nothing;

-- Tasks (workspace 1)
insert into public.tasks (id, workspace_id, client_id, title, due_date, priority, status)
values
  ('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', 'Send proposal deck', current_date, 'high', 'inprogress'),
  ('66666666-6666-6666-6666-666666666662', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444442', 'Schedule technical review', current_date + 2, 'medium', 'todo')
on conflict (id) do nothing;
