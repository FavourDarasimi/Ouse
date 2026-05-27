import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Rule 1: Unauthenticated → protect /landlord, /tenant, /onboarding ──
  if (!user) {
    if (
      pathname.startsWith("/landlord") ||
      pathname.startsWith("/tenant") ||
      pathname.startsWith("/onboarding")
    ) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  // Authenticated from here — fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarded")
    .eq("id", user.id)
    .maybeSingle();

  const isOnboarded = profile?.onboarded === true;
  const role = profile?.role ?? null;

  // ── Rule 2: Authenticated visiting /login or /signup → /onboarding ──
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = "/onboarding";
    return NextResponse.redirect(onboardingUrl);
  }

  // ── Rule 3: Not onboarded → only allow /onboarding and /auth ──
  if (!isOnboarded) {
    if (!pathname.startsWith("/onboarding") && !pathname.startsWith("/auth")) {
      const onboardingUrl = request.nextUrl.clone();
      onboardingUrl.pathname = "/onboarding";
      return NextResponse.redirect(onboardingUrl);
    }
    return supabaseResponse;
  }

  // ── Rule 4: Onboarded visiting /onboarding → role dashboard ──
  if (pathname.startsWith("/onboarding")) {
    if (role === "landlord" || role === "tenant") {
      const url = request.nextUrl.clone();
      url.pathname =
        role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // ── Rule 5: Landlord accessing /tenant → /landlord/dashboard ──
  if (role === "landlord" && pathname.startsWith("/tenant")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/landlord/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  // ── Rule 6: Tenant accessing /landlord → /tenant/dashboard ──
  if (role === "tenant" && pathname.startsWith("/landlord")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/tenant/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  // ── Root path: onboarded users → role dashboard ──
  if (pathname === "/") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname =
      role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth-bg.png|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
