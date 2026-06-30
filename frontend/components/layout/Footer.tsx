import {
  Box,
  Container,
  Flex,
  HStack,
  IconButton,
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
            <NextLink href="/#hero" passHref>
              <ChakraLink
                fontSize="sm"
                color="gray.300"
                _hover={{ color: "brand.teal" }}
              >
                Inicio
              </ChakraLink>
            </NextLink>
            <NextLink href="/#agenda" passHref>
              <ChakraLink
                fontSize="sm"
                color="gray.300"
                _hover={{ color: "brand.teal" }}
              >
                Programa
              </ChakraLink>
            </NextLink>
            <NextLink href="/#speakers" passHref>
              <ChakraLink
                fontSize="sm"
                color="gray.300"
                _hover={{ color: "brand.teal" }}
              >
                Speakers
              </ChakraLink>
            </NextLink>
            <NextLink href="/#entradas" passHref>
              <ChakraLink
                fontSize="sm"
                color="gray.300"
                _hover={{ color: "brand.teal" }}
              >
                Entradas
              </ChakraLink>
            </NextLink>
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
              <ChakraLink href="#" aria-label="Instagram">
                <IconButton variant="ghost" colorPalette="teal" size="sm">
                  <IconBrandInstagram size={18} />
                </IconButton>
              </ChakraLink>
              <ChakraLink href="#" aria-label="X">
                <IconButton variant="ghost" colorPalette="teal" size="sm">
                  <IconBrandX size={18} />
                </IconButton>
              </ChakraLink>
              <ChakraLink href="#" aria-label="LinkedIn">
                <IconButton variant="ghost" colorPalette="teal" size="sm">
                  <IconBrandLinkedin size={18} />
                </IconButton>
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
            <NextLink href="/terminos" passHref>
              <ChakraLink
                fontSize="xs"
                color="gray.400"
                _hover={{ color: "brand.teal" }}
              >
                Términos y condiciones
              </ChakraLink>
            </NextLink>
            <NextLink href="/privacidad" passHref>
              <ChakraLink
                fontSize="xs"
                color="gray.400"
                _hover={{ color: "brand.teal" }}
              >
                Política de privacidad
              </ChakraLink>
            </NextLink>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
