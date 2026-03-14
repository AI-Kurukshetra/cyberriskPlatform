"use client";

import type { JSX } from "react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton(): JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, setIsPending] = useState<boolean>(false);

  function handleSignOut(): void {
    setIsPending(true);

    startTransition(async () => {
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
      setIsPending(false);
    });
  }

  return (
    <Button
      className="mt-4 w-full justify-start"
      disabled={isPending}
      onClick={handleSignOut}
      type="button"
      variant="outline"
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
