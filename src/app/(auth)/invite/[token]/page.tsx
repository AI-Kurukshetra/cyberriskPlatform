import type { JSX } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { InviteAcceptCard } from "@/components/settings/invite-accept-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps): Promise<JSX.Element> {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?message=${encodeURIComponent("Log in with your invited email to accept the workspace invite.")}`);
  }

  const { data: invite } = await supabase
    .from("invites")
    .select("id, workspace_id, email, role, token, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-4">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-zinc-950">Invite not found</h1>
          <p className="text-zinc-600">This invite is invalid or does not match the current signed-in email.</p>
          <Button asChild className="bg-orange-500 text-white hover:bg-orange-600">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (invite.accepted_at) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-4">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-zinc-950">Invite already used</h1>
          <p className="text-zinc-600">This invite has already been accepted.</p>
          <Button asChild className="bg-orange-500 text-white hover:bg-orange-600">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-4">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-zinc-950">Invite expired</h1>
          <p className="text-zinc-600">Ask the workspace owner to send a fresh invite.</p>
          <Button asChild className="bg-orange-500 text-white hover:bg-orange-600">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center px-4">
      <InviteAcceptCard
        email={invite.email}
        expiresAt={invite.expires_at}
        inviteId={invite.id}
        role={invite.role}
        token={invite.token}
        workspaceId={invite.workspace_id}
      />
    </div>
  );
}
