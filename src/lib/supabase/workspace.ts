import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface WorkspaceContext {
  email: string;
  workspaceId: string;
  workspaceName: string;
}

export async function getWorkspaceMembership(userId: string): Promise<{
  workspaceId: string;
  workspaceName: string;
} | null> {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(name)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return null;
  }

  const workspaceRecord = Array.isArray(membership.workspaces)
    ? membership.workspaces[0]
    : membership.workspaces;
  const workspaceName =
    workspaceRecord && typeof workspaceRecord === "object" && "name" in workspaceRecord
      ? String(workspaceRecord.name)
      : "ClientPulse Workspace";

  return {
    workspaceId: membership.workspace_id,
    workspaceName,
  };
}

export async function requireWorkspaceContext(): Promise<WorkspaceContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const membership = await getWorkspaceMembership(user.id);
  if (!membership) {
    redirect("/onboarding");
  }

  return {
    email: user.email ?? "workspace-user",
    workspaceId: membership.workspaceId,
    workspaceName: membership.workspaceName,
  };
}
