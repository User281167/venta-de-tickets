import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { DonationSection } from "@/features/landing/components/DonationSection";
import { ProgrammaticAxes } from "@/features/landing/components/ProgrammaticAxes";
import { AgendaTimeline } from "@/features/agenda/components/AgendaTimeline";
import { InstagramUpdates } from "@/features/landing/components/InstagramUpdates";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <DonationSection />
        <ProgrammaticAxes />
        <AgendaTimeline />
        <InstagramUpdates />
      </main>
      <Footer />
    </>
  );
}
