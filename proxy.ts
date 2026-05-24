import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Role } from "@/types";

const AUTH_ROUTES = ["/login", "/signup"];
const TENANT_PREFIX = "/tenant";
const LANDLORD_PREFIX = "/landlord";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const role = user.user_metadata?.role as Role | undefined;
    if (!role) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname =
      role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  if (pathname.startsWith(TENANT_PREFIX)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = user.user_metadata?.role as Role | undefined;
    if (role && role !== "tenant") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/landlord/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
    // undefined role: let through — layout checks DB profile
  }

  if (pathname.startsWith(LANDLORD_PREFIX)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = user.user_metadata?.role as Role | undefined;
    if (role && role !== "landlord") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/tenant/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
    // undefined role: let through — layout checks DB profile
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
