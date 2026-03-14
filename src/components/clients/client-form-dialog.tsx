"use client";

import type { JSX } from "react";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";
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
import type { ClientRecord } from "@/types/client";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required."),
  company: z.string().nullable(),
  email: z.string().email("Enter a valid email address.").or(z.literal("")),
  phone: z.string().nullable(),
  website: z.string().url("Enter a valid URL.").or(z.literal("")),
  location: z.string().nullable(),
  tags: z.string().nullable(),
  status: z.enum(["lead", "active", "inactive"]),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormDialogProps {
  client?: ClientRecord;
  trigger?: React.ReactNode;
  triggerLabel: string;
  workspaceId: string;
}

export function ClientFormDialog({
  client,
  trigger,
  triggerLabel,
  workspaceId,
}: ClientFormDialogProps): JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name ?? "",
      company: client?.company ?? "",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
      website: client?.website ?? "",
      location: client?.location ?? "",
      tags: client?.tags?.join(", ") ?? "",
      status: client?.status ?? "lead",
    },
  });

  const statusValue = useWatch({
    control,
    name: "status",
  });

  useEffect(() => {
    reset({
      name: client?.name ?? "",
      company: client?.company ?? "",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
      website: client?.website ?? "",
      location: client?.location ?? "",
      tags: client?.tags?.join(", ") ?? "",
      status: client?.status ?? "lead",
    });
  }, [client, reset]);

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    setIsPending(true);

    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const payload = {
        workspace_id: workspaceId,
        name: values.name,
        company: values.company || null,
        email: values.email || null,
        phone: values.phone || null,
        website: values.website || null,
        location: values.location || null,
        tags: values.tags
          ? values.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        status: values.status,
      };

      const query = client
        ? supabase.from("clients").update(payload).eq("id", client.id)
        : supabase.from("clients").insert({
            ...payload,
            created_by: user?.id ?? null,
          });

      const { error } = await query;

      if (error) {
        setFormError(error.message);
        toast.error(error.message);
        setIsPending(false);
        return;
      }

      await logActivity(supabase, {
        workspaceId,
        entityType: "client",
        entityId: client?.id,
        action: client ? "updated" : "created",
        summary: client ? `Updated ${values.name}.` : `Created ${values.name}.`,
      });

      setOpen(false);
      setIsPending(false);
      toast.success(client ? "Client updated." : "Client created.");
      router.refresh();
    });
  });

  function handleArchive(): void {
    if (!client) {
      return;
    }

    setIsPending(true);
    setFormError(null);

    startTransition(async () => {
      const { error } = await supabase
        .from("clients")
        .update({
          archived_at: client.archived_at ? null : new Date().toISOString(),
        })
        .eq("id", client.id);

      if (error) {
        setFormError(error.message);
        toast.error(error.message);
        setIsPending(false);
        return;
      }

      await logActivity(supabase, {
        workspaceId,
        entityType: "client",
        entityId: client.id,
        action: client.archived_at ? "restored" : "archived",
        summary: client.archived_at ? `Restored ${client.name}.` : `Archived ${client.name}.`,
      });

      setOpen(false);
      setIsPending(false);
      toast.success(client.archived_at ? "Client restored." : "Client archived.");
      router.refresh();
    });
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            className={client ? "text-zinc-700 hover:bg-orange-50 hover:text-orange-700" : "bg-orange-500 text-white hover:bg-orange-600"}
            type="button"
            variant={client ? "ghost" : "default"}
          >
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-orange-200 bg-white">
        <DialogHeader>
          <DialogTitle>{client ? "Edit client" : "Add client"}</DialogTitle>
          <DialogDescription>
            Save core client details for the current workspace.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              className="border-orange-200 focus-visible:ring-orange-200"
              placeholder="Lisa Wong"
            />
            {errors.name ? <p className="text-sm text-red-600">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              {...register("company")}
              className="border-orange-200 focus-visible:ring-orange-200"
              placeholder="Wong Imports"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              {...register("email")}
              className="border-orange-200 focus-visible:ring-orange-200"
              placeholder="lisa@company.com"
            />
            {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register("phone")}
              className="border-orange-200 focus-visible:ring-orange-200"
              placeholder="+1 555 123 4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...register("website")}
              className="border-orange-200 focus-visible:ring-orange-200"
              placeholder="https://client.com"
            />
            {errors.website ? <p className="text-sm text-red-600">{errors.website.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register("location")}
              className="border-orange-200 focus-visible:ring-orange-200"
              placeholder="Mumbai, IN"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Textarea
              id="tags"
              {...register("tags")}
              className="min-h-[72px] border-orange-200 focus-visible:ring-orange-200"
              placeholder="retainer, website redesign, warm lead"
            />
            <p className="text-xs text-zinc-500">Separate tags with commas.</p>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              onValueChange={(value) =>
                setValue("status", value as ClientFormValues["status"], {
                  shouldValidate: true,
                })
              }
              value={statusValue}
            >
              <SelectTrigger className="border-orange-200 focus:ring-orange-200">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          ) : null}
          <DialogFooter>
            {client ? (
              <Button
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                disabled={isPending}
                onClick={handleArchive}
                type="button"
                variant="outline"
              >
                {client.archived_at ? "Restore client" : "Archive client"}
              </Button>
            ) : null}
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Saving..." : client ? "Save changes" : "Create client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
