import { describe, expect, it } from "vitest";
import { AGENDA_DAYS } from "../agenda";

describe("La U del Futuro 2026 agenda", () => {
  it("contains the single Saturday program from the proposal", () => {
    expect(AGENDA_DAYS).toHaveLength(1);
    expect(AGENDA_DAYS[0].date).toBe("Sábado 24 de octubre de 2026");
    expect(AGENDA_DAYS[0].events).toHaveLength(12);
    expect(AGENDA_DAYS[0].events.map(({ title }) => title)).toContain(
      "Memoria y conmemoración",
    );
  });

  it("labels the unconfirmed and proposed program elements", () => {
    const events = AGENDA_DAYS[0].events;
    expect(events.find(({ title }) => title === "Conferencias temáticas por facultades")?.note)
      .toContain("Se evalúa la presencialidad");
    expect(events.find(({ title }) => title === "Asamblea de la ASEUTP")?.note)
      .toContain("Se recomienda");
    expect(events.find(({ title }) => title === "Noche cultural")?.note)
      .toContain("sujeto a confirmación");
  });
});
