import { SponsorNavbar } from "@/features/sponsor/components/Navbar";
import { SponsorHero } from "@/features/sponsor/components/Hero";
import { PillarsSection } from "@/features/sponsor/components/PillarsSection";
import { LogoSection } from "@/features/sponsor/components/LogoSection";
import { PaletteSection } from "@/features/sponsor/components/PaletteSection";
import { TypographySection } from "@/features/sponsor/components/TypographySection";
import { SloganSection } from "@/features/sponsor/components/SloganSection";
import { CtaSection } from "@/features/sponsor/components/CtaSection";

export default function AliadosPage() {
  return (
    <>
      <main>
        <SponsorHero />
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
