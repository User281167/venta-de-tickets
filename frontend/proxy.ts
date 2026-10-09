import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_ROLES = new Set(["super_admin", "admin"]);

const ACTIVE_PAGES = [
  "/",
  "/agenda",
  "/donaciones",
  "/terminos",
  "/privacidad",
  "/login",
  "/reset-password",
  "/update-password",
];

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
    pathname === "/admin" ||
    pathname === "/admin/donaciones" ||
    pathname.startsWith("/donaciones/")
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

  if (!user && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && pathname.startsWith("/admin")) {
    const role = user.app_metadata?.role as string | null;

    if (role && !ADMIN_ROLES.has(role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/callback).*)"],
};
