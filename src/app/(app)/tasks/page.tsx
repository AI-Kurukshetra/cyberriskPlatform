import type { JSX } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TaskSections } from "@/components/tasks/task-sections";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/supabase/workspace";
import type { TaskClientOption, TaskDealOption, TaskMemberOption, TaskRecord } from "@/types/task";

export default async function TasksPage(): Promise<JSX.Element> {
  const supabase = await createClient();
  const { workspaceId } = await requireWorkspaceContext();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: tasks }, { data: clients }, { data: deals }, { data: members }] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, description, due_date, priority, status, client_id, deal_id, assigned_to, clients(name), deals(title)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("id, name")
      .eq("workspace_id", workspaceId)
      .order("name", { ascending: true }),
    supabase
      .from("deals")
      .select("id, title")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    supabase
      .from("workspace_members")
      .select("user_id, email, display_name, avatar_url, role")
      .eq("workspace_id", workspaceId)
      .order("joined_at", { ascending: true }),
  ]);

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          eyebrow="Tasks"
          title="Follow-up tasks"
          description="A lightweight task workspace grouped by due today, upcoming work, and completed follow-ups."
        />
        <TaskFormDialog
          clients={(clients ?? []) as TaskClientOption[]}
          deals={(deals ?? []) as TaskDealOption[]}
          members={(members ?? []) as TaskMemberOption[]}
          triggerLabel="Add Task"
          workspaceId={workspaceId}
        />
      </div>
      <TaskSections
        currentUserId={user?.id ?? ""}
        members={(members ?? []) as TaskMemberOption[]}
        tasks={(tasks ?? []) as TaskRecord[]}
        workspaceId={workspaceId}
      />
    </main>
  );
}
