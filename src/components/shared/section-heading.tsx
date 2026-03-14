import type { JSX } from "react";
import { Badge } from "@/components/ui/badge";

interface SectionHeadingProps {
  badge: string;
  title: string;
  description: string;
}

export function SectionHeading({
  badge,
  title,
  description,
}: SectionHeadingProps): JSX.Element {
  return (
    <div className="space-y-4">
      <Badge variant="secondary" className="w-fit">
        {badge}
      </Badge>
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-zinc-600">{description}</p>
      </div>
    </div>
  );
}
