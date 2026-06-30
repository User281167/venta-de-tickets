import {
  Box,
  Container,
  Flex,
  HStack,
  Link as ChakraLink,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandX,
  IconBrain,
  IconMail,
} from "@tabler/icons-react";
import NextLink from "next/link";

export function Footer() {
  return (
    <Box as="footer" bg="brand.dark" color="white" py={12}>
      <Container maxW="1200px" px={4}>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          gap={8}
        >
          <Stack gap={3} maxW="sm">
            <HStack gap={2}>
              <IconBrain size={24} color="#76ABAE" />
              <Text fontSize="lg" fontWeight="bold">
                Future Minds 2026
              </Text>
            </HStack>

            <Text fontSize="sm" color="gray.300">
              Universidad Central – Eventos Académicos
            </Text>
          </Stack>

          <Stack gap={2}>
            <Text
              fontWeight="semibold"
              fontSize="sm"
              color="gray.300"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Enlaces
            </Text>

            <ChakraLink
              asChild
              fontSize="sm"
              color="gray.300"
              _hover={{ color: "brand.teal" }}
            >
              <NextLink href="/#hero">Inicio</NextLink>
            </ChakraLink>

            <ChakraLink
              asChild
              fontSize="sm"
              color="gray.300"
              _hover={{ color: "brand.teal" }}
            >
              <NextLink href="/#agenda">Programa</NextLink>
            </ChakraLink>

            <ChakraLink
              asChild
              fontSize="sm"
              color="gray.300"
              _hover={{ color: "brand.teal" }}
            >
              <NextLink href="/#speakers">Speakers</NextLink>
            </ChakraLink>

            <ChakraLink
              asChild
              fontSize="sm"
              color="gray.300"
              _hover={{ color: "brand.teal" }}
            >
              <NextLink href="/#entradas">Entradas</NextLink>
            </ChakraLink>
          </Stack>

          <Stack gap={2}>
            <Text
              fontWeight="semibold"
              fontSize="sm"
              color="gray.300"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Contacto
            </Text>

            <HStack gap={2}>
              <IconMail size={16} />

              <Text fontSize="sm" color="gray.300">
                eventos@universidadcentral.edu
              </Text>
            </HStack>

            <HStack gap={2} pt={2}>
              <ChakraLink
                href="#"
                aria-label="Instagram"
                color="gray.300"
                _hover={{ color: "brand.teal" }}
              >
                <IconBrandInstagram size={18} />
              </ChakraLink>

              <ChakraLink
                href="#"
                aria-label="X"
                color="gray.300"
                _hover={{ color: "brand.teal" }}
              >
                <IconBrandX size={18} />
              </ChakraLink>

              <ChakraLink
                href="#"
                aria-label="LinkedIn"
                color="gray.300"
                _hover={{ color: "brand.teal" }}
              >
                <IconBrandLinkedin size={18} />
              </ChakraLink>
            </HStack>
          </Stack>
        </Flex>

        <Separator my={8} borderColor="gray.600" />

        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align="center"
          gap={4}
        >
          <Text fontSize="xs" color="gray.400">
            &copy; {new Date().getFullYear()} Universidad Central – Eventos
            Académicos. Todos los derechos reservados.
          </Text>

          <HStack gap={4}>
            <ChakraLink
              asChild
              fontSize="xs"
              color="gray.400"
              _hover={{ color: "brand.teal" }}
            >
              <NextLink href="/terminos">Términos y condiciones</NextLink>
            </ChakraLink>

            <ChakraLink
              asChild
              fontSize="xs"
              color="gray.400"
              _hover={{ color: "brand.teal" }}
            >
              <NextLink href="/privacidad">Política de privacidad</NextLink>
            </ChakraLink>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
