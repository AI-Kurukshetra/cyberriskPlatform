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

---

## CRM feature map (what a full CRM can include)

Use this as a product backlog or competitive checklist. **Bold** = largely covered in ClientPulse MVP today.

| Area | Features |
|------|----------|
| **Account & access** | **Email/password auth**, **workspaces**, **roles (e.g. owner)**, **invites**, SSO/SAML, MFA, audit log of logins |
| **Contacts & companies** | **Client records** (people/orgs), **tags & status**, duplicate merge, import/export (CSV), custom fields |
| **Pipeline & deals** | **Stages**, **deals on a board**, value & currency, **probability**, win/loss reasons, **forecasting**, products/line items |
| **Activities** | **Tasks** (due dates, priority), **notes**, calls/meetings log, email sync, calendar integration |
| **Collaboration** | **Activity feed**, @mentions, notifications (in-app/email), shared views |
| **Insights** | **Dashboard** (pipeline value, tasks due, recent activity), reports, cohorts, goals/quotas |


---

## ClientPulse MVP (shipped in this repo)

- Marketing landing, **signup / login / onboarding**
- **Workspace** per team, **members**, **invites**
- **Clients** list + detail (deals, tasks, **notes**)
- **Deal pipeline** (Kanban), **tasks** by due date
- **Dashboard** + charts, **activity** logging
- **Settings** (workspace, stages, team)

---

## Feature list

What ClientPulse is built around (MVP today + planned scope on the roadmap):

1. **Client management** — Store client details, company context, **tags**, and a **full activity history** (notes, tasks, deals, and later emails) in one profile.
2. **Deal pipeline** — **Visual Kanban** to track leads and deals across configurable **stages**; value, currency, probability, win/loss.
3. **Follow-up tasks** — Create tasks, due dates and priority, **assign to team members**; reminders and notifications on the roadmap.
4. **Notes & activity log** — **Notes** on clients and an **activity feed** so every interaction stays traceable in one place.
5. **Team collaboration** — **Invite** teammates, workspace **roles**; roadmap: assign clients, **comments**, **@mentions**, shared views.
6. **Dashboard & reports** — **Pipeline status**, upcoming tasks, team **activity**, and **revenue / trend** insights; deeper saved reports on the roadmap.
7. **Search & notifications** — Find clients (and later deals, tasks, emails); **real-time updates** and a notification center on the roadmap.
8. **Gmail / email inbox (roadmap)** — Connect **Gmail** so users can **send, receive, read, reply**, and manage mail **inside the CRM**; full **threads**, **attachments** (upload/download), and every conversation **linked to the right client or deal**.

9. **Workspace & auth** — Sign up / log in, **onboarding**, per-team **workspace**, **members** and **invites**, workspace **settings** (name, stages, team).

---

## Next-step features (enhancements)

Merged with the Key Features gaps above. Prioritize by ICP.

1. **Gmail integration & email inbox (in-app)** — OAuth to Gmail; send/receive inside the CRM (no separate Gmail tab); full **thread view**; **attach / upload / download** files; **link every thread** to the right **client and/or deal** so communication history stays on the record.  
2. **Global search** — One search across clients, deals, tasks (and emails once Gmail exists); keyboard shortcut; recent items.  
3. **Notifications & reminders** — Real-time in-app (and optional email) for task due dates, @mentions, invites, deal stage changes; notification center + read state.  
4. **Team collaboration (deeper)** — **Assign clients** (and default deal owner); **comments** on client/deal; **@mentions** with notify; activity entries for comments.  
5. **Client management (deeper)** — Multiple **contacts** per company; primary contact; fuller **activity history** filters (notes, tasks, emails, deals).  
6. **Reporting & exports** — Saved reports, funnel metrics, revenue by period, CSV/PDF export; dashboard date ranges.  
7. **Calendar** — Connect Google/Outlook; schedule from client; optional task reminders on calendar.  
8. **Import / export** — CSV import for clients & deals; bulk update.  
9. **Custom fields** — Per workspace on clients & deals.  
10. **Automation** — Rules (e.g. stage → task), webhooks, simple sequences.  
11. **Slack / Teams** — Channel alerts for key events (optional).  
12. **Mobile & PWA** — Installable app; push later if needed.  
13. **Billing** — Stripe (per seat or workspace).  
14. **SSO & security** — SAML, MFA enforcement.  
15. **API & Zapier/Make** — For power users and ops.

---

*Enhancements are roadmap items — ship incrementally without blocking the current MVP.*
