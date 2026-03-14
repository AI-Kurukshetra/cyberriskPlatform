"use client";

import type { CSSProperties, JSX } from "react";
import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { CalendarDays, CircleDollarSign, Filter, Target, UserRound } from "lucide-react";
import { toast } from "sonner";
import { getMemberLabel, logActivity } from "@/lib/activity";
import { DealFormDialog } from "@/components/pipeline/deal-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { cn, formatCurrency } from "@/lib/utils";
import type {
  DealRecord,
  PipelineClientOption,
  PipelineMemberOption,
  PipelineStageRecord,
} from "@/types/pipeline";

interface KanbanBoardProps {
  clients: PipelineClientOption[];
  deals: DealRecord[];
  members: PipelineMemberOption[];
  stages: PipelineStageRecord[];
  workspaceId: string;
}

function stageLabelClass(stageName: string): string {
  switch (stageName.toLowerCase()) {
    case "won":
      return "bg-emerald-100 text-emerald-700";
    case "lost":
      return "bg-red-100 text-red-700";
    default:
      return "bg-orange-100 text-orange-700";
  }
}

function DealCard({
  active = false,
  clients,
  deal,
  disabled = false,
  members,
  stages,
  workspaceId,
}: {
  active?: boolean;
  clients: PipelineClientOption[];
  deal: DealRecord;
  disabled?: boolean;
  members: PipelineMemberOption[];
  stages: PipelineStageRecord[];
  workspaceId: string;
}): JSX.Element {
  const memberLabel = deal.assigned_to
    ? getMemberLabel(
        members.find((member) => member.user_id === deal.assigned_to) ?? {
          email: null,
          display_name: null,
        }
      )
    : "Unassigned";

  return (
    <DealFormDialog
      clients={clients}
      deal={deal}
      members={members}
      stages={stages}
      trigger={
        <button className={cn("w-full text-left", disabled && "cursor-grabbing")} type="button">
          <Card
            className={cn(
              "border-orange-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/70",
              active && "rotate-1 border-orange-300 shadow-lg shadow-orange-200/60"
            )}
          >
            <CardHeader className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">{deal.title}</CardTitle>
                  <CardDescription>{deal.clients?.name ?? "No client linked"}</CardDescription>
                </div>
                <Badge className={stageLabelClass(deal.status)} variant="secondary">
                  {deal.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0 text-sm text-zinc-600">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-orange-500" />
                <span>{formatCurrency(Number(deal.value ?? 0), deal.currency)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-orange-500" />
                <span>
                  {deal.close_date ? format(new Date(deal.close_date), "MMM d, yyyy") : "No close date"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                <span>{deal.probability}% probability</span>
              </div>
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-orange-500" />
                <span>{memberLabel}</span>
              </div>
              {deal.lost_reason ? (
                <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                  Lost reason: {deal.lost_reason}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </button>
      }
      triggerLabel="Edit"
      workspaceId={workspaceId}
    />
  );
}

function DraggableDealCard(props: {
  clients: PipelineClientOption[];
  deal: DealRecord;
  members: PipelineMemberOption[];
  stages: PipelineStageRecord[];
  workspaceId: string;
}): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `deal:${props.deal.id}`,
    data: {
      deal: props.deal,
    },
  });

  const style: CSSProperties | undefined = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <DealCard {...props} active={isDragging} disabled={isDragging} />
    </div>
  );
}

function StageColumn({
  children,
  count,
  stage,
  totalValue,
}: {
  children: React.ReactNode;
  count: number;
  stage: PipelineStageRecord;
  totalValue: number;
}): JSX.Element {
  const { isOver, setNodeRef } = useDroppable({
    id: `stage:${stage.id}`,
  });

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "border-orange-200/80 bg-[linear-gradient(180deg,#ffffff,#fff7ed)] shadow-[0_16px_45px_rgba(249,115,22,0.08)]",
        isOver && "border-orange-400 shadow-lg shadow-orange-200/60"
      )}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{stage.name}</CardTitle>
            <CardDescription>{count} deals</CardDescription>
          </div>
          <Badge
            className="border-transparent px-3 py-1 text-xs uppercase tracking-[0.18em]"
            style={{ backgroundColor: `${stage.color ?? "#f97316"}1A`, color: stage.color ?? "#f97316" }}
            variant="outline"
          >
            {count}
          </Badge>
        </div>
        <div className="rounded-2xl border border-orange-200/70 bg-white/90 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-orange-600">Stage total</p>
          <p className="mt-1 text-lg font-semibold text-zinc-950">{formatCurrency(totalValue)}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
      </CardContent>
    </Card>
  );
}

