import { Box, Container } from "@chakra-ui/react";

export default function CheckoutStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box minH="80vh" py={20}>
      <Container maxW="lg">
        {children}
      </Container>
    </Box>
  );
}
