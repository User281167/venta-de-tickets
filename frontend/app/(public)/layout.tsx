import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Box } from "@chakra-ui/react";
import { CartProvider } from "@/providers/CartProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Navbar />
      <Box minH="100vh">{children}</Box>
      <Footer />
    </CartProvider>
  );
}
