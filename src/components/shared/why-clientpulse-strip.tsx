import type { JSX } from "react";
import { CheckCircle2, CircleX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  {
    title: "Scattered spreadsheets",
    copy: "Client context ends up split across tabs, notes, and inbox threads.",
    tone: "negative",
  },
  {
    title: "Missed follow-ups",
    copy: "Revenue slips when proposals, reminders, and next steps are not visible.",
    tone: "negative",
  },
  {
    title: "One shared CRM workspace",
    copy: "Clients, deals, notes, and tasks stay visible in one clean flow.",
    tone: "positive",
  },
] as const;

export function WhyClientPulseStrip(): JSX.Element {
  return (
    <section
      id="why-clientpulse"
      className="grid gap-4 rounded-[2rem] border border-orange-200/70 bg-[linear-gradient(135deg,#fff7ed,#ffffff_55%,#ffedd5)] px-5 py-5 text-zinc-900 shadow-[0_18px_60px_rgba(249,115,22,0.12)] sm:px-6 lg:grid-cols-3"
    >
      {items.map((item) => {
        const isPositive = item.tone === "positive";
        const Icon = isPositive ? CheckCircle2 : CircleX;

        return (
          <Card
            key={item.title}
            className={
              isPositive
                ? "border-orange-300 bg-[linear-gradient(135deg,#f97316,#fb923c)] text-white"
                : "border-orange-200/70 bg-white/90 text-zinc-900"
            }
          >
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-3">
                <div
                  className={
                    isPositive
                      ? "rounded-full bg-white/15 p-2 text-white"
                      : "rounded-full bg-orange-100 p-2 text-orange-500"
                  }
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-base font-semibold">{item.title}</p>
              </div>
              <p
                className={
                  isPositive
                    ? "text-sm leading-7 text-orange-50"
                    : "text-sm leading-7 text-zinc-600"
                }
              >
                {item.copy}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
