Build the Tasks slice for ClientPulse.

Part A: Tasks page at `/tasks`
1. Fetch tasks for the current workspace
2. Create 3 sections:
   - `Due Today`
   - `Upcoming`
   - `Completed`
3. Each task item shows:
   - title
   - related client name if available
   - due date
   - priority badge
   - status
4. Add page header with:
   - title
   - subtitle
   - `Add Task` button
5. Use clean cards/lists and clear empty states
6. Prioritize fast, readable UI over complexity
7. Make the page demo-friendly and polished

Part B: Create + complete task
1. Create reusable dialog:
   - `components/tasks/task-form-dialog.tsx`
2. Fields:
   - `Title` required
   - `Client` optional select
   - `Due date`
   - `Priority` (`low`, `medium`, `high`)
3. On create:
   - save task with `workspace_id`
   - default `status = todo`
4. Add checkbox/button to mark task completed
   - update status to `done`
5. Completed tasks should move to `Completed`
6. Add quick task creation from client detail page if simple
7. Keep implementation minimal and stable
8. Use `shadcn` `Dialog`, `Input`, `Select`, `Button`

After coding:
- run typecheck/build
- summarize files changed
- mention any deferred task features
