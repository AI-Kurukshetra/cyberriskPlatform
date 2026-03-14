import type { JSX } from "react";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { WorkspaceOnboardingForm } from "@/components/onboarding/workspace-onboarding-form";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceMembership } from "@/lib/supabase/workspace";

export default async function OnboardingPage(): Promise<JSX.Element> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const membership = await getWorkspaceMembership(user.id);
  if (membership) {
    redirect("/dashboard");
  }

  return (
    <div className="grid w-full gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-600">
          Workspace setup
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
          Create your first ClientPulse workspace.
        </h1>
        <p className="max-w-xl text-base leading-7 text-zinc-600">
          Add a workspace name and ClientPulse will create the workspace, owner membership, and default pipeline stages for you.
        </p>
      </div>
      <AuthCard
        eyebrow="Onboarding"
        title="Create workspace"
        description="Create the workspace and become its owner."
      >
        <WorkspaceOnboardingForm />
      </AuthCard>
    </div>
  );
}
