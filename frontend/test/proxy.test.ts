import { describe, expect, it } from "vitest";
import { isRetiredPage } from "../proxy";

describe("public route availability", () => {
  it.each([
    "/registro",
    "/entradas",
    "/checkout",
    "/carrito",
    "/mi-cuenta/entradas",
    "/aliados",
    "/admin/usuarios",
    "/admin/pagos",
  ])("redirects retired route %s to the public home", (pathname) => {
    expect(isRetiredPage(pathname)).toBe(true);
  });

  it.each([
    "/",
    "/agenda",
    "/donaciones",
    "/donaciones/retorno/state/success",
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
});
