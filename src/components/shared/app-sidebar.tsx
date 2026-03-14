"use client";

import type { JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, Menu, Settings, Users2, Workflow } from "lucide-react";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users2 },
  { href: "/pipeline", label: "Pipeline", icon: Workflow },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

interface AppSidebarProps {
  workspaceName: string;
  userEmail: string;
}

function getInitials(value: string): string {
  return value
    .split("@")[0]
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function SidebarContent({
  pathname,
  userEmail,
  workspaceName,
}: {
  pathname: string;
  userEmail: string;
  workspaceName: string;
}): JSX.Element {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 rounded-[1.75rem] border border-orange-200/80 bg-[linear-gradient(135deg,#fff7ed,#ffffff)] p-4 shadow-sm shadow-orange-100/60">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border border-orange-200 bg-white">
            <AvatarFallback className="bg-orange-500 text-white">CP</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold text-zinc-950">{workspaceName}</p>
            <p className="text-sm text-zinc-500">ClientPulse workspace</p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Button
              key={item.href}
              asChild
              className={cn(
                "h-11 w-full justify-start rounded-xl px-4",
                isActive
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-200 hover:bg-orange-600"
                  : "text-zinc-700 hover:bg-orange-50 hover:text-orange-700"
              )}
              variant={isActive ? "default" : "ghost"}
            >
              <Link href={item.href}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[1.5rem] border border-orange-200/80 bg-[linear-gradient(180deg,#ffffff,#fff7ed)] p-4 shadow-sm shadow-orange-100/60">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-orange-200 bg-white">
            <AvatarFallback className="bg-orange-100 text-orange-700">
              {getInitials(userEmail)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-950">{userEmail}</p>
            <p className="text-xs text-zinc-500">Signed in</p>
          </div>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}

function MobileTopBar({
  userEmail,
  workspaceName,
}: AppSidebarProps): JSX.Element {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between rounded-[1.5rem] border border-orange-200/80 bg-white/95 px-4 py-3 shadow-sm shadow-orange-100/60 lg:hidden">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-zinc-950">{workspaceName}</p>
        <p className="truncate text-xs text-zinc-500">{userEmail}</p>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="border-orange-200 text-orange-700 hover:bg-orange-50"
            size="icon"
            variant="outline"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[320px] border-orange-200 bg-white">
          <SheetHeader>
            <SheetTitle>ClientPulse</SheetTitle>
            <SheetDescription>Navigate the workspace and manage client operations.</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <SidebarContent
              pathname={pathname}
              userEmail={userEmail}
              workspaceName={workspaceName}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function AppSidebar({
  workspaceName,
  userEmail,
}: AppSidebarProps): JSX.Element {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden h-[calc(100vh-2rem)] rounded-[1.75rem] border border-orange-200/80 bg-white/95 p-4 shadow-[0_18px_50px_rgba(249,115,22,0.08)] lg:sticky lg:top-4 lg:block">
        <SidebarContent
          pathname={pathname}
          userEmail={userEmail}
          workspaceName={workspaceName}
        />
      </aside>

      <MobileTopBar userEmail={userEmail} workspaceName={workspaceName} />
    </>
  );
}
