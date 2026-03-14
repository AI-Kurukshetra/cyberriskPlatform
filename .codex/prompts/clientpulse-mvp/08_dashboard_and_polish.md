Build the dashboard and finish the MVP polish for ClientPulse.

Part A: Dashboard at `/dashboard`
Goal:
Create a highly demoable dashboard that summarizes the workspace.

Requirements:
1. Fetch data for current workspace:
   - clients
   - deals
   - tasks
   - pipeline stages
2. Create 4 stat cards:
   - `Total Clients`
   - `Pipeline Value`
   - `Deals Open`
   - `Tasks Due Today`
3. Create a `Today's Focus` section:
   - tasks due today
   - deals closing soon
4. Create a `Pipeline Snapshot` section:
   - show stage counts in simple cards or horizontal bars
5. Create a `Recent Clients` section:
   - latest 5 clients
6. Use clean `shadcn` cards
7. Make it feel premium and polished
8. If charts slow things down, skip Recharts and use card summaries instead

Part B: Final polish + seed helper
1. Improve empty states on:
   - dashboard
   - clients
   - pipeline
   - tasks
2. Ensure all page headers are visually consistent
3. Add loading-safe states where easy
4. Add simple currency formatting helper for deal values
5. Add a temporary demo seed helper that can quickly create:
   - 3 clients
   - 4 deals across stages
   - 3 tasks
6. Ensure navigation is smooth and routes are consistent
7. Fix rough UI issues
8. Keep everything compile-safe

At the end:
- run typecheck
- run build
- list all files changed
- summarize any remaining manual steps
