import type { JSX } from "react";
import Link from "next/link";

export function MarketingFooter(): JSX.Element {
  return (
    <footer className="flex flex-col gap-4 border-t border-orange-200/80 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-zinc-900">ClientPulse</p>
        <p>Track clients, manage deals, log notes, and assign follow-up tasks.</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <a className="transition hover:text-orange-600" href="#features">
          Features
        </a>
        <a className="transition hover:text-orange-600" href="#how-it-works">
          How it works
        </a>
        <a className="transition hover:text-orange-600" href="#demo-flow">
          Demo flow
        </a>
        <Link className="transition hover:text-orange-600" href="/signup">
          Start Free Trial
        </Link>
      </div>
    </footer>
  );
}
