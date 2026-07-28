import { Box} from "@chakra-ui/react";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box bg="#000000" minH="100vh">
      {children}
    </Box>
  );
}
