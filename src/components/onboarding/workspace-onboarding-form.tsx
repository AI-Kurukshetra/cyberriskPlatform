"use client";

import type { JSX } from "react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

const onboardingSchema = z.object({
  workspaceName: z.string().min(2, "Workspace name is required."),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const DEFAULT_STAGES = [
  { name: "Lead", position: 1 },
  { name: "Proposal", position: 2 },
  { name: "Negotiation", position: 3 },
  { name: "Won", position: 4 },
] as const;

export function WorkspaceOnboardingForm(): JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      workspaceName: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    setIsPending(true);

    startTransition(async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setFormError("You must be logged in before creating a workspace.");
        setIsPending(false);
        return;
      }

      const baseSlug = slugify(values.workspaceName) || "workspace";

      const { data: existingMembership } = await supabase
        .from("workspace_members")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (existingMembership) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const slugCandidates = [baseSlug, `${baseSlug}-${user.id.slice(0, 8)}`];
      let workspace: { id: string } | null = null;
      let workspaceError: { code?: string; message: string } | null = null;

      for (const slug of slugCandidates) {
        const result = await supabase
          .from("workspaces")
          .insert({
            name: values.workspaceName,
            slug,
            created_by: user.id,
          })
          .select("id")
          .single();

        if (!result.error && result.data) {
          workspace = result.data;
          workspaceError = null;
          break;
        }

        workspaceError = result.error;

        if (result.error?.code !== "23505") {
          break;
        }
      }

      if (workspaceError || !workspace) {
        setFormError(workspaceError?.message ?? "Unable to create workspace.");
        setIsPending(false);
        return;
      }

      const { error: membershipError } = await supabase.from("workspace_members").insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "owner",
      });

      if (membershipError) {
        setFormError(membershipError.message);
        setIsPending(false);
        return;
      }

      const { error: stagesError } = await supabase.from("pipeline_stages").insert(
        DEFAULT_STAGES.map((stage) => ({
          workspace_id: workspace.id,
          name: stage.name,
          position: stage.position,
        }))
      );

      if (stagesError) {
        setFormError(stagesError.message);
        setIsPending(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="workspaceName">Workspace name</Label>
        <Input
          id="workspaceName"
          type="text"
          placeholder="Northwind Consulting"
          {...register("workspaceName")}
        />
        {errors.workspaceName ? (
          <p className="text-sm text-red-600">{errors.workspaceName.message}</p>
        ) : null}
      </div>
      {formError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </div>
      ) : null}
      <Button
        className="w-full bg-orange-500 text-white hover:bg-orange-600"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Creating workspace..." : "Create workspace"}
      </Button>
    </form>
  );
}
