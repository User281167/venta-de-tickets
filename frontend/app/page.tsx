import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { DonationSection } from "@/features/landing/components/DonationSection";
import { ProgrammaticAxes } from "@/features/landing/components/ProgrammaticAxes";
import { AgendaTimeline } from "@/features/agenda/components/AgendaTimeline";
import { InstagramUpdates } from "@/features/landing/components/InstagramUpdates";
import { PartnersSection } from "../features/landing/components/PartnersSection";
import { CulturalEventsCarousel } from "@/features/landing/components/CulturalEventsCarousel";
import { RegistrationFloat } from "@/features/landing/components/RegistrationFloat";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <DonationSection />
        <ProgrammaticAxes />
        <AgendaTimeline />
        <CulturalEventsCarousel />
        <PartnersSection />
        <InstagramUpdates />
      </main>
      <Footer />
      <RegistrationFloat />
    </>
  );
}
