"use client";

import type { JSX } from "react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getMemberLabel, logActivity } from "@/lib/activity";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { TaskClientOption, TaskDealOption, TaskMemberOption } from "@/types/task";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().nullable(),
  clientId: z.string().nullable(),
  dealId: z.string().nullable(),
  assignedTo: z.string().nullable(),
  dueDate: z.string().nullable(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "inprogress", "done"]),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormDialogProps {
  clients: TaskClientOption[];
  deals: TaskDealOption[];
  members: TaskMemberOption[];
  initialClientId?: string | null;
  initialDealId?: string | null;
  trigger?: React.ReactNode;
  triggerLabel: string;
  workspaceId: string;
}

export function TaskFormDialog({
  clients,
  deals,
  members,
  initialClientId = null,
  initialDealId = null,
  trigger,
  triggerLabel,
  workspaceId,
}: TaskFormDialogProps): JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    handleSubmit,
    register,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      clientId: initialClientId,
      dealId: initialDealId,
      assignedTo: null,
      dueDate: "",
      priority: "medium",
      status: "todo",
    },
  });

  const clientValue = useWatch({
    control,
    name: "clientId",
  });
  const priorityValue = useWatch({
    control,
    name: "priority",
  });
  const dealValue = useWatch({
    control,
    name: "dealId",
  });
  const assigneeValue = useWatch({
    control,
    name: "assignedTo",
  });
  const statusValue = useWatch({
    control,
    name: "status",
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    setIsPending(true);

    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("tasks")
        .insert({
        workspace_id: workspaceId,
        title: values.title,
        description: values.description || null,
        client_id: values.clientId || null,
        deal_id: values.dealId || null,
        assigned_to: values.assignedTo || null,
        due_date: values.dueDate || null,
        priority: values.priority,
        status: values.status,
      })
        .select("id")
        .single();

      if (error) {
        setFormError(error.message);
        toast.error(error.message);
        setIsPending(false);
        return;
      }

      await logActivity(supabase, {
        workspaceId,
        entityType: "task",
        entityId: data?.id ?? null,
        action: "created",
        summary: `Created task "${values.title}".`,
      });

      if (values.assignedTo && values.assignedTo !== user?.id) {
        await supabase.from("notifications").insert({
          workspace_id: workspaceId,
          user_id: values.assignedTo,
          actor_id: user?.id ?? null,
          type: "task_assigned",
          entity_type: "task",
          entity_id: data?.id ?? null,
        });

        const assignedMember = members.find((member) => member.user_id === values.assignedTo);
        if (assignedMember) {
          await logActivity(supabase, {
            workspaceId,
            entityType: "task",
            entityId: data?.id ?? null,
            action: "assigned",
            summary: `Assigned task to ${getMemberLabel(assignedMember)}.`,
          });
        }
      }

      reset();
      setOpen(false);
      setIsPending(false);
      toast.success("Task created.");
      router.refresh();
    });
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button className="bg-orange-500 text-white hover:bg-orange-600" type="button">
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-orange-200 bg-white">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
          <DialogDescription>
            Create a follow-up task for the current workspace.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              className="border-orange-200 focus-visible:ring-orange-200"
              placeholder="Send proposal deck"
            />
            {errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              className="min-h-[96px] border-orange-200 focus-visible:ring-orange-200"
              placeholder="Add the context the assignee needs."
            />
          </div>
          <div className="space-y-2">
            <Label>Client</Label>
            <Select
              onValueChange={(value) =>
                setValue("clientId", value === "__none__" ? null : value, {
                  shouldValidate: true,
                })
              }
              value={clientValue ?? "__none__"}
            >
              <SelectTrigger className="border-orange-200 focus:ring-orange-200">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No client</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Deal</Label>
            <Select
              onValueChange={(value) =>
                setValue("dealId", value === "__none__" ? null : value, {
                  shouldValidate: true,
                })
              }
              value={dealValue ?? "__none__"}
            >
              <SelectTrigger className="border-orange-200 focus:ring-orange-200">
                <SelectValue placeholder="Select a deal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No deal</SelectItem>
                {deals.map((deal) => (
                  <SelectItem key={deal.id} value={deal.id}>
                    {deal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              type="date"
              className="border-orange-200 focus-visible:ring-orange-200"
              {...register("dueDate")}
            />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              onValueChange={(value) =>
                setValue("priority", value as TaskFormValues["priority"], {
                  shouldValidate: true,
                })
              }
              value={priorityValue}
            >
              <SelectTrigger className="border-orange-200 focus:ring-orange-200">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                onValueChange={(value) =>
                  setValue("assignedTo", value === "__none__" ? null : value, {
                    shouldValidate: true,
                  })
                }
                value={assigneeValue ?? "__none__"}
              >
                <SelectTrigger className="border-orange-200 focus:ring-orange-200">
                  <SelectValue placeholder="Select an assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {getMemberLabel(member)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                onValueChange={(value) =>
                  setValue("status", value as TaskFormValues["status"], {
                    shouldValidate: true,
                  })
                }
                value={statusValue}
              >
                <SelectTrigger className="border-orange-200 focus:ring-orange-200">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="inprogress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {formError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          ) : null}
          <DialogFooter>
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Saving..." : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
