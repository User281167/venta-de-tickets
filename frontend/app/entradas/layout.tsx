import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Box } from "@chakra-ui/react";

export default function EntradasLayout({
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
