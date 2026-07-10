import { Footer } from "@/components/layout/Footer";
import { Box } from "@chakra-ui/react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Box pt={16} minH="90vh" bg="brand.dark">
        {children}
      </Box>
      <Footer />
    </>
  );
}
