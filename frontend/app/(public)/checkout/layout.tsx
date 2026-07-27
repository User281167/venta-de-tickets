import { Box } from "@chakra-ui/react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Particles } from "@/shared/components/Particles";

export default function CheckoutStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Box bg="#000000" minH="100vh">
        {children}
      </Box>
      <Footer />
    </>
  );
}
