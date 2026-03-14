import type { JSX } from "react";
import Link from "next/link";
import { BarChart3, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#why-clientpulse", label: "Why ClientPulse" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#demo-flow", label: "Demo flow" },
] as const;

export function SiteHeader(): JSX.Element {
  return (
    <header className="sticky top-0 z-30 border-b border-orange-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link className="flex items-center gap-2 font-semibold text-zinc-950" href="/">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#f97316,#fb923c)] text-white shadow-lg shadow-orange-200">
            <BarChart3 className="h-4 w-4" />
          </span>
          ClientPulse
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-zinc-600 lg:flex">
          {navItems.map((item) => (
            <a key={item.href} className="transition hover:text-orange-600" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                className="border-orange-200 text-orange-700 hover:bg-orange-50 lg:hidden"
                size="icon"
                variant="outline"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px]" side="right">
              <SheetHeader>
                <SheetTitle>ClientPulse</SheetTitle>
                <SheetDescription>Navigate the landing page and jump into the product.</SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-3">
                {navItems.map((item) => (
                  <Button key={item.href} asChild className="justify-start" variant="ghost">
                    <a href={item.href}>{item.label}</a>
                  </Button>
                ))}
                <div className="mt-3 flex flex-col gap-2">
                  <Button asChild variant="outline">
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button asChild className="text-zinc-700 hover:bg-orange-50 hover:text-orange-700" size="sm" variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            asChild
            className="bg-orange-500 text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
            size="sm"
          >
            <Link href="/signup">Start Free Trial</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
