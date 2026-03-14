"use client";

import type { JSX } from "react";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { format } from "date-fns";
import { Archive, Globe, MapPin, Search } from "lucide-react";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { ClientStatusBadge } from "@/components/clients/client-status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ClientRecord } from "@/types/client";

interface ClientListProps {
  clients: ClientRecord[];
  workspaceId: string;
}

export function ClientList({ clients, workspaceId }: ClientListProps): JSX.Element {
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [archiveFilter, setArchiveFilter] = useState<string>("active");
  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();

  const filteredClients = clients.filter((client) => {
    const haystack = [
      client.name,
      client.company,
      client.email,
      client.location,
      client.website,
      ...(client.tags ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = haystack.includes(normalizedSearch);
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesArchive =
      archiveFilter === "all"
        ? true
        : archiveFilter === "archived"
          ? Boolean(client.archived_at)
          : !client.archived_at;

    return matchesSearch && matchesStatus && matchesArchive;
  });

  const isSearching = normalizedSearch.length > 0;
  const hasNoClients = clients.length === 0;

  return (
    <Card className="border-orange-200/80 bg-white/95 shadow-sm shadow-orange-100/40">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CardTitle>Workspace clients</CardTitle>
            <Badge className="bg-orange-100 text-orange-700" variant="secondary">
              {clients.length}
            </Badge>
          </div>
          <CardDescription>
            Search by name, company, or email. Add and edit records directly from this list.
          </CardDescription>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
            <Input
              className="border-orange-200 pl-9 focus-visible:ring-orange-200"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search clients"
              value={search}
            />
          </div>
          <Select onValueChange={setStatusFilter} value={statusFilter}>
            <SelectTrigger className="min-w-[150px] border-orange-200 focus:ring-orange-200">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setArchiveFilter} value={archiveFilter}>
            <SelectTrigger className="min-w-[150px] border-orange-200 focus:ring-orange-200">
              <SelectValue placeholder="Filter archive" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active only</SelectItem>
              <SelectItem value="archived">Archived only</SelectItem>
              <SelectItem value="all">All records</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredClients.length === 0 ? (
          hasNoClients ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-zinc-950">No clients yet</p>
              <p className="mt-2 text-sm text-zinc-500">
                Add your first client to start managing deals and follow-up work.
              </p>
              <div className="mt-4 flex justify-center">
                <ClientFormDialog triggerLabel="Add first client" workspaceId={workspaceId} />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-zinc-950">No matching clients</p>
              <p className="mt-2 text-sm text-zinc-500">
                {isSearching
                  ? `No clients matched "${search}". Try a different search term.`
                  : "No clients available."}
              </p>
            </div>
          )
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className="border-orange-200/70 bg-white shadow-sm shadow-orange-100/30"
                >
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            className="font-medium text-zinc-950 hover:text-orange-700 hover:underline"
                            href={`/clients/${client.id}`}
                          >
                            {client.name}
                          </Link>
                          {client.archived_at ? (
                            <Badge className="border-zinc-200 bg-zinc-100 text-zinc-700" variant="outline">
                              Archived
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-zinc-500">{client.company ?? "Independent client"}</p>
                      </div>
                      <ClientStatusBadge status={client.status} />
                    </div>
                    <div className="space-y-2 text-sm text-zinc-600">
                      <p>{client.email ?? "No email provided"}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-500">
                        {client.location ? (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-orange-500" />
                            {client.location}
                          </span>
                        ) : null}
                        {client.website ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-orange-500" />
                            {client.website.replace(/^https?:\/\//, "")}
                          </span>
                        ) : null}
                      </div>
                      {client.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {client.tags.map((tag) => (
                            <Badge key={tag} className="bg-orange-50 text-orange-700" variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      <p>Created {format(new Date(client.created_at), "MMM d, yyyy")}</p>
                    </div>
                    <div className="flex justify-end">
                      <ClientFormDialog
                        client={client}
                        triggerLabel="Edit"
                        workspaceId={workspaceId}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Created date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Link
                          className="font-medium text-zinc-950 hover:text-orange-700 hover:underline"
                          href={`/clients/${client.id}`}
                        >
                          {client.name}
                        </Link>
                      </TableCell>
                      <TableCell>{client.company ?? "—"}</TableCell>
                      <TableCell>{client.email ?? "—"}</TableCell>
                      <TableCell>{client.location ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <ClientStatusBadge status={client.status} />
                          {client.archived_at ? (
                            <Badge className="border-zinc-200 bg-zinc-100 text-zinc-700" variant="outline">
                              <Archive className="mr-1 h-3.5 w-3.5" />
                              Archived
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {client.tags.length > 0 ? (
                            client.tags.map((tag) => (
                              <Badge key={tag} className="bg-orange-50 text-orange-700" variant="secondary">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(client.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <ClientFormDialog
                          client={client}
                          triggerLabel="Edit"
                          workspaceId={workspaceId}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
