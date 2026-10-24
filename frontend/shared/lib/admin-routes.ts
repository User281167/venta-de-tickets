const ADMIN_ROLES = ["super_admin", "admin"] as const;
const REGISTRATION_ROLES = [...ADMIN_ROLES, "checker"] as const;

export const ADMIN_ROUTES = [
  {
    href: "/admin",
    label: "Panel UTPtón",
    roles: REGISTRATION_ROLES,
    navRoles: ADMIN_ROLES,
    exact: true,
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    roles: ADMIN_ROLES,
    navRoles: ADMIN_ROLES,
    exact: false,
  },
  {
    href: "/admin/registro",
    label: "Validar registro",
    roles: REGISTRATION_ROLES,
    navRoles: REGISTRATION_ROLES,
    exact: true,
  },
  {
    href: "/admin/donaciones",
    label: "Donaciones y meta",
    roles: ADMIN_ROLES,
    navRoles: ADMIN_ROLES,
    exact: true,
  },
  {
    href: "/admin/analiticas",
    label: "Analíticas",
    roles: ADMIN_ROLES,
    navRoles: ADMIN_ROLES,
    exact: true,
  },
] as const;

export function getAdminNavRoutes(role: string | null | undefined) {
  return ADMIN_ROUTES.filter(
    (route) =>
      role != null && (route.navRoles as readonly string[]).includes(role),
  );
}

export function getAdminRoute(pathname: string) {
  return ADMIN_ROUTES.find(
    ({ href, exact }) =>
      pathname === href || (!exact && pathname.startsWith(`${href}/`)),
  );
}

export function canAccessAdminRoute(
  pathname: string,
  role: string | null | undefined,
) {
  const route = getAdminRoute(pathname);
  return Boolean(
    route && role && (route.roles as readonly string[]).includes(role),
  );
}

export function shouldRedirectAdminPath(pathname: string, role: string) {
  return pathname === "/admin" && role === "checker" ? "/admin/registro" : null;
}
