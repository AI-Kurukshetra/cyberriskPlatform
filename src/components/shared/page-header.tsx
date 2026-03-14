import type { JSX } from "react";
import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: PageHeaderProps): JSX.Element {
  return (
    <div className="space-y-4">
      <Badge
        variant="secondary"
        className="w-fit rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-orange-700"
      >
        {eyebrow}
      </Badge>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}
