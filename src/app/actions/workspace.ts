"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const WORKSPACE_COOKIE = "cp_has_workspace";
const WORKSPACE_COOKIE_TTL = 60 * 60 * 24 * 7; // 7 days

export async function refreshWorkspaceCookie() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    cookieStore.delete(WORKSPACE_COOKIE);
    return { hasWorkspace: false };
  }

  const { data: membership, error } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (membership) {
    cookieStore.set(WORKSPACE_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: WORKSPACE_COOKIE_TTL,
    });
    return { hasWorkspace: true };
  }

  cookieStore.delete(WORKSPACE_COOKIE);
  return { hasWorkspace: false };
}
