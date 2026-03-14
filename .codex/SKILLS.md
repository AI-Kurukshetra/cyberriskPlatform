You are building a 4-hour hackathon MVP called ClientPulse CRM.

Tech stack:
- Next.js 15 App Router
- TypeScript strict
- Tailwind CSS
- shadcn/ui (New York style, zinc theme)
- Supabase Auth + Postgres
- Vercel deployment target

Rules:
- MVP only. No overengineering.
- Build only demo-critical features.
- Server components by default.
- Use "use client" only when needed for hooks/events.
- Use shadcn/ui components, never raw Tailwind-only UI.
- Keep code simple, production-clean, and compile-safe.
- Use small reusable components.
- Prefer fast CRUD over abstraction.
- Use mock-friendly/fallback-safe code if a backend piece is not ready.
- After creating code, always ensure imports are correct and no TypeScript errors remain.
- If schema is needed, generate Supabase SQL migration files and app code together.
- If a feature is too large, implement the smallest demoable version.
- Create beautiful empty states and loading-safe UI.
- At the end of each task, summarize files created/updated and any env vars required.