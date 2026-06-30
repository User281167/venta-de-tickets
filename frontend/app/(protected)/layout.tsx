import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Box } from "@chakra-ui/react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Box pt={16} minH="100vh" bg="gray.50">
        {children}
      </Box>
      <Footer />
    </>
  );
}
