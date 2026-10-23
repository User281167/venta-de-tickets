import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  canAccessAdminRoute,
  getAdminRoute,
  shouldRedirectAdminPath,
} from "@/shared/lib/admin-routes";

export function canAccessDonationAdmin(role: string | null | undefined) {
  return canAccessAdminRoute("/admin/donaciones", role);
}

const ACTIVE_PAGES = [
  "/",
  "/agenda",
  "/terminos",
  "/privacidad",
  "/login",
  "/reset-password",
  "/update-password",
  "/registro",
  "/registrate",
  "/asociados",
  "/donar",
  "/donar/frame",
];

const DONATION_RETURN_PAGES = new Set([
  "/donaciones/retorno",
  "/donaciones/retorno/epayco-result",
  "/donaciones/retorno/state/success",
  "/donaciones/retorno/state/pending",
  "/donaciones/retorno/state/failure",
]);

export function isRetiredPage(pathname: string) {
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/assets/") ||
    pathname === "/auth/callback"
  ) {
    return false;
  }

  return !(
    ACTIVE_PAGES.includes(pathname) ||
    getAdminRoute(pathname) !== undefined ||
    DONATION_RETURN_PAGES.has(pathname)
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isRetiredPage(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
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

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const adminRoute = getAdminRoute(pathname);

  if (!user && adminRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && adminRoute) {
    const role = user.app_metadata?.role;

    if (!canAccessAdminRoute(pathname, role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const redirectPath = shouldRedirectAdminPath(pathname, role);
    if (redirectPath) {
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/callback).*)"],
};
