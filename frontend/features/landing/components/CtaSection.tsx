import { Box, Button, Container, Heading, Stack, Text } from "@chakra-ui/react";
import { IconTicket } from "@tabler/icons-react";
import NextLink from "next/link";

export function CtaSection() {
  return (
    <Box py={20} bg="brand.dark">
      <Container maxW="800px" px={4}>
        <Stack gap={5} align="center" textAlign="center">
          <Heading as="h2" size={{ base: "2xl", md: "3xl" }} color="white">
            No te quedes fuera del futuro
          </Heading>

          <Text fontSize="lg" color="gray.300" maxW="lg">
            Las mejores oportunidades no esperan. Asegura tu lugar en una de las
            experiencias académicas más importantes del año.
          </Text>

          <Button
            asChild
            size="lg"
            colorPalette="orange"
            _hover={{ transform: "translateY(-2px)" }}
          >
            <NextLink href="/#entradas">
              <IconTicket size={20} />
              Quiero mi entrada ahora
            </NextLink>
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
