Build the Clients slice for ClientPulse.

Part A: Clients list at `/clients`
1. Fetch clients for the current user's workspace from Supabase
2. Display them in a clean responsive table/list
3. Columns:
   - `Name`
   - `Company`
   - `Email`
   - `Status`
   - `Created date`
4. Status badge styles:
   - `lead`
   - `active`
   - `inactive`
5. Header section:
   - page title
   - subtitle
   - `Add Client` button
6. Add search by name/company/email
   - client-side filtering is acceptable for MVP
7. Add empty state:
   - `No clients yet`
   - CTA to add first client
8. Use `shadcn` `Table`/`Card`/`Badge`/`Button` if available
9. Keep server-side data fetching simple and stable
10. Create a small client type in `types/`
11. Make the page compile even if there are zero records

Part B: Create/edit client
1. Create reusable component:
   - `components/clients/client-form-dialog.tsx`
2. Use `shadcn` `Dialog`
3. Fields:
   - `Name` required
   - `Company`
   - `Email`
   - `Phone`
   - `Status` (`lead`, `active`, `inactive`)
4. Support:
   - create new client
   - edit existing client
5. Save to Supabase for the current workspace
6. Refresh the clients page after save
7. Add row action for edit
8. Add delete only if quick and safe; otherwise skip it
9. Show loading and error states
10. Use `react-hook-form` + `zod` if fast; otherwise minimal stable form is acceptable

Part C: Client detail at `/clients/[id]`
1. Show client header:
   - name
   - company
   - email
   - phone
   - status badge
2. Show only 2 sections for MVP:
   - deals for this client
   - tasks for this client
3. Add quick action buttons:
   - `Add Deal`
   - `Add Task`
4. If related data is empty, show clean empty states
5. Keep it simple and polished
6. Use server component data fetching where possible
7. Ensure route is protected and workspace-scoped

Do not build tabs or notes yet.

After coding:
- run typecheck/build
- summarize files changed
- list any Supabase schema assumptions
