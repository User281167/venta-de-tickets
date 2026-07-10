import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Box } from "@chakra-ui/react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Box pt={16} minH="90vh" bg="brand.dark">
        {children}
      </Box>
      <Footer />
    </>
  );
}
