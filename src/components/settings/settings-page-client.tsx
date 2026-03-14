"use client";

import type { JSX } from "react";
import { startTransition, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PipelineStageRecord } from "@/types/pipeline";
import type { InviteRecord, WorkspaceMemberRecord } from "@/types/workspace";

interface SettingsPageClientProps {
  invites: InviteRecord[];
  members: WorkspaceMemberRecord[];
  stages: PipelineStageRecord[];
  workspace: {
    id: string;
    logo_url: string | null;
    name: string;
    timezone: string | null;
  };
}

const TIMEZONE_OPTIONS = [
  "Asia/Kolkata",
  "America/New_York",
  "Europe/London",
  "Asia/Singapore",
] as const;

export function SettingsPageClient({
  invites,
  members,
  stages,
  workspace,
}: SettingsPageClientProps): JSX.Element {
  const supabase = createClient();
  const [workspaceName, setWorkspaceName] = useState<string>(workspace.name);
  const [logoUrl, setLogoUrl] = useState<string>(workspace.logo_url ?? "");
  const [timezone, setTimezone] = useState<string>(workspace.timezone ?? "Asia/Kolkata");
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteRole, setInviteRole] = useState<string>("member");
  const [newStage, setNewStage] = useState<string>("");
  const [pending, setPending] = useState<string | null>(null);

  function copyInviteLink(token: string): void {
    const value = `${window.location.origin}/invite/${token}`;
    void navigator.clipboard.writeText(value);
    toast.success("Invite link copied.");
  }

  function updateWorkspace(): void {
    setPending("workspace");

    startTransition(async () => {
      const { error } = await supabase
        .from("workspaces")
        .update({
          name: workspaceName,
          logo_url: logoUrl || null,
          timezone,
        })
        .eq("id", workspace.id);

      if (error) {
        toast.error(error.message);
        setPending(null);
        return;
      }

      await logActivity(supabase, {
        workspaceId: workspace.id,
        entityType: "workspace",
        entityId: workspace.id,
        action: "updated",
        summary: "Updated workspace settings.",
      });

      setPending(null);
      toast.success("Workspace updated.");
      window.location.reload();
    });
  }

  function createInvite(): void {
    if (!inviteEmail) {
      toast.error("Enter an email first.");
      return;
    }

    setPending("invite");

    startTransition(async () => {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("invites").insert({
        workspace_id: workspace.id,
        email: inviteEmail.toLowerCase(),
        role: inviteRole,
        token,
        invited_by: user?.id ?? null,
        expires_at: expiresAt,
      });

      if (error) {
        toast.error(error.message);
        setPending(null);
        return;
      }

      await logActivity(supabase, {
        workspaceId: workspace.id,
        entityType: "invite",
        action: "created",
        summary: `Invited ${inviteEmail.toLowerCase()} as ${inviteRole}.`,
      });

      setInviteEmail("");
      setPending(null);
      toast.success("Invite created. Copy the link from pending invites.");
      window.location.reload();
    });
  }

  function revokeInvite(inviteId: string, email: string): void {
    setPending(inviteId);

    startTransition(async () => {
      const { error } = await supabase.from("invites").delete().eq("id", inviteId);

      if (error) {
        toast.error(error.message);
        setPending(null);
        return;
      }

      await logActivity(supabase, {
        workspaceId: workspace.id,
        entityType: "invite",
        entityId: inviteId,
        action: "revoked",
        summary: `Revoked invite for ${email}.`,
      });

      setPending(null);
      toast.success("Invite revoked.");
      window.location.reload();
    });
  }

  function addStage(): void {
    const name = newStage.trim();

    if (!name) {
      toast.error("Enter a stage name.");
      return;
    }

    setPending("stage:create");

    startTransition(async () => {
      const nextPosition = Math.max(...stages.map((stage) => stage.position), 0) + 1;
      const { error } = await supabase.from("pipeline_stages").insert({
        workspace_id: workspace.id,
        name,
        position: nextPosition,
        color: "#f97316",
      });

      if (error) {
        toast.error(error.message);
        setPending(null);
        return;
      }

      await logActivity(supabase, {
        workspaceId: workspace.id,
        entityType: "pipeline_stage",
        action: "created",
        summary: `Added pipeline stage "${name}".`,
      });

      setNewStage("");
      setPending(null);
      toast.success("Stage added.");
      window.location.reload();
    });
  }

  function moveStage(stage: PipelineStageRecord, direction: "up" | "down"): void {
    const orderedStages = [...stages].sort((left, right) => left.position - right.position);
    const currentIndex = orderedStages.findIndex((entry) => entry.id === stage.id);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const swapStage = orderedStages[swapIndex];

    if (!swapStage) {
      return;
    }

    setPending(stage.id);

    startTransition(async () => {
      const { error: firstError } = await supabase
        .from("pipeline_stages")
        .update({ position: -1 })
        .eq("id", stage.id);

      if (firstError) {
        toast.error(firstError.message);
        setPending(null);
        return;
      }

      const { error: secondError } = await supabase
        .from("pipeline_stages")
        .update({ position: stage.position })
        .eq("id", swapStage.id);

      const { error: thirdError } = await supabase
        .from("pipeline_stages")
        .update({ position: swapStage.position })
        .eq("id", stage.id);

      if (secondError || thirdError) {
        toast.error(secondError?.message ?? thirdError?.message ?? "Unable to reorder stages.");
        setPending(null);
        window.location.reload();
        return;
      }

      await logActivity(supabase, {
        workspaceId: workspace.id,
        entityType: "pipeline_stage",
        entityId: stage.id,
        action: "reordered",
        summary: `Reordered stage "${stage.name}".`,
      });

      setPending(null);
      toast.success("Stage order updated.");
      window.location.reload();
    });
  }

  function deleteStage(stage: PipelineStageRecord): void {
    setPending(stage.id);

    startTransition(async () => {
      const { error } = await supabase.from("pipeline_stages").delete().eq("id", stage.id);

      if (error) {
        toast.error(error.message);
        setPending(null);
        return;
      }

      await logActivity(supabase, {
        workspaceId: workspace.id,
        entityType: "pipeline_stage",
        entityId: stage.id,
        action: "deleted",
        summary: `Deleted stage "${stage.name}".`,
      });

      setPending(null);
      toast.success("Stage deleted.");
      window.location.reload();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/30">
          <CardHeader>
            <CardTitle>Workspace settings</CardTitle>
            <CardDescription>Update the workspace name, timezone, and logo URL used across the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace name</Label>
              <Input
                id="workspace-name"
                className="border-orange-200 focus-visible:ring-orange-200"
                onChange={(event) => setWorkspaceName(event.target.value)}
                value={workspaceName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-logo">Logo URL</Label>
              <Input
                id="workspace-logo"
                className="border-orange-200 focus-visible:ring-orange-200"
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="https://..."
                value={logoUrl}
              />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select onValueChange={setTimezone} value={timezone}>
                <SelectTrigger className="border-orange-200 focus:ring-orange-200">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600"
              disabled={pending === "workspace"}
              onClick={updateWorkspace}
              type="button"
            >
              {pending === "workspace" ? "Saving..." : "Save workspace"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              Team management
            </CardTitle>
            <CardDescription>Invite teammates, track pending invites, and keep role visibility inside the workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-[1fr_160px_auto]">
              <Input
                className="border-orange-200 focus-visible:ring-orange-200"
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="teammate@agency.com"
                type="email"
                value={inviteEmail}
              />
              <Select onValueChange={setInviteRole} value={inviteRole}>
                <SelectTrigger className="border-orange-200 focus:ring-orange-200">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="bg-orange-500 text-white hover:bg-orange-600"
                disabled={pending === "invite"}
                onClick={createInvite}
                type="button"
              >
                Invite
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-500">Current members</p>
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between rounded-xl border border-orange-200/70 bg-white px-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-950">{member.display_name || member.email || "Workspace member"}</p>
                    <p className="text-sm text-zinc-500">{member.email ?? member.user_id}</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700" variant="secondary">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-500">Pending invites</p>
              {invites.length === 0 ? (
                <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-8 text-sm text-zinc-500">
                  No pending invites.
                </div>
              ) : (
                invites.map((invite) => (
                  <div key={invite.id} className="rounded-xl border border-orange-200/70 bg-white px-4 py-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-medium text-zinc-950">{invite.email}</p>
                        <p className="text-sm text-zinc-500">
                          {invite.role} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="border-orange-200 text-orange-700 hover:bg-orange-50"
                          onClick={() => copyInviteLink(invite.token)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <Copy className="h-4 w-4" />
                          Copy link
                        </Button>
                        <Button
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          disabled={pending === invite.id}
                          onClick={() => revokeInvite(invite.id, invite.email)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4" />
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/30">
        <CardHeader>
          <CardTitle>Pipeline stage editor</CardTitle>
          <CardDescription>Add, reorder, and clean up stages without leaving settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              className="border-orange-200 focus-visible:ring-orange-200"
              onChange={(event) => setNewStage(event.target.value)}
              placeholder="Add a new stage"
              value={newStage}
            />
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600"
              disabled={pending === "stage:create"}
              onClick={addStage}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Add stage
            </Button>
          </div>

          <div className="space-y-3">
            {[...stages]
              .sort((left, right) => left.position - right.position)
              .map((stage) => (
                <div key={stage.id} className="flex flex-col gap-3 rounded-xl border border-orange-200/70 bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: stage.color ?? "#f97316" }} />
                    <div>
                      <p className="font-medium text-zinc-950">{stage.name}</p>
                      <p className="text-sm text-zinc-500">Position {stage.position}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="border-orange-200 text-orange-700 hover:bg-orange-50"
                      disabled={pending === stage.id}
                      onClick={() => moveStage(stage, "up")}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      className="border-orange-200 text-orange-700 hover:bg-orange-50"
                      disabled={pending === stage.id}
                      onClick={() => moveStage(stage, "down")}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      disabled={pending === stage.id}
                      onClick={() => deleteStage(stage)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
