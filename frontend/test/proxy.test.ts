import { describe, expect, it } from "vitest";
import { canAccessDonationAdmin, isRetiredPage } from "../proxy";

describe("public route availability", () => {
  it.each([
    "/registro",
    "/entradas",
    "/donaciones",
    "/checkout",
    "/carrito",
    "/mi-cuenta/entradas",
    "/aliados",
    "/admin/usuarios",
    "/admin/pagos",
    "/donaciones/retorno/unknown",
    "/donaciones/nueva-campana",
  ])("redirects retired route %s to the public home", (pathname) => {
    expect(isRetiredPage(pathname)).toBe(true);
  });

  it.each([
    "/",
    "/agenda",
    "/donaciones/retorno/state/success",
    "/donaciones/retorno/epayco-result",
    "/login",
    "/reset-password",
    "/admin",
    "/admin/donaciones",
    "/api/auth/session",
    "/api/donaciones/counter",
    "/assets/utpton/Logos/Horizontal%20blanco.png",
    "/auth/callback",
  ])("keeps required route %s available", (pathname) => {
    expect(isRetiredPage(pathname)).toBe(false);
  });

  it.each([
    ["admin", true],
    ["super_admin", true],
    ["checker", false],
    ["client", false],
    [null, false],
    [undefined, false],
  ] as const)("allows donation administration for role %s: %s", (role, allowed) => {
    expect(canAccessDonationAdmin(role)).toBe(allowed);
  });
});
