import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { AboutSection } from "@/features/landing/components/AboutSection";
import { SpeakersSection } from "@/features/landing/components/SpeakersSection";
import { AgendaSection } from "@/features/landing/components/AgendaSection";
import { BenefitsSection } from "@/features/landing/components/BenefitsSection";
import { TicketSection } from "@/features/landing/components/TicketSection";
import { TestimonialsSection } from "@/features/landing/components/TestimonialsSection";
import { FaqSection } from "@/features/landing/components/FaqSection";
import { CtaSection } from "@/features/landing/components/CtaSection";
import { AuthErrorToast } from "@/features/auth/components/AuthErrorToast";

export default function LandingPage() {
  return (
    <>
      <AuthErrorToast />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <BenefitsSection />
        <SpeakersSection />

        {/*<AgendaSection />
        <TicketSection />
        <TestimonialsSection />
        <FaqSection />*/}

        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
