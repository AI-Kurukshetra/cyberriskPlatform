"use client";

import type { JSX } from "react";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Pin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { NoteRecord } from "@/types/note";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NoteFeedProps {
  clientId?: string | null;
  dealId?: string | null;
  emptyState: string;
  notes: NoteRecord[];
  searchPlaceholder?: string;
  title: string;
  workspaceId: string;
}

function getInitials(value: string): string {
  return value
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function NoteFeed({
  clientId = null,
  dealId = null,
  emptyState,
  notes,
  searchPlaceholder = "Search notes",
  title,
  workspaceId,
}: NoteFeedProps): JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const [draft, setDraft] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const deferredSearch = useDeferredValue(search);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    const sorted = [...notes].sort((left, right) => {
      if (left.is_pinned !== right.is_pinned) {
        return Number(right.is_pinned) - Number(left.is_pinned);
      }

      return right.created_at.localeCompare(left.created_at);
    });

    if (!query) {
      return sorted;
    }

    return sorted.filter((note) => {
      const author = `${note.author_name ?? ""} ${note.author_email ?? ""}`.toLowerCase();
      return `${note.content.toLowerCase()} ${author}`.includes(query);
    });
  }, [deferredSearch, notes]);

  function submitNote(pin: boolean): void {
    const content = draft.trim();

    if (!content || isSaving) {
      return;
    }

    setIsSaving(true);

    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("notes")
        .insert({
          workspace_id: workspaceId,
          client_id: clientId,
          deal_id: dealId,
          content,
          is_pinned: pin,
          created_by: user?.id ?? null,
        })
        .select("id")
        .single();

      if (error) {
        toast.error(error.message);
        setIsSaving(false);
        return;
      }

      await logActivity(supabase, {
        workspaceId,
        entityType: dealId ? "deal" : "client",
        entityId: dealId ?? clientId,
        action: "note_added",
        summary: pin ? "Pinned a note." : "Added a note.",
      });

      setDraft("");
      setIsSaving(false);
      toast.success(pin ? "Pinned note added." : "Note saved.");
      router.refresh();
    });
  }

  function togglePin(note: NoteRecord): void {
    setUpdatingId(note.id);

    startTransition(async () => {
      const { error } = await supabase
        .from("notes")
        .update({ is_pinned: !note.is_pinned })
        .eq("id", note.id);

      if (error) {
        toast.error(error.message);
        setUpdatingId(null);
        return;
      }

      await logActivity(supabase, {
        workspaceId,
        entityType: note.deal_id ? "deal" : "client",
        entityId: note.deal_id ?? note.client_id,
        action: note.is_pinned ? "note_unpinned" : "note_pinned",
        summary: note.is_pinned ? "Unpinned a note." : "Pinned a note.",
      });

      setUpdatingId(null);
      router.refresh();
    });
  }

  return (
    <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/30">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>Pinned notes stay at the top. Press Cmd/Ctrl + Enter to save quickly.</CardDescription>
          </div>
          <div className="relative min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
            <Input
              className="border-orange-200 pl-9 focus-visible:ring-orange-200"
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              value={search}
            />
          </div>
        </div>
        <div className="rounded-3xl border border-orange-200 bg-[linear-gradient(180deg,#fff7ed,#ffffff)] p-4">
          <Textarea
            className="min-h-[120px] border-orange-200 focus-visible:ring-orange-200"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                submitNote(false);
              }
            }}
            placeholder="Capture the latest client context, a call recap, or an internal note."
            value={draft}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-zinc-500">Tip: use pinned notes for current strategy or critical context.</p>
            <div className="flex gap-2">
              <Button
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                disabled={isSaving}
                onClick={() => submitNote(true)}
                type="button"
                variant="outline"
              >
                <Pin className="h-4 w-4" />
                Pin note
              </Button>
              <Button
                className="bg-orange-500 text-white hover:bg-orange-600"
                disabled={isSaving}
                onClick={() => submitNote(false)}
                type="button"
              >
                {isSaving ? "Saving..." : "Save note"}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-8 text-sm text-zinc-500">
            {emptyState}
          </div>
        ) : (
          filteredNotes.map((note) => {
            const authorLabel = note.author_name || note.author_email || "Workspace member";

            return (
              <div
                key={note.id}
                className={cn(
                  "rounded-2xl border px-4 py-4",
                  note.is_pinned
                    ? "border-orange-300 bg-orange-50/70"
                    : "border-orange-200/70 bg-white"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10 border border-orange-200 bg-white">
                      <AvatarFallback className="bg-orange-100 text-orange-700">
                        {getInitials(authorLabel)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-zinc-950">{authorLabel}</p>
                        {note.is_pinned ? (
                          <Badge className="bg-orange-500 text-white" variant="secondary">
                            Pinned
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-zinc-500">
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                    disabled={updatingId === note.id}
                    onClick={() => togglePin(note)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Pin className="h-4 w-4" />
                    {note.is_pinned ? "Unpin" : "Pin"}
                  </Button>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-700">{note.content}</p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
