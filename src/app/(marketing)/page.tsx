import type { JSX } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DemoWorkflowSection } from "@/components/shared/demo-workflow-section";
import { FeatureShowcaseSection } from "@/components/shared/feature-showcase-section";
import { MarketingFooter } from "@/components/shared/marketing-footer";
import { MarketingHero } from "@/components/shared/marketing-hero";
import { SiteHeader } from "@/components/shared/site-header";
import { SocialProofStrip } from "@/components/shared/social-proof-strip";
import { WhyClientPulseStrip } from "@/components/shared/why-clientpulse-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MarketingPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,237,213,0.95),_rgba(255,255,255,0.92)_45%),linear-gradient(180deg,_#fff7ed_0%,_#ffffff_42%,_#fff7ed_100%)]">
      <SiteHeader />
      <main className="mx-auto flex max-w-7xl flex-col gap-20 px-6 py-10 sm:py-12">
        <MarketingHero />

        <SocialProofStrip />

        <FeatureShowcaseSection />

        <WhyClientPulseStrip />

        <DemoWorkflowSection />

        <section className="grid gap-6 rounded-[2rem] border border-orange-200/80 bg-[linear-gradient(180deg,#ffffff,#fff7ed)] p-6 shadow-[0_22px_70px_rgba(249,115,22,0.08)] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-3">
            <Badge className="w-fit rounded-full border-orange-200 bg-orange-50 px-3 py-1.5 text-orange-700" variant="outline">
              Start today
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Start your free trial and keep every client moving forward
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-zinc-600">
              Create your workspace, invite your team, and manage clients, deals, notes, and follow-up tasks without the usual chaos.
            </p>
          </div>
          <Card className="min-w-[280px] border-orange-300 bg-[linear-gradient(135deg,#ea580c,#fb923c)] text-white shadow-[0_18px_45px_rgba(249,115,22,0.22)]">
            <CardHeader>
              <CardTitle>Start Free Trial</CardTitle>
              <CardDescription className="text-orange-50/90">
                Sign up to enter the product, or log in to continue where your team left off.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild className="w-full bg-white text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-50" variant="secondary">
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                className="w-full border-white/60 bg-transparent text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                variant="outline"
              >
                <Link href="/login">Log In</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <MarketingFooter />
      </main>
    </div>
  );
}
