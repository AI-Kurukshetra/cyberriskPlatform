import type { JSX } from "react";
import { Badge } from "@/components/ui/badge";

const proofItems = [
  "Track clients",
  "Deal pipeline",
  "Notes and activity",
  "Team follow-up",
] as const;

export function SocialProofStrip(): JSX.Element {
  return (
    <section className="rounded-[2rem] border border-orange-200/70 bg-[linear-gradient(135deg,rgba(255,247,237,0.96),rgba(255,255,255,0.95))] px-5 py-5 shadow-[0_16px_50px_rgba(249,115,22,0.08)] backdrop-blur sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
            Social Proof
          </p>
          <p className="text-lg font-semibold text-zinc-950 sm:text-xl">
            Built for freelancers, consultants, and small client-facing teams
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {proofItems.map((item) => (
            <Badge
              key={item}
              className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-orange-700"
              variant="secondary"
            >
              {item}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
