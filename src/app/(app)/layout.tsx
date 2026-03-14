import type { JSX } from "react";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { requireWorkspaceContext } from "@/lib/supabase/workspace";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const { email, workspaceName } = await requireWorkspaceContext();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,237,213,0.55),_rgba(255,255,255,0.96)_38%),linear-gradient(180deg,_#fff7ed_0%,_#ffffff_36%,_#fff7ed_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-6 lg:py-6">
        <AppSidebar userEmail={email} workspaceName={workspaceName} />
        <div className="min-w-0 space-y-6">
          <header className="hidden rounded-[1.75rem] border border-orange-200/80 bg-white/95 px-5 py-4 shadow-sm shadow-orange-100/60 lg:flex lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Workspace</p>
              <h1 className="text-lg font-semibold text-zinc-950">{workspaceName}</h1>
            </div>
            <p className="text-sm text-zinc-500">{email}</p>
          </header>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
