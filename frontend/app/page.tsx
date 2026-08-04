import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { AboutSection } from "@/features/landing/components/AboutSection";
import { SpeakersSection } from "@/features/landing/components/SpeakersSection";
import { BenefitsSection } from "@/features/landing/components/BenefitsSection";
import { TicketSection } from "@/features/landing/components/TicketSection";
import { CtaSection } from "@/features/landing/components/CtaSection";
import { AuthErrorToast } from "@/features/auth/components/AuthErrorToast";
import { FullWidthSlider } from "@/features/landing/components/FullWidthSlider";
import { FaqSection } from "@/features/landing/components/FaqSection";
import { TestimonialsSection } from "@/features/landing/components/TestimonialsSection";
import { PartnersSection } from "@/features/landing/components/PartnersSection";
import { DonationSection } from "@/features/landing/components/DonationSection";
import { AsociacionSection } from "@/features/sponsor/components/AsociacionSection";
import { ImpactoSocialSection } from "@/features/sponsor/components/ImpactoSocialSection";
import { TicketPurchaseClient } from "@/features/ticket-purchase/components/TicketPurchaseClient";

export default function LandingPage() {
  return (
    <>
      <AuthErrorToast />
      <Navbar />
      <main>
        <HeroSection />
        <TicketPurchaseClient />
        {/*<TicketSection />*/}
        <DonationSection />
        <AboutSection />
        <FullWidthSlider />
        <BenefitsSection />
        <SpeakersSection />
        {/*<TestimonialsSection />*/}
        <AsociacionSection />
        <ImpactoSocialSection />
        <PartnersSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
