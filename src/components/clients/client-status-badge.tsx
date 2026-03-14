import type { JSX } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ClientRecord } from "@/types/client";

const statusStyles: Record<ClientRecord["status"], string> = {
  lead: "border-amber-200 bg-amber-50 text-amber-700",
  active: "border-orange-200 bg-orange-50 text-orange-700",
  inactive: "border-zinc-200 bg-zinc-100 text-zinc-700",
};

export function ClientStatusBadge({
  status,
}: {
  status: ClientRecord["status"];
}): JSX.Element {
  return (
    <Badge className={cn("capitalize rounded-full px-2.5 py-1", statusStyles[status])} variant="outline">
      {status}
    </Badge>
  );
}
