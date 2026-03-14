"use client";

import type { JSX } from "react";
import { startTransition, useEffect, useState } from "react";
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
import type {
  DealRecord,
  PipelineClientOption,
  PipelineMemberOption,
  PipelineStageRecord,
} from "@/types/pipeline";

const dealSchema = z.object({
  title: z.string().min(1, "Title is required."),
  clientId: z.string().nullable(),
  stageId: z.string().min(1, "Stage is required."),
  assignedTo: z.string().nullable(),
  value: z.coerce.number().min(0, "Value must be zero or greater."),
  currency: z.enum(["USD", "INR", "EUR", "GBP"]),
  probability: z.coerce.number().min(0).max(100),
  status: z.enum(["open", "won", "lost"]),
  lostReason: z.string().nullable(),
  closeDate: z.string().nullable(),
});

type DealFormValues = z.infer<typeof dealSchema>;
type DealFormInput = z.input<typeof dealSchema>;

const CURRENCIES = ["USD", "INR", "EUR", "GBP"] as const;
function normalizeCurrency(value: string | null | undefined): DealFormValues["currency"] {
  return CURRENCIES.includes(value as (typeof CURRENCIES)[number])
    ? (value as DealFormValues["currency"])
    : "USD";
}

interface DealFormDialogProps {
  clients: PipelineClientOption[];
  deal?: DealRecord;
  members: PipelineMemberOption[];
  stages: PipelineStageRecord[];
  trigger?: React.ReactNode;
  triggerLabel: string;
  workspaceId: string;
}

export function DealFormDialog({
  clients,
  deal,
  members,
  stages,
  trigger,
  triggerLabel,
  workspaceId,
}: DealFormDialogProps): JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    handleSubmit,
    register,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<DealFormInput, undefined, DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: deal?.title ?? "",
      clientId: deal?.client_id ?? null,
      stageId: deal?.stage_id ?? stages[0]?.id ?? "",
      assignedTo: deal?.assigned_to ?? null,
      value: deal?.value ?? 0,
      currency: normalizeCurrency(deal?.currency),
      probability: deal?.probability ?? 50,
      status: deal?.status ?? "open",
      lostReason: deal?.lost_reason ?? "",
      closeDate: deal?.close_date ?? "",
    },
  });

  const clientValue = useWatch({
    control,
    name: "clientId",
  });
  const stageValue = useWatch({
    control,
    name: "stageId",
  });
  const assigneeValue = useWatch({
    control,
    name: "assignedTo",
  });
  const currencyValue = useWatch({
    control,
    name: "currency",
  });
  const statusValue = useWatch({
    control,
    name: "status",
  });

  useEffect(() => {
    reset({
      title: deal?.title ?? "",
      clientId: deal?.client_id ?? null,
      stageId: deal?.stage_id ?? stages[0]?.id ?? "",
      assignedTo: deal?.assigned_to ?? null,
      value: deal?.value ?? 0,
      currency: normalizeCurrency(deal?.currency),
      probability: deal?.probability ?? 50,
      status: deal?.status ?? "open",
      lostReason: deal?.lost_reason ?? "",
      closeDate: deal?.close_date ?? "",
    });
  }, [deal, reset, stages]);

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    setIsPending(true);

    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const payload = {
        workspace_id: workspaceId,
        title: values.title,
        client_id: values.clientId || null,
        stage_id: values.stageId,
        assigned_to: values.assignedTo || null,
        value: values.value,
        currency: values.currency,
        probability: values.probability,
        status: values.status,
        lost_reason: values.status === "lost" ? values.lostReason || null : null,
        close_date: values.closeDate || null,
      };

      const query = deal
        ? supabase.from("deals").update(payload).eq("id", deal.id)
        : supabase.from("deals").insert({
            ...payload,
            created_by: user?.id ?? null,
          });

      const { data, error } = await query.select("id").single();

      if (error) {
        setFormError(error.message);
        toast.error(error.message);
        setIsPending(false);
        return;
      }

      await logActivity(supabase, {
        workspaceId,
        entityType: "deal",
        entityId: deal?.id ?? data?.id ?? null,
        action: deal ? "updated" : "created",
        summary: deal ? `Updated deal "${values.title}".` : `Created deal "${values.title}".`,
      });

      if (values.assignedTo && values.assignedTo !== user?.id) {
        await supabase.from("notifications").insert({
          workspace_id: workspaceId,
          user_id: values.assignedTo,
          actor_id: user?.id ?? null,
          type: "deal_assigned",
          entity_type: "deal",
          entity_id: deal?.id ?? data?.id ?? null,
        });

        const assignedMember = members.find((member) => member.user_id === values.assignedTo);
        if (assignedMember) {
          await logActivity(supabase, {
            workspaceId,
            entityType: "deal",
            entityId: deal?.id ?? data?.id ?? null,
            action: "assigned",
            summary: `Assigned deal to ${getMemberLabel(assignedMember)}.`,
          });
        }
      }

      setOpen(false);
      setIsPending(false);
      toast.success(deal ? "Deal updated." : "Deal created.");
      router.refresh();
    });
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            className={
              deal
                ? "text-zinc-700 hover:bg-orange-50 hover:text-orange-700"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }
            type="button"
            variant={deal ? "ghost" : "default"}
          >
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-orange-200 bg-white">
        <DialogHeader>
          <DialogTitle>{deal ? "Edit deal" : "New deal"}</DialogTitle>
          <DialogDescription>
            Save pipeline deal details for the current workspace.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              className="border-orange-200 focus-visible:ring-orange-200"
              placeholder="CRM rollout"
            />
            {errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
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
            <Label>Stage</Label>
            <Select
              onValueChange={(value) =>
                setValue("stageId", value, {
                  shouldValidate: true,
                })
              }
              value={stageValue}
            >
              <SelectTrigger className="border-orange-200 focus:ring-orange-200">
                <SelectValue placeholder="Select a stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.stageId ? (
              <p className="text-sm text-red-600">{errors.stageId.message}</p>
            ) : null}
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
                  <SelectValue placeholder="Select assignee" />
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
                  setValue("status", value as DealFormValues["status"], {
                    shouldValidate: true,
                  })
                }
                value={statusValue}
              >
                <SelectTrigger className="border-orange-200 focus:ring-orange-200">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                min="0"
                step="0.01"
                type="number"
                className="border-orange-200 focus-visible:ring-orange-200"
                {...register("value")}
              />
              {errors.value ? <p className="text-sm text-red-600">{errors.value.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                onValueChange={(value) =>
                  setValue("currency", value as DealFormValues["currency"], {
                    shouldValidate: true,
                  })
                }
                value={currencyValue}
              >
                <SelectTrigger className="border-orange-200 focus:ring-orange-200">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="probability">Probability %</Label>
            <Input
              id="probability"
              max="100"
              min="0"
              type="number"
              className="border-orange-200 focus-visible:ring-orange-200"
              {...register("probability")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="closeDate">Close date</Label>
            <Input
              id="closeDate"
              type="date"
              className="border-orange-200 focus-visible:ring-orange-200"
              {...register("closeDate")}
            />
          </div>
          {statusValue === "lost" ? (
            <div className="space-y-2">
              <Label htmlFor="lostReason">Lost reason</Label>
              <Textarea
                id="lostReason"
                {...register("lostReason")}
                className="min-h-[92px] border-orange-200 focus-visible:ring-orange-200"
                placeholder="Price objection, timeline mismatch, competitor selected..."
              />
            </div>
          ) : null}
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
              {isPending ? "Saving..." : deal ? "Save changes" : "Create deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
