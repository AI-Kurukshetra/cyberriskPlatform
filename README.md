# ClientPulse

CRM-style app: workspaces, clients, pipeline, tasks, notes — Next.js + Supabase.

## Setup

```bash
cp .env.example .env.local
# Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase

Migrations and seeds live in `supabase/`. See [`supabase/README.md`](supabase/README.md).

## Tests

```bash
npm run test              # unit (Vitest)
npm run test:e2e          # browser (Playwright; installs dev server)
npx playwright install    # first time only
```

See [`tests/TEST_CASES.md`](tests/TEST_CASES.md) for screen ↔ test mapping.

## Deploy

[Vercel](https://vercel.com/new) — set the same env vars as `.env.example`.
