import type { JSX } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Globe, Mail, MapPin, Phone, TrendingUp } from "lucide-react";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { ClientStatusBadge } from "@/components/clients/client-status-badge";
import { NoteFeed } from "@/components/notes/note-feed";
import { PageHeader } from "@/components/shared/page-header";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/supabase/workspace";
import { formatCurrency } from "@/lib/utils";
import type {
  ClientActivityRecord,
  ClientDealSummary,
  ClientRecord,
  ClientTaskSummary,
} from "@/types/client";
import type { NoteRecord } from "@/types/note";
import type { TaskDealOption, TaskMemberOption } from "@/types/task";

interface ClientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps): Promise<JSX.Element> {
  const { id } = await params;
  const supabase = await createClient();
  const { workspaceId } = await requireWorkspaceContext();

  const [
    { data: client },
    { data: deals },
    { data: tasks },
    { data: notes },
    { data: activities },
    { data: members },
  ] = await Promise.all([
    supabase
      .from("clients")
      .select(
        "id, name, company, email, phone, website, location, tags, status, created_at, updated_at, archived_at"
      )
      .eq("workspace_id", workspaceId)
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("deals")
      .select("id, title, value, currency, probability, status, close_date")
      .eq("workspace_id", workspaceId)
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("id, title, description, priority, status, due_date, assigned_to, deal_id")
      .eq("workspace_id", workspaceId)
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("notes")
      .select("id, content, is_pinned, client_id, deal_id, created_at, created_by")
      .eq("workspace_id", workspaceId)
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("activities")
      .select("id, entity_type, entity_id, action, summary, created_at")
      .eq("workspace_id", workspaceId)
      .eq("entity_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("workspace_members")
      .select("user_id, email, display_name, avatar_url, role")
      .eq("workspace_id", workspaceId)
      .order("joined_at", { ascending: true }),
  ]);

  if (!client) {
    notFound();
  }

  const clientRecord = client as ClientRecord;
  const relatedDeals = (deals ?? []) as ClientDealSummary[];
  const relatedTasks = (tasks ?? []) as ClientTaskSummary[];
  const memberRecords = (members ?? []) as TaskMemberOption[];
  const memberMap = new Map(memberRecords.map((member) => [member.user_id, member]));
  const relatedNotes = ((notes ?? []) as NoteRecord[]).map((note) => {
    const author = note.created_by ? memberMap.get(note.created_by) : null;

    return {
      ...note,
      author_avatar_url: author?.avatar_url ?? null,
      author_email: author?.email ?? null,
      author_name: author?.display_name ?? null,
    };
  });
  const relatedActivities = (activities ?? []) as ClientActivityRecord[];
  const totalPipelineValue = relatedDeals.reduce(
    (sum, deal) => sum + Number(deal.value ?? 0),
    0
  );
  const openDeals = relatedDeals.filter((deal) => deal.status === "open");

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          eyebrow="Client detail"
          title={clientRecord.name}
          description="A relationship view with profile context, active work, notes, and activity in one place."
        />
        <div className="flex flex-wrap gap-2">
          <ClientFormDialog client={clientRecord} triggerLabel="Edit client" workspaceId={workspaceId} />
          <TaskFormDialog
            clients={[{ id: clientRecord.id, name: clientRecord.name }]}
            deals={relatedDeals.map((deal) => ({ id: deal.id, title: deal.title })) as TaskDealOption[]}
            initialClientId={clientRecord.id}
            members={memberRecords}
            triggerLabel="Add Task"
            workspaceId={workspaceId}
          />
        </div>
      </div>

      <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/40">
        <CardHeader className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-2xl">{clientRecord.name}</CardTitle>
              <ClientStatusBadge status={clientRecord.status} />
              {clientRecord.archived_at ? (
                <Badge className="border-zinc-200 bg-zinc-100 text-zinc-700" variant="outline">
                  Archived
                </Badge>
              ) : null}
            </div>
            <CardDescription>
              {clientRecord.company ?? "Independent client"} • Created{" "}
              {format(new Date(clientRecord.created_at), "MMM d, yyyy")}
            </CardDescription>
            <div className="flex flex-wrap gap-2">
              {clientRecord.tags.length > 0 ? (
                clientRecord.tags.map((tag) => (
                  <Badge key={tag} className="bg-orange-50 text-orange-700" variant="secondary">
                    {tag}
                  </Badge>
                ))
              ) : (
                <Badge className="bg-zinc-100 text-zinc-600" variant="secondary">
                  No tags yet
                </Badge>
              )}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-orange-200/70 bg-orange-50/60 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-600">Pipeline value</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-950">
                {formatCurrency(totalPipelineValue)}
              </p>
            </div>
            <div className="rounded-2xl border border-orange-200/70 bg-orange-50/60 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-600">Open deals</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-950">{openDeals.length}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-orange-50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/30">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Key relationship details and contact points.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-orange-200/70 bg-white px-4 py-4">
                  <p className="text-sm font-medium text-zinc-500">Email</p>
                  <p className="mt-2 flex items-center gap-2 text-zinc-950">
                    <Mail className="h-4 w-4 text-orange-500" />
                    {clientRecord.email ?? "Not provided"}
                  </p>
                </div>
                <div className="rounded-2xl border border-orange-200/70 bg-white px-4 py-4">
                  <p className="text-sm font-medium text-zinc-500">Phone</p>
                  <p className="mt-2 flex items-center gap-2 text-zinc-950">
                    <Phone className="h-4 w-4 text-orange-500" />
                    {clientRecord.phone ?? "Not provided"}
                  </p>
                </div>
                <div className="rounded-2xl border border-orange-200/70 bg-white px-4 py-4">
                  <p className="text-sm font-medium text-zinc-500">Website</p>
                  <p className="mt-2 flex items-center gap-2 text-zinc-950">
                    <Globe className="h-4 w-4 text-orange-500" />
                    {clientRecord.website ? (
                      <a
                        className="text-orange-700 underline underline-offset-4"
                        href={clientRecord.website}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {clientRecord.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
                <div className="rounded-2xl border border-orange-200/70 bg-white px-4 py-4">
                  <p className="text-sm font-medium text-zinc-500">Location</p>
                  <p className="mt-2 flex items-center gap-2 text-zinc-950">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    {clientRecord.location ?? "Not provided"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/30">
              <CardHeader>
                <CardTitle>Relationship summary</CardTitle>
                <CardDescription>Quick read on how active this account is right now.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-orange-200/70 bg-orange-50/60 px-4 py-4">
                  <p className="text-sm text-zinc-500">Total tasks</p>
                  <p className="mt-2 text-3xl font-semibold text-zinc-950">{relatedTasks.length}</p>
                </div>
                <div className="rounded-2xl border border-orange-200/70 bg-orange-50/60 px-4 py-4">
                  <p className="text-sm text-zinc-500">Average win probability</p>
                  <p className="mt-2 text-3xl font-semibold text-zinc-950">
                    {relatedDeals.length
                      ? Math.round(
                          relatedDeals.reduce((sum, deal) => sum + (deal.probability ?? 0), 0) /
                            relatedDeals.length
                        )
                      : 0}
                    %
                  </p>
                </div>
                <Button asChild className="w-full bg-orange-500 text-white hover:bg-orange-600">
                  <Link href="/pipeline">
                    <TrendingUp className="h-4 w-4" />
                    Open pipeline board
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deals">
          <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/30">
            <CardHeader>
              <CardTitle>Deals for this client</CardTitle>
              <CardDescription>Current opportunities linked to this record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedDeals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-8 text-sm text-zinc-500">
                  No deals linked yet. Add the first opportunity from the pipeline.
                </div>
              ) : (
                relatedDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="rounded-xl border border-orange-200/70 bg-white px-4 py-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-zinc-950">{deal.title}</p>
                        <p className="text-sm text-zinc-500">
                          {deal.status} • {deal.probability}% probability
                        </p>
                      </div>
                      <div className="text-right text-sm text-zinc-600">
                        <p>{formatCurrency(Number(deal.value ?? 0), deal.currency)}</p>
                        <p>
                          {deal.close_date
                            ? format(new Date(deal.close_date), "MMM d, yyyy")
                            : "No close date"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <NoteFeed
            clientId={clientRecord.id}
            emptyState="No notes yet. Capture the latest context for this client."
            notes={relatedNotes}
            searchPlaceholder="Search this client's notes"
            title="Client notes"
            workspaceId={workspaceId}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/30">
            <CardHeader>
              <CardTitle>Tasks for this client</CardTitle>
              <CardDescription>Follow-up work tied to the relationship.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-8 text-sm text-zinc-500">
                  No tasks linked yet. Add a task when follow-up is needed.
                </div>
              ) : (
                relatedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-orange-200/70 bg-white px-4 py-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-zinc-950">{task.title}</p>
                        <p className="text-sm text-zinc-500">
                          {task.status} • {task.priority}
                        </p>
                      </div>
                      <div className="text-right text-sm text-zinc-600">
                        <p>
                          {task.due_date
                            ? format(new Date(task.due_date), "MMM d, yyyy")
                            : "No due date"}
                        </p>
                        <p>
                          {task.assigned_to
                            ? memberMap.get(task.assigned_to)?.display_name ||
                              memberMap.get(task.assigned_to)?.email ||
                              "Assigned"
                            : "Unassigned"}
                        </p>
                      </div>
                    </div>
                    {task.description ? (
                      <p className="mt-3 text-sm leading-6 text-zinc-600">{task.description}</p>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/30">
            <CardHeader>
              <CardTitle>Activity timeline</CardTitle>
              <CardDescription>Recent changes and relationship interactions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedActivities.length === 0 ? (
                <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-8 text-sm text-zinc-500">
                  Activity will appear here as the team updates this client.
                </div>
              ) : (
                relatedActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-xl border border-orange-200/70 bg-white px-4 py-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-zinc-950">{activity.summary}</p>
                        <p className="text-sm capitalize text-zinc-500">
                          {activity.entity_type} • {activity.action.replaceAll("_", " ")}
                        </p>
                      </div>
                      <p className="text-sm text-zinc-500">
                        {format(new Date(activity.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
