Build the Pipeline slice for ClientPulse.

Part A: Pipeline board at `/pipeline`
1. Fetch pipeline stages for the current workspace ordered by position
2. Fetch deals grouped by stage
3. Render 4 columns:
   - `Lead`
   - `Proposal`
   - `Negotiation`
   - `Won`
4. Each column card should show:
   - stage name
   - deal count
   - total deal value
5. Each deal card should show:
   - title
   - client name if available
   - value
   - close date if available
6. Add `New Deal` button in page header
7. Add empty state per column
8. Make it visually strong for demo
9. First build a non-drag version if faster
10. Use `shadcn` `Card`
11. Create `components/pipeline/kanban-board.tsx` and related small components

Part B: Deal dialog
1. Create reusable dialog:
   - `components/pipeline/deal-form-dialog.tsx`
2. Fields:
   - `Title` required
   - `Client` select from workspace clients
   - `Stage` select from pipeline stages
   - `Value`
   - `Close date`
3. On create:
   - save deal with current `workspace_id`
4. On edit:
   - update existing deal
5. Clicking a deal card opens the edit dialog
6. Refresh board after save
7. Use `shadcn` `Dialog`, `Select`, `Input`

Part C: Drag & drop optional
1. Upgrade the board to support basic drag-and-drop between stages using `@dnd-kit`
2. On drop:
   - update `deal.stage_id` in Supabase
3. Optimistically update if straightforward
4. If optimistic update is risky, refresh after successful update
5. Keep implementation simple and reliable
6. If drag-and-drop introduces instability, preserve a stable fallback:
   - add quick `Move to next stage` action on each card instead

Important:
- Stability is more important than perfect Kanban

After coding:
- run typecheck/build
- summarize files changed
- state whether DnD shipped or fallback was chosen
