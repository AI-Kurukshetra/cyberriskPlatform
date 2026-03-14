import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/clients",
  "/pipeline",
  "/tasks",
  "/settings",
  "/onboarding",
] as const;
const AUTH_ROUTES = ["/login", "/signup"] as const;

function isRouteMatch(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    // Required env vars:
    // - NEXT_PUBLIC_SUPABASE_URL
    // - NEXT_PUBLIC_SUPABASE_ANON_KEY
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(): ReturnType<NextRequest["cookies"]["getAll"]> {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: CookieOptions;
          }>
        ): void {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtectedRoute = isRouteMatch(pathname, PROTECTED_ROUTES);
  const isAuthRoute = isRouteMatch(pathname, AUTH_ROUTES);

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthRoute) {
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    return NextResponse.redirect(
      new URL(membership ? "/dashboard" : "/onboarding", request.url)
    );
  }

  return response;
}
