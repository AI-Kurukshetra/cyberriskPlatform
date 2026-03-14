import type { JSX } from "react";
import { SettingsPageClient } from "@/components/settings/settings-page-client";
import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/supabase/workspace";
import type { PipelineStageRecord } from "@/types/pipeline";
import type { InviteRecord, WorkspaceMemberRecord } from "@/types/workspace";

export default async function SettingsPage(): Promise<JSX.Element> {
  const supabase = await createClient();
  const { workspaceId } = await requireWorkspaceContext();
  const [{ data: workspace }, { data: members }, { data: invites }, { data: stages }] =
    await Promise.all([
      supabase
        .from("workspaces")
        .select("id, name, logo_url, timezone")
        .eq("id", workspaceId)
        .single(),
      supabase
        .from("workspace_members")
        .select("user_id, email, display_name, avatar_url, role, joined_at")
        .eq("workspace_id", workspaceId)
        .order("joined_at", { ascending: true }),
      supabase
        .from("invites")
        .select("id, email, role, token, expires_at, accepted_at, created_at")
        .eq("workspace_id", workspaceId)
        .is("accepted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("pipeline_stages")
        .select("id, name, position, color")
        .eq("workspace_id", workspaceId)
        .order("position", { ascending: true }),
    ]);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace controls"
        description="Manage workspace identity, team invites, and pipeline stage configuration."
      />
      {workspace ? (
        <SettingsPageClient
          invites={(invites ?? []) as InviteRecord[]}
          members={(members ?? []) as WorkspaceMemberRecord[]}
          stages={(stages ?? []) as PipelineStageRecord[]}
          workspace={workspace}
        />
      ) : null}
    </main>
  );
}
