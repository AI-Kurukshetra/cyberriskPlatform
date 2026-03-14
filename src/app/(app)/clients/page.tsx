import type { JSX } from "react";
import { ClientList } from "@/components/clients/client-list";
import { PageHeader } from "@/components/shared/page-header";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/supabase/workspace";
import type { ClientRecord } from "@/types/client";

export default async function ClientsPage(): Promise<JSX.Element> {
  const supabase = await createClient();
  const { workspaceId } = await requireWorkspaceContext();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, company, email, phone, website, location, tags, status, created_at, updated_at, archived_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          eyebrow="Clients"
          title="Client records"
          description="Manage the core client list for the workspace, search existing records, and update profiles from one surface."
        />
        <ClientFormDialog triggerLabel="Add Client" workspaceId={workspaceId} />
      </div>
      <ClientList clients={(clients ?? []) as ClientRecord[]} workspaceId={workspaceId} />
    </main>
  );
}
