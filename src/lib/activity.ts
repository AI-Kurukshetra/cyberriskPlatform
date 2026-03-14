import type { SupabaseClient } from "@supabase/supabase-js";

interface LogActivityInput {
  workspaceId: string;
  entityType: string;
  entityId?: string | null;
  action: string;
  summary: string;
  meta?: Record<string, unknown>;
}

export async function logActivity(
  supabase: SupabaseClient,
  input: LogActivityInput
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase.from("activities").insert({
    workspace_id: input.workspaceId,
    actor_id: user.id,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    action: input.action,
    summary: input.summary,
    meta: input.meta ?? {},
  });
}

export function getMemberLabel(member: {
  email: string | null;
  display_name: string | null;
}): string {
  return member.display_name || member.email || "Workspace member";
}
