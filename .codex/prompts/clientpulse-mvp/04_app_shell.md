Build the authenticated app shell and workspace membership guards for ClientPulse.

Part A: Layout + sidebar
1. Build `app/(app)/layout.tsx`
2. Requirements:
   - Persistent sidebar layout
   - Sidebar width around `240px` on desktop
   - Mobile-friendly top header with menu fallback
   - Nav items:
     - `Dashboard`
     - `Clients`
     - `Pipeline`
     - `Tasks`
   - Use `lucide-react` icons
   - Show workspace name
   - Show user email or avatar placeholder in the sidebar footer
   - Add a top bar on mobile/content header area
   - Use `shadcn/ui` and clean Tailwind layout
   - All routes should render inside the layout
3. Create reusable sidebar component in `components/shared/app-sidebar.tsx`
4. Highlight active route
5. Keep it simple, beautiful, and compile-safe

Part B: Workspace membership guards
1. For authenticated app routes:
   - if user is logged in but has no workspace membership, redirect to `/onboarding`
2. For `/login` and `/signup`:
   - if user is logged in and has a workspace, redirect to `/dashboard`
   - if user is logged in and has no workspace, redirect to `/onboarding`
3. Keep middleware simple and safe
4. If middleware becomes too complex, move workspace checks into layouts/pages where appropriate
5. Do not break public homepage access

After coding:
- verify route behavior
- run typecheck/build
- fix compile issues
- summarize files changed
