import { Box, Container } from "@chakra-ui/react";

export default function CheckoutStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box minH="80vh">
      <Container>
        {children}
      </Container>
    </Box>
  );
}
