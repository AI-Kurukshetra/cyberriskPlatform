import type { JSX } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceMembership } from "@/lib/supabase/workspace";

interface LoginPageProps {
  searchParams: Promise<{
    message?: string;
  }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<JSX.Element> {
  const params = await searchParams;
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
          Email login
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
          Log in and get back to your client pipeline.
        </h1>
        <p className="max-w-xl text-base leading-7 text-zinc-600">
          Access ClientPulse with email and password to manage clients, deals, and follow-up work from one workspace.
        </p>
      </div>
      <AuthCard
        eyebrow="Login"
        title="Welcome back"
        description="Use your email and password to continue into ClientPulse."
      >
        {params.message ? (
          <div className="mb-4 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700">
            {params.message}
          </div>
        ) : null}
        <LoginForm />
        <p className="mt-4 text-sm text-zinc-600">
          Need an account?{" "}
          <Link className="font-medium text-orange-700 underline underline-offset-4" href="/signup">
            Start free trial
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
