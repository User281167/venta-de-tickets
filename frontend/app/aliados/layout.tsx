import { Box } from "@chakra-ui/react";
import { SponsorNavbar } from "@/features/sponsor/components/Navbar";
import { SponsorFooter } from "@/features/sponsor/components/Footer";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SponsorNavbar />
      <Box minH="100vh">{children}</Box>
      {/*<SponsorFooter />*/}
      <Footer />
    </>
  );
}
