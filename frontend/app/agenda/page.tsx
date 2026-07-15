import { Box } from "@chakra-ui/react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AgendaHero } from "@/features/agenda/components/AgendaHero";
import { AgendaTimeline } from "@/features/agenda/components/AgendaTimeline";

export default function AgendaPage() {
  return (
    <>
      <Navbar />

      <main>
        <Box bg="brand.dark" color="brand.light">
          <AgendaHero />
          <AgendaTimeline />
        </Box>
      </main>

      <Footer />
    </>
  );
}
