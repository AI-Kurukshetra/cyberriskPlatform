"use client";

import type { JSX } from "react";
import { isAfter, isBefore, isToday, parseISO } from "date-fns";
import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, UserRound } from "lucide-react";
import { toast } from "sonner";
import { getMemberLabel, logActivity } from "@/lib/activity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { TaskMemberOption, TaskRecord } from "@/types/task";

interface TaskSectionsProps {
  currentUserId: string;
  members: TaskMemberOption[];
  tasks: TaskRecord[];
  workspaceId: string;
}

function priorityClass(priority: TaskRecord["priority"]): string {
  switch (priority) {
    case "high":
      return "border-red-200 bg-red-50 text-red-700";
    case "medium":
      return "border-orange-200 bg-orange-50 text-orange-700";
    default:
      return "border-zinc-200 bg-zinc-100 text-zinc-700";
  }
}

function statusClass(status: TaskRecord["status"]): string {
  switch (status) {
    case "done":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "inprogress":
      return "border-orange-200 bg-orange-50 text-orange-700";
    default:
      return "border-zinc-200 bg-zinc-100 text-zinc-700";
  }
}

function groupTasks(tasks: TaskRecord[]): {
  completed: TaskRecord[];
  dueToday: TaskRecord[];
  overdue: TaskRecord[];
  upcoming: TaskRecord[];
} {
  const now = new Date();

  return tasks.reduce(
    (accumulator, task) => {
      if (task.status === "done") {
        accumulator.completed.push(task);
      } else if (task.due_date && isToday(parseISO(task.due_date))) {
        accumulator.dueToday.push(task);
      } else if (task.due_date && isBefore(parseISO(task.due_date), now)) {
        accumulator.overdue.push(task);
      } else if (task.due_date && isAfter(parseISO(task.due_date), new Date())) {
        accumulator.upcoming.push(task);
      } else {
        accumulator.upcoming.push(task);
      }

      return accumulator;
    },
    {
      completed: [] as TaskRecord[],
      dueToday: [] as TaskRecord[],
      overdue: [] as TaskRecord[],
      upcoming: [] as TaskRecord[],
    }
  );
}

function TaskGroup({
  description,
  onComplete,
  tasks,
  title,
  memberLabelById,
}: {
  description: string;
  memberLabelById: Map<string, string>;
  onComplete: (taskId: string) => void;
  tasks: TaskRecord[];
  title: string;
}): JSX.Element {
  return (
    <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/30">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-8 text-sm text-zinc-500">
            No tasks in this section yet.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-4 rounded-xl border border-orange-200/70 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-zinc-950">{task.title}</p>
                  <Badge className={priorityClass(task.priority)} variant="outline">
                    {task.priority}
                  </Badge>
                  <Badge className={statusClass(task.status)} variant="outline">
                    {task.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-500">
                  <span>{task.clients?.name ?? "No client linked"}</span>
                  {task.deals?.title ? <span>Deal: {task.deals.title}</span> : null}
                  {task.assigned_to ? (
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="h-3.5 w-3.5 text-orange-500" />
                      {memberLabelById.get(task.assigned_to) ?? "Assigned"}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
                    {task.due_date ? task.due_date : "No due date"}
                  </span>
                </div>
              </div>
              {task.status !== "done" ? (
                <Button
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={() => onComplete(task.id)}
                  type="button"
                  variant="outline"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark done
                </Button>
              ) : (
                <div className="inline-flex items-center gap-2 text-sm text-zinc-500">
                  <Clock3 className="h-4 w-4" />
                  Completed
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function TaskSections({
  currentUserId,
  members,
  tasks,
  workspaceId,
}: TaskSectionsProps): JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [scope, setScope] = useState<string>("all");
  const memberLabelById = useMemo(
    () =>
      new Map(
        members
          .filter((member) => member.user_id)
          .map((member) => [member.user_id, getMemberLabel(member)])
      ),
    [members]
  );
  const visibleTasks = useMemo(() => {
    if (scope === "mine") {
      return tasks.filter((task) => task.assigned_to === currentUserId);
    }

    if (scope === "unassigned") {
      return tasks.filter((task) => !task.assigned_to);
    }

    return tasks;
  }, [currentUserId, scope, tasks]);
  const groupedTasks = groupTasks(visibleTasks);

  function handleComplete(taskId: string): void {
    setUpdatingId(taskId);

    startTransition(async () => {
      const { error } = await supabase.from("tasks").update({ status: "done" }).eq("id", taskId);

      if (error) {
        toast.error(error.message);
        setUpdatingId(null);
        return;
      }

      await logActivity(supabase, {
        workspaceId,
        entityType: "task",
        entityId: taskId,
        action: "completed",
        summary: "Completed a task.",
      });
      setUpdatingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/30">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Task operating view</CardTitle>
            <CardDescription>Switch between all tasks, work assigned to you, or unassigned follow-ups.</CardDescription>
          </div>
          <Select onValueChange={setScope} value={scope}>
            <SelectTrigger className="min-w-[180px] border-orange-200 focus:ring-orange-200">
              <SelectValue placeholder="Select task scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tasks</SelectItem>
              <SelectItem value="mine">My tasks</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
      </Card>
      <div className="grid gap-6 xl:grid-cols-4">
        <TaskGroup
          description="Items already past due and still open."
          memberLabelById={memberLabelById}
          onComplete={handleComplete}
          tasks={groupedTasks.overdue}
          title={updatingId ? "Overdue • Updating..." : "Overdue"}
        />
        <TaskGroup
          description="Tasks that need attention today."
          memberLabelById={memberLabelById}
          onComplete={handleComplete}
          tasks={groupedTasks.dueToday}
          title={updatingId ? "Due Today • Updating..." : "Due Today"}
        />
        <TaskGroup
          description="Upcoming work and tasks without a due date."
          memberLabelById={memberLabelById}
          onComplete={handleComplete}
          tasks={groupedTasks.upcoming}
          title="Upcoming"
        />
        <TaskGroup
          description="Recently completed tasks."
          memberLabelById={memberLabelById}
          onComplete={handleComplete}
          tasks={groupedTasks.completed}
          title="Completed"
        />
      </div>
      {groupedTasks.overdue.length > 0 ? (
        <Card className="border-red-200/80 bg-[linear-gradient(180deg,#fff1f2,#ffffff)] shadow-sm shadow-red-100/40">
          <CardContent className="flex items-center gap-3 p-5 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {groupedTasks.overdue.length} overdue task{groupedTasks.overdue.length === 1 ? "" : "s"} need attention.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
