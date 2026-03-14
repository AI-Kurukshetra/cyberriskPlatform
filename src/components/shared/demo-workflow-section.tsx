import type { JSX } from "react";
import { ArrowUpRight, ShieldCheck, Workflow } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const workflowCards = [
  {
    label: "Step 1",
    title: "Add clients",
    description: "Bring every client into one place with contact details, account context, and recent updates.",
  },
  {
    label: "Step 2",
    title: "Manage the deal pipeline",
    description: "See which opportunities are active, what stage they are in, and what value is on the board.",
  },
  {
    label: "Step 3",
    title: "Assign follow-up tasks",
    description: "Turn client conversations into clear action items your team can actually execute.",
  },
] as const;

export function DemoWorkflowSection(): JSX.Element {
  return (
    <section
      id="demo-flow"
      className="space-y-8 rounded-[2rem] border border-orange-200/70 bg-[linear-gradient(180deg,rgba(255,247,237,0.92),rgba(255,255,255,0.96))] p-6 shadow-[0_22px_70px_rgba(249,115,22,0.08)] sm:p-8"
    >
      <SectionHeading
        badge="How it works"
        title="A simple client-workflow your team can understand instantly"
        description="ClientPulse is designed around the core loop most service teams need every day: client context, active deals, shared notes, and clear next steps."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {workflowCards.map((card) => (
          <Card
            key={card.title}
            className="border-orange-200/70 bg-white/95 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(249,115,22,0.1)]"
          >
            <CardHeader className="space-y-4">
              <Badge className="w-fit rounded-full bg-orange-100 px-3 py-1.5 text-orange-700" variant="secondary">
                {card.label}
              </Badge>
              <div className="space-y-2">
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-orange-300 bg-[linear-gradient(135deg,#ea580c,#fb923c)] text-white shadow-[0_18px_45px_rgba(249,115,22,0.22)]">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <CardTitle>Mini workflow preview</CardTitle>
              <CardDescription className="text-orange-50/90">
                A placeholder product mock UI built from cards, badges, and quick-status panels.
              </CardDescription>
            </div>
            <Workflow className="h-5 w-5 text-orange-50" />
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white/15 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-50/80">Lead</p>
              <p className="mt-2 text-lg font-semibold">4 deals</p>
              <p className="mt-1 text-sm text-orange-50/80">₹6.8L open value</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-50/80">Proposal</p>
              <p className="mt-2 text-lg font-semibold">3 deals</p>
              <p className="mt-1 text-sm text-orange-50/80">2 follow-ups due</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-50/80">Won</p>
              <p className="mt-2 text-lg font-semibold">₹18.2L</p>
              <p className="mt-1 text-sm text-orange-50/80">This quarter</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200/70 bg-white/95">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-100 p-3">
                <ShieldCheck className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Why this lands well in a demo</CardTitle>
                <CardDescription>
                  It keeps the workflow intuitive while still looking polished and premium.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-zinc-600">
            <div className="flex items-start gap-3">
              <ArrowUpRight className="mt-1 h-4 w-4 text-orange-500" />
              <p>Client information, notes, tasks, and deals stay connected.</p>
            </div>
            <div className="flex items-start gap-3">
              <ArrowUpRight className="mt-1 h-4 w-4 text-orange-500" />
              <p>Teams get one simple place to manage active relationships.</p>
            </div>
            <div className="flex items-start gap-3">
              <ArrowUpRight className="mt-1 h-4 w-4 text-orange-500" />
              <p>The orange-and-white visual language makes the product feel clear and approachable.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
