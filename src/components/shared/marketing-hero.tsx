import type { JSX } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  FileText,
  ListTodo,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";

const cards = [
  {
    icon: Users,
    title: "Track clients",
    description: "Keep every account, contact, and client update in one intuitive workspace.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Manage pipelines",
    description: "See open deals, value, and momentum without bouncing between tools.",
  },
  {
    icon: BellRing,
    title: "Assign follow-ups",
    description: "Turn conversations into next steps your team can execute on time.",
  },
] as const;

export function MarketingHero(): JSX.Element {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div className="space-y-8">
        <SectionHeading
          badge="Client CRM for freelancers and agencies"
          title="Close more clients without the chaos"
          description="Track clients, manage deal pipelines, log notes, assign follow-up tasks, and collaborate as a team from one clean orange-and-white workspace."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-orange-200/80 bg-[linear-gradient(180deg,#fff7ed,#ffffff)] px-4 py-4 shadow-sm shadow-orange-100/60">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">Client view</p>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              Keep contact info, account status, notes, and activity tied to the right relationship.
            </p>
          </div>
          <div className="rounded-2xl border border-orange-200/80 bg-[linear-gradient(180deg,#fff7ed,#ffffff)] px-4 py-4 shadow-sm shadow-orange-100/60">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">Pipeline</p>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              See active opportunities, deal value, and stage movement without spreadsheet overhead.
            </p>
          </div>
          <div className="rounded-2xl border border-orange-200/80 bg-[linear-gradient(180deg,#fff7ed,#ffffff)] px-4 py-4 shadow-sm shadow-orange-100/60">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">Execution</p>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              Stay on top of notes, tasks, and follow-ups from one compact dashboard.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="bg-orange-500 text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600"
            size="lg"
          >
            <Link href="/signup">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            className="border-orange-200 bg-white/90 text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-50"
            size="lg"
            variant="outline"
          >
            <Link href="/login">Log In</Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-orange-500" />
            Track clients and activity
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-orange-500" />
            Manage deals and follow-ups
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-orange-500" />
            Collaborate as a team
          </div>
        </div>
      </div>
      <div className="grid gap-4">
        <Card className="overflow-hidden rounded-[2rem] border-orange-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(255,247,237,0.95),_rgba(255,255,255,0.75)),linear-gradient(135deg,_rgba(255,237,213,0.9),_rgba(255,255,255,0.95))] shadow-[0_24px_70px_rgba(249,115,22,0.14)] transition-transform duration-200 hover:-translate-y-1">
          <CardHeader className="border-b border-orange-200/70 bg-white/75">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">ClientPulse Workspace</CardTitle>
                <CardDescription>Client CRM overview</CardDescription>
              </div>
              <Badge className="bg-orange-500 text-white">Live MVP</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm shadow-orange-100/70">
                <p className="text-xs uppercase tracking-[0.18em] text-orange-600">Pipeline</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-950">$42.5K</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm shadow-orange-100/70">
                <p className="text-xs uppercase tracking-[0.18em] text-orange-600">Tasks today</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-950">4</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm shadow-orange-100/70">
                <p className="text-xs uppercase tracking-[0.18em] text-orange-600">Active clients</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-950">12</p>
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#ea580c,#fb923c)] p-4 text-white shadow-lg shadow-orange-200/80">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Orbit Labs</p>
                  <p className="text-xs text-orange-50/85">Retainer client · 2 active deals</p>
                </div>
                <Badge variant="secondary" className="bg-white text-orange-700">
                  Active
                </Badge>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-orange-50/90">
                <div className="flex items-center gap-2">
                  <CircleCheckBig className="h-4 w-4 text-white" />
                  Follow-up due tomorrow
                </div>
                <div className="flex items-center gap-2">
                  <CircleCheckBig className="h-4 w-4 text-white" />
                  Shared notes synced with team
                </div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.5rem] border border-orange-200/70 bg-white p-4 shadow-sm shadow-orange-100/70">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-zinc-900">Notes and tasks</p>
                  <Clock3 className="h-4 w-4 text-orange-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-xl border border-orange-200/70 p-3">
                    <FileText className="mt-0.5 h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">Discovery recap logged</p>
                      <p className="mt-1 text-xs text-zinc-500">Orbit Labs · Shared with account team</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-orange-200/70 p-3">
                    <ListTodo className="mt-0.5 h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">Send proposal revision</p>
                      <p className="mt-1 text-xs text-zinc-500">Due today · Assigned to Sarah</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-orange-200/70 bg-white p-4 shadow-sm shadow-orange-100/70">
                <p className="text-sm font-medium text-zinc-900">Team activity</p>
                <div className="mt-3 space-y-3 text-sm text-zinc-600">
                  <div className="flex items-start gap-2 rounded-xl bg-orange-50 p-3">
                    <ChevronRight className="mt-0.5 h-4 w-4 text-orange-500" />
                    <p>
                      Pipeline moved to <span className="font-medium text-zinc-900">Negotiation</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl bg-orange-50 p-3">
                    <ChevronRight className="mt-0.5 h-4 w-4 text-orange-500" />
                    <p>
                      New client note added for <span className="font-medium text-zinc-900">Orbit Labs</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              key={card.title}
              className="border-orange-200/80 bg-white/90 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(249,115,22,0.1)]"
            >
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <div className="rounded-lg bg-orange-100 p-3">
                  <Icon className="h-5 w-5 text-orange-600" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-zinc-600">
                Designed to feel clear, fast, and intuitive for client-facing teams.
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
