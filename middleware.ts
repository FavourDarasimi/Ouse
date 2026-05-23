import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Role } from "@/types";

// Routes that require the user to be logged out (auth pages)
const AUTH_ROUTES = ["/login", "/signup"];

// Route prefixes that require authentication
const TENANT_PREFIX = "/tenant";
const LANDLORD_PREFIX = "/landlord";

export async function middleware(request: NextRequest) {
  // Required boilerplate — the response must be mutated in setAll so
  // refreshed session cookies are forwarded to the browser correctly.
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
          // Write cookies to request (for downstream middleware)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Rebuild response with updated cookies
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Always use getUser() in middleware — never getSession().
  // getSession() only reads the JWT from cookies without server-side
  // verification, making it insecure for access control decisions.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // --- Redirect authenticated users away from auth pages ---
  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const role = (user.user_metadata?.role ?? null) as Role | null;
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname =
      role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // --- Protect tenant routes ---
  if (pathname.startsWith(TENANT_PREFIX)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (user.user_metadata?.role ?? null) as Role | null;
    if (role !== "tenant") {
      // Landlord trying to access tenant routes → send to their dashboard
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/landlord/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // --- Protect landlord routes ---
  if (pathname.startsWith(LANDLORD_PREFIX)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (user.user_metadata?.role ?? null) as Role | null;
    if (role !== "landlord") {
      // Tenant trying to access landlord routes → send to their dashboard
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/tenant/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Pass through — return the response so cookies are forwarded
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico   (favicon)
     * - public assets (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
