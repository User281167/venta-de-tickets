import { Footer } from "@/components/layout/Footer";
import { Box } from "@chakra-ui/react";
import { SponsorNavbar } from "@/features/sponsor/components/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SponsorNavbar />
      <Box minH="100vh">{children}</Box>
      <Footer />
    </>
  );
}
