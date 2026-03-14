import type { JSX } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceMembership } from "@/lib/supabase/workspace";

export default async function SignupPage(): Promise<JSX.Element> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const membership = await getWorkspaceMembership(user.id);
    redirect(membership ? "/dashboard" : "/onboarding");
  }

  return (
    <div className="grid w-full gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-600">
          Start free trial
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
          Create your workspace entry point.
        </h1>
        <p className="max-w-xl text-base leading-7 text-zinc-600">
          Sign up with email and password, then create your first workspace and start managing clients, deals, and follow-up tasks.
        </p>
      </div>
      <AuthCard
        eyebrow="Create account"
        title="Start your free trial"
        description="Email and password only for the MVP."
      >
        <SignupForm />
        <p className="mt-4 text-sm text-zinc-600">
          Already have an account?{" "}
          <Link className="font-medium text-orange-700 underline underline-offset-4" href="/login">
            Log in
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
