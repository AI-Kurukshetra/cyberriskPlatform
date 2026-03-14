# ClientPulse — test cases by screen

| Screen | Route | Automated | What we assert |
|--------|-------|-----------|----------------|
| **Marketing** | `/` | E2E | Hero visible; auth links work |
| **Login** | `/login` | E2E + unit | Welcome back; email/password; link to signup |
| **Signup** | `/signup` | E2E | Free trial title; form; link to login |
| **Onboarding** | `/onboarding` | E2E | No session → redirect `/login` |
| **Dashboard** | `/dashboard` | E2E | No session → redirect `/login` |
| **Clients list** | `/clients` | E2E | No session → redirect `/login` |
| **Client detail** | `/clients/[id]` | Manual* | Needs auth + valid id |
| **Pipeline** | `/pipeline` | E2E | No session → redirect `/login` |
| **Tasks** | `/tasks` | E2E | No session → redirect `/login` |
| **Settings** | `/settings` | E2E | No session → redirect `/login` |
| **Invite accept** | `/invite/[token]` | E2E | No session → redirect `/login?message=…` |
| **Healthcheck** | `/api/healthcheck` | E2E | `{ status: "ok", timestamp }` |

\*Authenticated flows (dashboard charts, Kanban, settings invites) — add Playwright `storageState` after real login when you want CI coverage with seeded users.

## Commands

```bash
npm run test          # Vitest (unit)
npm run test:e2e      # Playwright (starts dev server)
npx playwright install # once, for browsers
```

## Demo accounts (manual / future E2E)

- `demo-owner@clientpulse.app` / `ClientPulseDemo123!`
- `demo-manager@clientpulse.app` / `ClientPulseDemo123!`
