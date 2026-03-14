import type { JSX } from "react";
import { endOfMonth, format, isToday, parseISO, startOfMonth, subMonths } from "date-fns";
import { ArrowRight, CalendarClock, CheckCircle2, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/supabase/workspace";
import { formatCurrency } from "@/lib/utils";

interface DashboardDeal {
  id: string;
  title: string;
  value: number;
  currency: string;
  probability: number;
  status: "open" | "won" | "lost";
  close_date: string | null;
  stage_id: string | null;
  client_id: string | null;
  created_at: string;
  clients: {
    name: string;
  } | null;
}

interface DashboardTask {
  id: string;
  title: string;
  due_date: string | null;
  status: "todo" | "inprogress" | "done";
  assigned_to: string | null;
  clients: {
    name: string;
  } | null;
}

interface DashboardStage {
  id: string;
  name: string;
  position: number;
}

interface DashboardActivity {
  id: string;
  summary: string;
  entity_type: string;
  action: string;
  created_at: string;
}

export default async function DashboardPage(): Promise<JSX.Element> {
  const supabase = await createClient();
  const { workspaceId } = await requireWorkspaceContext();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    { data: deals },
    { data: tasks },
    { data: stages },
    { data: activities },
  ] = await Promise.all([
    supabase
      .from("deals")
      .select("id, title, value, currency, probability, status, close_date, stage_id, client_id, created_at, clients(name)")
      .eq("workspace_id", workspaceId),
    supabase
      .from("tasks")
      .select("id, title, due_date, status, assigned_to, clients(name)")
      .eq("workspace_id", workspaceId),
    supabase
      .from("pipeline_stages")
      .select("id, name, position")
      .eq("workspace_id", workspaceId)
      .order("position", { ascending: true }),
    supabase
      .from("activities")
      .select("id, summary, entity_type, action, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const safeDeals = (deals ?? []) as DashboardDeal[];
  const safeTasks = (tasks ?? []) as DashboardTask[];
  const safeStages = (stages ?? []) as DashboardStage[];
  const safeActivities = (activities ?? []) as DashboardActivity[];
  const pipelineValue = safeDeals
    .filter((deal) => deal.status === "open")
    .reduce((sum, deal) => sum + Number(deal.value ?? 0), 0);
  const monthClosingDeals = safeDeals.filter(
    (deal) =>
      deal.close_date &&
      new Date(deal.close_date) >= monthStart &&
      new Date(deal.close_date) <= monthEnd
  );
  const todayTasks = safeTasks.filter(
    (task) => task.due_date && task.status !== "done" && isToday(parseISO(task.due_date))
  );
  const closedDeals = safeDeals.filter((deal) => deal.status === "won" || deal.status === "lost");
  const wonDeals = safeDeals.filter((deal) => deal.status === "won");
  const winRate = closedDeals.length
    ? Math.round((wonDeals.length / closedDeals.length) * 100)
    : 0;
  const soonDeals = [...monthClosingDeals]
    .sort((left, right) => (left.close_date ?? "").localeCompare(right.close_date ?? ""))
    .slice(0, 4);
  const overdueTasks = safeTasks.filter(
    (task) => task.due_date && task.status !== "done" && new Date(task.due_date) < now
  );

  const stageDeals = safeStages.map((stage) => {
    const dealsInStage = safeDeals.filter((deal) => deal.stage_id === stage.id);

    return {
      name: stage.name,
      deals: dealsInStage.length,
      value: dealsInStage.reduce((sum, deal) => sum + Number(deal.value ?? 0), 0),
    };
  });

  const topClients = Array.from(
    safeDeals.reduce((map, deal) => {
      const key = deal.clients?.name ?? "Unlinked deals";
      const current = map.get(key) ?? 0;
      map.set(key, current + Number(deal.value ?? 0));
      return map;
    }, new Map<string, number>())
  )
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);

  const revenueTrend = Array.from({ length: 6 }).map((_, index) => {
    const targetMonth = subMonths(now, 5 - index);
    const label = format(targetMonth, "MMM");
    const wonRevenue = safeDeals
      .filter(
        (deal) =>
          deal.status === "won" &&
          deal.close_date &&
          format(new Date(deal.close_date), "yyyy-MM") === format(targetMonth, "yyyy-MM")
      )
      .reduce((sum, deal) => sum + Number(deal.value ?? 0), 0);

    return {
      label,
      revenue: wonRevenue,
    };
  });

  const metrics = [
    { label: "Pipeline value", value: formatCurrency(pipelineValue), icon: TrendingUp },
    { label: "Closing this month", value: String(monthClosingDeals.length), icon: Target },
    { label: "Tasks due today", value: String(todayTasks.length), icon: CalendarClock },
    { label: "Win rate", value: `${winRate}%`, icon: CheckCircle2 },
  ] as const;

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          eyebrow="Dashboard"
          title="Workspace dashboard"
          description="A daily control room for revenue momentum, active follow-ups, and the latest team activity."
        />
        <Button asChild className="bg-orange-500 text-white hover:bg-orange-600">
          <Link href="/clients">
            Add first client
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label} className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardDescription>{metric.label}</CardDescription>
                <div className="rounded-xl bg-orange-100 p-2 text-orange-600">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/40">
          <CardHeader>
            <Badge className="w-fit rounded-full border-orange-200 bg-orange-50 px-3 py-1.5 text-orange-700" variant="outline">
              Today&apos;s Focus
            </Badge>
            <CardTitle className="mt-4">What needs attention now</CardTitle>
            <CardDescription>Today&apos;s tasks, overdue work, and the nearest deals closing this month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-500">Overdue tasks</p>
              {overdueTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-8 text-sm text-zinc-500">
                  No overdue tasks.
                </div>
              ) : (
                overdueTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="rounded-xl border border-red-200/70 bg-red-50/50 px-4 py-3">
                    <p className="font-medium text-zinc-950">{task.title}</p>
                    <p className="text-sm text-zinc-500">
                      {task.clients?.name ?? "No client"} • Due {task.due_date}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-500">Deals closing this month</p>
              {soonDeals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-8 text-sm text-zinc-500">
                  No deals closing this month.
                </div>
              ) : (
                soonDeals.map((deal) => (
                  <div key={deal.id} className="rounded-xl border border-orange-200/70 bg-white px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-zinc-950">{deal.title}</p>
                        <p className="text-sm text-zinc-500">
                          {deal.clients?.name ?? "No client"} • {deal.close_date ? format(new Date(deal.close_date), "MMM d, yyyy") : "No date"}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-zinc-700">
                        {formatCurrency(Number(deal.value ?? 0), deal.currency)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/40">
          <CardHeader>
            <Badge className="w-fit rounded-full border-orange-200 bg-orange-50 px-3 py-1.5 text-orange-700" variant="outline">
              Top Clients
            </Badge>
            <CardTitle className="mt-4">Highest-value accounts</CardTitle>
            <CardDescription>Clients ranked by current and closed deal value in the workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topClients.length === 0 ? (
              <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-8 text-sm text-zinc-500">
                Add deals to populate top clients.
              </div>
            ) : (
              topClients.map((client, index) => (
                <div key={client.name} className="flex items-center justify-between rounded-xl border border-orange-200/70 bg-white px-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-950">
                      {index + 1}. {client.name}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-zinc-700">{formatCurrency(client.value)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/40">
        <CardHeader>
          <CardTitle>Conversion funnel and revenue trend</CardTitle>
          <CardDescription>Stage volume on the left and won revenue by month on the right.</CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardCharts funnelData={stageDeals} revenueTrend={revenueTrend} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/40">
          <CardHeader>
            <CardTitle>Pipeline stage totals</CardTitle>
            <CardDescription>Board-level stage volume and total value.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stageDeals.map((stage) => (
              <div key={stage.name} className="rounded-xl border border-orange-200/70 bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-zinc-950">{stage.name}</p>
                  <p className="text-sm text-zinc-500">{stage.deals} deals</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-orange-100">
                  <div
                    className="h-2 rounded-full bg-orange-500"
                    style={{
                      width: `${safeDeals.length ? Math.max((stage.deals / safeDeals.length) * 100, stage.deals > 0 ? 10 : 0) : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-3 text-sm text-zinc-600">{formatCurrency(stage.value)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/40">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>The latest 15 workspace events across clients, deals, tasks, and notes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {safeActivities.length === 0 ? (
              <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-8 text-sm text-zinc-500">
                Activity will appear here as the workspace is used.
              </div>
            ) : (
              safeActivities.map((activity) => (
                <div key={activity.id} className="rounded-xl border border-orange-200/70 bg-white px-4 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-zinc-950">{activity.summary}</p>
                      <p className="text-sm capitalize text-zinc-500">
                        {activity.entity_type} • {activity.action.replaceAll("_", " ")}
                      </p>
                    </div>
                    <p className="text-sm text-zinc-500">
                      {format(new Date(activity.created_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
