import type { JSX } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading(): JSX.Element {
  return (
    <main className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-28 rounded-full bg-orange-100" />
        <Skeleton className="h-10 w-72 bg-zinc-200" />
        <Skeleton className="h-5 w-full max-w-2xl bg-zinc-100" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl bg-white" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl bg-white" />
        <Skeleton className="h-72 rounded-2xl bg-white" />
      </div>
    </main>
  );
}
