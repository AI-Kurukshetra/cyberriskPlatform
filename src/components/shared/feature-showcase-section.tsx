import type { JSX } from "react";
import {
  ClipboardList,
  FileText,
  FolderKanban,
  MessageSquareMore,
  Users2,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const featureHighlights = [
  {
    icon: Users2,
    eyebrow: "Track clients",
    title: "Keep every client relationship in one clear workspace.",
    description:
      "Store contact details, company context, status, tags, and recent activity so your team always knows the latest state of an account.",
    bullets: ["Client profiles", "Status badges", "Company context"],
  },
  {
    icon: FolderKanban,
    eyebrow: "Manage pipelines",
    title: "Move deals forward without losing visibility.",
    description:
      "See open opportunities by stage, value, close timing, and probability so your pipeline tells a clean story at a glance.",
    bullets: ["Stage-based view", "Value tracking", "Close-date focus"],
  },
  {
    icon: FileText,
    eyebrow: "Log notes",
    title: "Capture notes where the client work actually happens.",
    description:
      "Keep call notes, meeting recaps, and deal updates attached to the right client so context does not disappear into docs and chat.",
    bullets: ["Meeting recaps", "Deal notes", "Shared history"],
  },
  {
    icon: ClipboardList,
    eyebrow: "Assign tasks",
    title: "Turn next steps into visible follow-up work.",
    description:
      "Assign due dates, priorities, and ownership so proposals, reminders, and action items never fall through the cracks.",
    bullets: ["Due dates", "Priority levels", "Ownership"],
  },
  {
    icon: MessageSquareMore,
    eyebrow: "Collaborate as a team",
    title: "Work together without scattered updates.",
    description:
      "See who changed what, keep activity visible, and align client communication across your workspace instead of chasing status in chat.",
    bullets: ["Shared updates", "Team visibility", "Activity history"],
  },
] as const;

export function FeatureShowcaseSection(): JSX.Element {
  return (
    <section id="features" className="space-y-8">
      <SectionHeading
        badge="All features"
        title="Track clients, manage pipelines, log notes, and follow through as a team"
        description="ClientPulse is built for the daily rhythm of service businesses: client context, active deals, internal notes, and next actions in one shared place."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {featureHighlights.map((feature, index) => {
          const Icon = feature.icon;
          const isWide = index === featureHighlights.length - 1;

          return (
            <Card
              key={feature.title}
              className={[
                "border-orange-200/80 bg-white/95 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(249,115,22,0.1)]",
                isWide ? "lg:col-span-2" : "",
              ].join(" ")}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Badge className="rounded-full border-orange-200 bg-orange-50 px-3 py-1.5 text-orange-700" variant="outline">
                      {feature.eyebrow}
                    </Badge>
                    <div className="space-y-2">
                      <CardTitle className="max-w-2xl text-2xl text-zinc-950">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="max-w-2xl text-base leading-7">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-orange-100 p-3">
                    <Icon className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-[1fr_240px]">
                <div className="grid gap-3 sm:grid-cols-3">
                  {feature.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="rounded-2xl border border-orange-200/70 bg-[linear-gradient(180deg,#fff7ed,#ffffff)] px-4 py-4 text-sm font-medium text-zinc-700"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>
                <div className="rounded-[1.5rem] border border-orange-200/70 bg-orange-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                    Snapshot
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-sm font-medium text-zinc-900">{feature.eyebrow}</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        Designed for fast updates and clean team visibility.
                      </p>
                    </div>
                    <div className="rounded-xl border border-dashed border-orange-200 bg-white/80 p-3 text-xs leading-5 text-zinc-500">
                      One shared system for client work instead of scattered tools.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
