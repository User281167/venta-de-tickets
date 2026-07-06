import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Image,
  Link as ChakraLink,
  Separator,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  Field,
  InputGroup,
  Input,
} from "@chakra-ui/react";
import {
  IconArrowRight,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandYoutube,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import NextLink from "next/link";

const QUICK_LINKS = [
  { label: "La Convención", href: "/#convencion" },
  { label: "Agenda", href: "/agenda" },
  { label: "Actividades", href: "/#actividades" },
  { label: "Ponentes", href: "/#speakers" },
  { label: "Entradas", href: "/#entradas" },
  { label: "Contacto", href: "/#contacto" },
];

export function Footer() {
  return (
    <Box
      id="contacto"
      as="footer"
      bg="#030615"
      color="white"
      pt={14}
      pb={8}
      borderTopWidth="1px"
      borderColor="rgba(255,255,255,0.08)"
    >
      <Container maxW="8xl" px={{ base: 4, md: 6 }}>
        <SimpleGrid columns={{ base: 1, md: 3, xl: 5 }} gap={10}>
          <Stack gap={5}>
            <HStack gap={5} align="center">
              <Image src="/utp-logo.png" alt="UTP" h="46px" />

              <Box h="44px" w="1px" bg="rgba(255,255,255,0.22)" />
            </HStack>

            <HStack gap={3}>
              <ChakraLink
                href="#"
                aria-label="Instagram"
                color="brand.light"
                _hover={{ color: "brand.cyan" }}
              >
                <IconBrandInstagram size={22} />
              </ChakraLink>

              <ChakraLink
                href="#"
                aria-label="LinkedIn"
                color="brand.light"
                _hover={{ color: "brand.cyan" }}
              >
                <IconBrandLinkedin size={22} />
              </ChakraLink>

              <ChakraLink
                href="#"
                aria-label="Facebook"
                color="brand.light"
                _hover={{ color: "brand.cyan" }}
              >
                <IconBrandFacebook size={22} />
              </ChakraLink>

              <ChakraLink
                href="#"
                aria-label="Youtube"
                color="brand.light"
                _hover={{ color: "brand.cyan" }}
              >
                <IconBrandYoutube size={22} />
              </ChakraLink>
            </HStack>
          </Stack>

          <Stack>
            <HStack maxW="200px">
              <Image src="/ASE-icon.png" w="48px" />

              <VStack>
                <Text
                  w="full"
                  textAlign="center"
                  fontWeight="black"
                  borderBottom="2px solid"
                  borderColor="white"
                >
                  ASE UTP
                </Text>

                <Text fontSize="xs" color="gray.400">
                  Asociación de Egresados Universidad Tecnológica de Pereira
                </Text>
              </VStack>
            </HStack>
          </Stack>

          <Stack gap={3}>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="brand.light"
              textTransform="uppercase"
            >
              Enlaces rápidos
            </Text>

            {QUICK_LINKS.map((link) => (
              <ChakraLink
                key={link.href}
                asChild
                fontSize="sm"
                color="brand.muted"
                _hover={{ color: "brand.pink" }}
              >
                <NextLink href={link.href}>{link.label}</NextLink>
              </ChakraLink>
            ))}
          </Stack>

          <Stack gap={3}>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="brand.light"
              textTransform="uppercase"
            >
              Información
            </Text>

            <HStack gap={2} color="brand.muted">
              <IconMapPin size={16} />
              <Text fontSize="sm">Universidad Tecnológica de Pereira</Text>
            </HStack>

            <HStack gap={2} color="brand.muted">
              <IconMail size={16} />
              <Text fontSize="sm">convencion.egresados@utp.edu.co</Text>
            </HStack>

            <HStack gap={2} color="brand.muted">
              <IconPhone size={16} />
              <Text fontSize="sm">(606) 313 7300</Text>
            </HStack>
          </Stack>

          <form className="max-w-xs">
            <Stack gap={4}>
              <Text
                fontSize="sm"
                fontWeight="bold"
                color="brand.light"
                textTransform="uppercase"
              >
                Boletín
              </Text>

              <Text fontSize="sm" color="brand.muted">
                Recibe novedades de La Convención.
              </Text>

              <Field.Root>
                <InputGroup
                  startElement={
                    <IconMail size={18} color="rgba(255,255,255,0.6)" />
                  }
                >
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    color="white"
                    _placeholder={{ color: "rgba(255,255,255,0.5)" }}
                  />
                </InputGroup>
              </Field.Root>

              <Button
                type="submit"
                bg="linear-gradient(90deg, #ff0f7b, #0969ff)"
                color="white"
                fontWeight="black"
                _hover={{ transform: "translateY(-2px)" }}
              >
                <NextLink href="/registro" className="flex gap-2">
                  Suscribirme <IconArrowRight size={18} />
                </NextLink>
              </Button>
            </Stack>
          </form>
        </SimpleGrid>

        <Separator my={8} borderColor="rgba(255,255,255,0.08)" />

        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align="center"
          gap={4}
        >
          <Text fontSize="xs" color="brand.muted">
            &copy; {new Date().getFullYear()} Universidad Tecnológica de Pereira
            - ASE UTP.
          </Text>

          <HStack gap={4}>
            <ChakraLink
              asChild
              fontSize="xs"
              color="brand.muted"
              _hover={{ color: "brand.cyan" }}
            >
              <NextLink href="/privacidad">Política de privacidad</NextLink>
            </ChakraLink>

            <ChakraLink
              asChild
              fontSize="xs"
              color="brand.muted"
              _hover={{ color: "brand.cyan" }}
            >
              <NextLink href="/terminos">Términos y condiciones</NextLink>
            </ChakraLink>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
