import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Box } from "@chakra-ui/react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box minH="100dvh" display="flex" flexDirection="column" bg="brand.dark">
      <Navbar />
      <Box as="main" flex={1} display="flex" flexDirection="column" overflow="hidden">
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
