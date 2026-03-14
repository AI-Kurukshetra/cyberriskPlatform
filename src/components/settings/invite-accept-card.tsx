"use client";

import type { JSX } from "react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InviteAcceptCardProps {
  email: string;
  expiresAt: string;
  inviteId: string;
  role: string;
  token: string;
  workspaceId: string;
}

export function InviteAcceptCard({
  email,
  expiresAt,
  inviteId,
  role,
  token,
  workspaceId,
}: InviteAcceptCardProps): JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, setIsPending] = useState<boolean>(false);

  function handleAccept(): void {
    setIsPending(true);

    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || (user.email ?? "").toLowerCase() !== email.toLowerCase()) {
        toast.error("Log in with the invited email address first.");
        setIsPending(false);
        return;
      }

      const { error: membershipError } = await supabase.from("workspace_members").insert({
        workspace_id: workspaceId,
        user_id: user.id,
        role,
        invited_by: null,
        email: user.email ?? email,
        display_name: (user.user_metadata.display_name as string | undefined) ?? null,
        avatar_url: (user.user_metadata.avatar_url as string | undefined) ?? null,
      });

      if (membershipError && membershipError.code !== "23505") {
        toast.error(membershipError.message);
        setIsPending(false);
        return;
      }

      const { error: inviteError } = await supabase
        .from("invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", inviteId)
        .eq("token", token);

      if (inviteError) {
        toast.error(inviteError.message);
        setIsPending(false);
        return;
      }

      await logActivity(supabase, {
        workspaceId,
        entityType: "invite",
        entityId: inviteId,
        action: "accepted",
        summary: `${email} joined the workspace.`,
      });

      toast.success("Invite accepted.");
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <Card className="border-orange-200/80 bg-white/95 shadow-[0_22px_60px_rgba(249,115,22,0.12)]">
      <CardHeader>
        <CardTitle>Accept workspace invite</CardTitle>
        <CardDescription>
          You were invited as a {role}. This invite is for {email} and expires on{" "}
          {new Date(expiresAt).toLocaleString()}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full bg-orange-500 text-white hover:bg-orange-600"
          disabled={isPending}
          onClick={handleAccept}
          type="button"
        >
          {isPending ? "Joining workspace..." : "Accept invite"}
        </Button>
      </CardContent>
    </Card>
  );
}
