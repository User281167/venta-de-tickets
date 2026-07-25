import { SponsorNavbar } from "@/features/sponsor/components/Navbar";
import { SponsorHero } from "@/features/sponsor/components/Hero";
import { ImpactSection } from "@/features/sponsor/components/ImpactSection";
import { PorQueSection } from "@/features/sponsor/components/PorQueSection";
import { FuturoSection } from "@/features/sponsor/components/FuturoSection";
import { ExperienciasSection } from "@/features/sponsor/components/ExperienciasSection";
import { UbicacionesSection } from "@/features/sponsor/components/UbicacionesSection";
import { BeneficiosSection } from "@/features/sponsor/components/BeneficiosSection";
import { AsociacionSection } from "@/features/sponsor/components/AsociacionSection";
import { ImpactoSocialSection } from "@/features/sponsor/components/ImpactoSocialSection";
import { PillarsSection } from "@/features/sponsor/components/PillarsSection";
import { LogoSection } from "@/features/sponsor/components/LogoSection";
import { PaletteSection } from "@/features/sponsor/components/PaletteSection";
import { TypographySection } from "@/features/sponsor/components/TypographySection";
import { SloganSection } from "@/features/sponsor/components/SloganSection";
import { CtaSection } from "@/features/sponsor/components/CtaSection";
import { CierreSection } from "@/features/sponsor/components/CierreSection";

export default function AliadosPage() {
  return (
    <>
      <main>
        <SponsorHero />
        <ImpactSection />
        <PorQueSection />
        <FuturoSection />
        <ExperienciasSection />
        <UbicacionesSection />
        <BeneficiosSection />
        <AsociacionSection />
        <ImpactoSocialSection />
        <CierreSection />
        <PillarsSection />
        <LogoSection />
        <PaletteSection />
        <TypographySection />
        <SloganSection />
        <CtaSection />
      </main>
    </>
  );
}
