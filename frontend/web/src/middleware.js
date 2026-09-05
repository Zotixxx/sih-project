import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const PUBLIC_PREFIXES = ["/_next", "/images", "/favicon.ico"];
const LEGACY_PREFIXES = [
  "/dashboard",
  "/applications",
  "/certificates",
  "/instruments",
  "/inspections",
  "/notifications",
  "/settings",
  "/admin",
  "/lmo",
];

const ROLE_ROUTES = {
  BUSINESS: ["/dashboard", "/applications", "/certificates", "/instruments", "/notifications", "/settings"],
  LMO: ["/dashboard", "/inspections", "/verification-details", "/inspect", "/notifications", "/settings"],
  ASSISTANT_CONTROLLER: ["/dashboard", "/fresh-applications", "/verify", "/lmos", "/notifications", "/settings"],
  SYSTEM_ADMIN: [
    "/dashboard",
    "/applications",
    "/certificates",
    "/instruments",
    "/inspections",
    "/fresh-applications",
    "/verify",
    "/lmos",
    "/notifications",
    "/settings",
  ],
};

const isPublic = (pathname) =>
  pathname === "/" ||
  pathname === "/login" ||
  pathname === "/register/business" ||
  pathname === "/verify" ||
  pathname.startsWith("/verify/") ||
  PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

const isLegacyProtected = (pathname) =>
  LEGACY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const legacyTarget = (pathname, userId) => {
  if (pathname === "/admin" || pathname === "/admin/") return `/${userId}/dashboard`;
  if (pathname.startsWith("/admin/fresh-applications")) {
    return pathname.replace("/admin/fresh-applications", `/${userId}/fresh-applications`);
  }
  if (pathname.startsWith("/admin/verify") || pathname.startsWith("/admin/awaiting-certificates")) {
    return pathname.replace(/^\/admin\/(verify|awaiting-certificates)/, `/${userId}/verify`);
  }
  if (pathname.startsWith("/admin/lmos")) return pathname.replace("/admin/lmos", `/${userId}/lmos`);
  if (pathname.startsWith("/lmo/verification-details")) {
    return pathname.replace("/lmo/verification-details", `/${userId}/verification-details`);
  }
  if (pathname.startsWith("/lmo/inspect")) return pathname.replace("/lmo/inspect", `/${userId}/inspect`);
  return `/${userId}${pathname}`;
};

const subPathFor = (pathname) => {
  const [, , ...rest] = pathname.split("/");
  return `/${rest.join("/")}`.replace(/\/$/, "") || "/dashboard";
};

const isAllowedForRole = (role, subPath) => {
  const allowed = ROLE_ROUTES[role] || [];
  return allowed.some((route) => subPath === route || subPath.startsWith(`${route}/`));
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "supabase-env-missing");
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isLegacyProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = legacyTarget(pathname, user.id);
    return NextResponse.redirect(url);
  }

  const [userId] = pathname.split("/").filter(Boolean);
  if (userId !== user.id) {
    const url = request.nextUrl.clone();
    url.pathname = `/${user.id}/dashboard`;
    url.searchParams.set("denied", "url-user-mismatch");
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.role || !isAllowedForRole(profile.role, subPathFor(pathname))) {
    const url = request.nextUrl.clone();
    url.pathname = `/${user.id}/dashboard`;
    url.searchParams.set("denied", "role");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|.*\\..*).*)"],
};