export function KanbanBoard({
  clients,
  deals,
  members,
  stages,
  workspaceId,
}: KanbanBoardProps): JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [boardDeals, setBoardDeals] = useState<DealRecord[]>(deals);
  const [activeDeal, setActiveDeal] = useState<DealRecord | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [minValue, setMinValue] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setBoardDeals(deals);
  }, [deals]);

  useEffect(() => {
    const channel = supabase
      .channel(`deals:${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deals",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          startTransition(() => {
            router.refresh();
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router, supabase, workspaceId]);

  const filteredDeals = useMemo(() => {
    return boardDeals.filter((deal) => {
      const matchesAssignee =
        assigneeFilter === "all"
          ? true
          : assigneeFilter === "unassigned"
            ? !deal.assigned_to
            : deal.assigned_to === assigneeFilter;
      const matchesStatus = statusFilter === "all" || deal.status === statusFilter;
      const matchesValue = minValue ? Number(deal.value ?? 0) >= Number(minValue) : true;

      return matchesAssignee && matchesStatus && matchesValue;
    });
  }, [assigneeFilter, boardDeals, minValue, statusFilter]);

  async function moveDealToStage(deal: DealRecord, stageId: string): Promise<void> {
    const nextStage = stages.find((stage) => stage.id === stageId);

    setBoardDeals((current) =>
      current.map((entry) =>
        entry.id === deal.id
          ? {
              ...entry,
              stage_id: stageId,
              status:
                nextStage?.name.toLowerCase() === "won"
                  ? "won"
                  : nextStage?.name.toLowerCase() === "lost"
                    ? "lost"
                    : "open",
            }
          : entry
      )
    );

    const { error } = await supabase
      .from("deals")
      .update({
        stage_id: stageId,
        status:
          nextStage?.name.toLowerCase() === "won"
            ? "won"
            : nextStage?.name.toLowerCase() === "lost"
              ? "lost"
              : "open",
      })
      .eq("id", deal.id);

    if (error) {
      toast.error(error.message);
      setBoardDeals(deals);
      return;
    }

    await logActivity(supabase, {
      workspaceId,
      entityType: "deal",
      entityId: deal.id,
      action: "stage_changed",
      summary: `Moved "${deal.title}" to ${nextStage?.name ?? "another stage"}.`,
    });

    toast.success(`Moved to ${nextStage?.name ?? "the selected stage"}.`);
  }

  function handleDragStart(event: DragStartEvent): void {
    setActiveDeal(event.active.data.current?.deal as DealRecord);
  }

  function handleDragEnd(event: DragEndEvent): void {
    setActiveDeal(null);

    const deal = event.active.data.current?.deal as DealRecord | undefined;
    const stageId =
      typeof event.over?.id === "string" && event.over.id.startsWith("stage:")
        ? event.over.id.replace("stage:", "")
        : null;

    if (!deal || !stageId || stageId === deal.stage_id) {
      return;
    }

    startTransition(() => {
      void moveDealToStage(deal, stageId);
    });
  }

  return (
    <div className="space-y-6">
      <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/30">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-orange-500" />
              Pipeline filters
            </CardTitle>
            <CardDescription>Filter by assignee, status, and minimum deal value without leaving the board.</CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select onValueChange={setAssigneeFilter} value={assigneeFilter}>
              <SelectTrigger className="min-w-[180px] border-orange-200 focus:ring-orange-200">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    {getMemberLabel(member)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger className="min-w-[160px] border-orange-200 focus:ring-orange-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Input
              className="min-w-[160px] border-orange-200 focus-visible:ring-orange-200"
              min="0"
              onChange={(event) => setMinValue(event.target.value)}
              placeholder="Min value"
              type="number"
              value={minValue}
            />
          </div>
        </CardHeader>
      </Card>

      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <div className="grid gap-4 xl:grid-cols-5">
          {stages.map((stage) => {
            const stageDeals = filteredDeals.filter((deal) => deal.stage_id === stage.id);
            const totalValue = stageDeals.reduce(
              (sum, deal) => sum + Number(deal.value ?? 0),
              0
            );

            return (
              <StageColumn
                key={stage.id}
                count={stageDeals.length}
                stage={stage}
                totalValue={totalValue}
              >
                {stageDeals.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-8 text-sm text-zinc-500">
                    No deals in this stage yet.
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <DraggableDealCard
                      key={deal.id}
                      clients={clients}
                      deal={deal}
                      members={members}
                      stages={stages}
                      workspaceId={workspaceId}
                    />
                  ))
                )}
              </StageColumn>
            );
          })}
        </div>
        <DragOverlay>
          {activeDeal ? (
            <div className="w-[320px]">
              <DealCard
                active
                clients={clients}
                deal={activeDeal}
                members={members}
                stages={stages}
                workspaceId={workspaceId}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
