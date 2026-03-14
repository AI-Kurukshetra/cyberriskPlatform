Prepare ClientPulse CRM for Vercel deployment.

Tasks:
1. Create `.env.example` with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Verify no server-only secrets are accidentally required for MVP runtime
3. Ensure Next.js build passes
4. Fix any TypeScript issues
5. Ensure middleware and route structure work in production
6. Add a simple `/api/healthcheck` route returning:
   - `{ "status": "ok", "timestamp": "<iso>" }`
7. Summarize exact deployment steps for Vercel

At the end:
- run full typecheck
- run build
- fix imports
- ensure routes compile without breaking existing pages
- summarize files changed and deployment steps
