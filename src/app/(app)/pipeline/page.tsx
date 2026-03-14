import type { JSX } from "react";
import { DealFormDialog } from "@/components/pipeline/deal-form-dialog";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/supabase/workspace";
import type {
  DealRecord,
  PipelineClientOption,
  PipelineMemberOption,
  PipelineStageRecord,
} from "@/types/pipeline";

export default async function PipelinePage(): Promise<JSX.Element> {
  const supabase = await createClient();
  const { workspaceId } = await requireWorkspaceContext();
  const [{ data: stages }, { data: deals }, { data: clients }, { data: members }] = await Promise.all([
    supabase
      .from("pipeline_stages")
      .select("id, name, position, color")
      .eq("workspace_id", workspaceId)
      .order("position", { ascending: true }),
    supabase
      .from("deals")
      .select("id, title, value, currency, probability, status, lost_reason, close_date, client_id, stage_id, assigned_to, position, clients(name)")
      .eq("workspace_id", workspaceId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("id, name")
      .eq("workspace_id", workspaceId)
      .order("name", { ascending: true }),
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
          eyebrow="Pipeline"
          title="Deal pipeline"
          description="A lightweight Kanban view of the current workspace pipeline with stage totals, deal summaries, and quick create/edit support."
        />
        <DealFormDialog
          clients={(clients ?? []) as PipelineClientOption[]}
          members={(members ?? []) as PipelineMemberOption[]}
          stages={(stages ?? []) as PipelineStageRecord[]}
          triggerLabel="New Deal"
          workspaceId={workspaceId}
        />
      </div>
      <KanbanBoard
        clients={(clients ?? []) as PipelineClientOption[]}
        deals={(deals ?? []) as DealRecord[]}
        members={(members ?? []) as PipelineMemberOption[]}
        stages={(stages ?? []) as PipelineStageRecord[]}
        workspaceId={workspaceId}
      />
    </main>
  );
}
