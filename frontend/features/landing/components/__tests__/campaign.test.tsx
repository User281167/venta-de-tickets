import { renderToStaticMarkup } from "react-dom/server";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { describe, expect, it, vi } from "vitest";
import { HeroSection } from "../HeroSection";
import { ProgrammaticAxes } from "../ProgrammaticAxes";

vi.mock("@/features/donaciones/components/DonationButton", () => ({
  DonationButton: ({ account, label }: { account: string; label: string }) =>
    <button data-account={account}>{label}</button>,
}));
vi.mock("@/features/donaciones/components/DonationCounter", () => ({
  DonationCounter: () => <div data-testid="donation-counter" />,
}));
vi.mock("@/shared/components/Waves", () => ({ DefaultWaves: () => null }));

describe("UTPton public campaign content", () => {
  it("presents the event and donation action without ticket sales", () => {
    const markup = renderToStaticMarkup(<HeroSection />);

    expect(markup).toContain("La U del Futuro");
    expect(markup).toContain("Sábado 24 de octubre de 2026");
    expect(markup).toContain('href="#donaciones"');
    expect(markup).not.toMatch(/entradas|inscríbete|comprar/i);
  });

  it("shows four programmatic axes and directs donations only to UTPton", async () => {
    const { DonationSection } = await import("../DonationSection");
    const axes = renderToStaticMarkup(<ProgrammaticAxes />);
    const donation = renderToStaticMarkup(
      <ChakraProvider value={defaultSystem}>
        <DonationSection />
      </ChakraProvider>,
    );

    expect(axes).toContain("Futuro e inteligencia artificial");
    expect(axes).toContain("Empleo y reactivación");
    expect(axes).toContain("Encuentro de egresados");
    expect(axes).toContain("Solidaridad y memoria");
    expect(axes).toContain("Tras el sismo del 10 de agosto de 2026");
    expect(axes).toContain("video-publicidad.mp4");
    expect(donation).toContain('data-account="VICTIMAS"');
    expect(donation).toContain("fondo de solidaridad");
    expect(donation).toContain("UTPton");
    expect(donation).toContain("donation-counter");
  });
});
