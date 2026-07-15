import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  HStack,
  Image,
  Link as ChakraLink,
  Separator,
  Stack,
  Text,
  Field,
  Input,
} from "@chakra-ui/react";
import {
  IconArrowRight,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandYoutube,
  IconMail,
  IconMapPin,
  IconPhone,
  IconWorld,
} from "@tabler/icons-react";
import NextLink from "next/link";
import React from "react";

const QUICK_LINKS = [
  { label: "La Convención", href: "/#convencion" },
  { label: "Agenda", href: "/agenda" },
  { label: "Actividades", href: "/#actividades" },
  { label: "Ponentes", href: "/#speakers" },
  { label: "Entradas", href: "/#entradas" },
  { label: "Contacto", href: "/#contacto" },
];

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontSize="xs"
      fontWeight="black"
      color="brand.cyan"
      textTransform="uppercase"
      letterSpacing="0.12em"
    >
      {children}
    </Text>
  );
}

export function Footer() {
  return (
    <Box
      id="contacto"
      as="footer"
      bg="#030615"
      color="white"
      pt={{ base: 12, md: 16 }}
      pb={8}
      borderTopWidth="1px"
      borderColor="rgba(255,255,255,0.08)"
    >
      <Container maxW="8xl" px={{ base: 4, md: 6 }}>
        <Grid
          templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "repeat(5, 1fr)" }}
          gap={{ base: 10, lg: 8 }}
          alignItems="start"
        >
          <Stack gap={5} align="flex-start">
            <FooterHeading>Organiza</FooterHeading>

            <Image src="/utp-logo.png" alt="UTP" h="46px" w="auto" />

            <HStack gap={3}>
              <ChakraLink
                href="https://instagram.com/UTPereira"
                aria-label="Instagram"
                color="brand.light"
                _hover={{ color: "brand.cyan" }}
              >
                <IconBrandInstagram size={22} />
              </ChakraLink>

              <ChakraLink
                href="https://www.facebook.com/UTPereira"
                aria-label="Facebook"
                color="brand.light"
                _hover={{ color: "brand.cyan" }}
              >
                <IconBrandFacebook size={22} />
              </ChakraLink>

              <ChakraLink
                href="https://www.youtube.com/UTPereira"
                aria-label="Youtube"
                color="brand.light"
                _hover={{ color: "brand.cyan" }}
              >
                <IconBrandYoutube size={22} />
              </ChakraLink>

              <ChakraLink
                href="https://x.com/UTPereira"
                aria-label="X"
                color="brand.light"
                _hover={{ color: "brand.cyan" }}
              >
                <IconBrandX size={22} />
              </ChakraLink>

              <ChakraLink
                href="https://www.linkedin.com/school/universidad-tecnol-gica-de-pereira/"
                aria-label="LinkedIn"
                color="brand.light"
                _hover={{ color: "brand.cyan" }}
              >
                <IconBrandLinkedin size={22} />
              </ChakraLink>
            </HStack>
          </Stack>

          <Stack gap={4} align="flex-start">
            <FooterHeading>Con el apoyo de</FooterHeading>

            <HStack gap={3} align="flex-start">
              <Image src="/ASE-icon.png" w="48px" h="48px" objectFit="contain" />

              <Stack gap={1} align="flex-start">
                <Text fontWeight="black" color="white" lineHeight="1.2">
                  ASE UTP
                </Text>

                <Text fontSize="xs" color="brand.muted" lineHeight="1.5" maxW="180px">
                  Asociación de Egresados Universidad Tecnológica de Pereira
                </Text>

                <HStack gap={2} pt={1}>
                  <ChakraLink
                    href="https://egresados.utp.edu.co/"
                    aria-label="egresados-web"
                    color="brand.light"
                    _hover={{ color: "brand.cyan" }}
                  >
                    <IconWorld size={18} />
                  </ChakraLink>

                  <ChakraLink
                    href="https://www.instagram.com/aseutp/"
                    aria-label="Instagram"
                    color="brand.light"
                    _hover={{ color: "brand.cyan" }}
                  >
                    <IconBrandInstagram size={18} />
                  </ChakraLink>

                  <ChakraLink
                    href="https://www.facebook.com/EgresadosUTP?mibextid=ZbWKwL"
                    aria-label="Facebook"
                    color="brand.light"
                    _hover={{ color: "brand.cyan" }}
                  >
                    <IconBrandFacebook size={18} />
                  </ChakraLink>

                  <ChakraLink
                    href="https://www.facebook.com/aseutpe?mibextid=ZbWKwL"
                    aria-label="Facebook"
                    color="brand.light"
                    _hover={{ color: "brand.cyan" }}
                  >
                    <IconBrandFacebook size={18} />
                  </ChakraLink>
                </HStack>
              </Stack>
            </HStack>
          </Stack>

          <Stack gap={3} align="flex-start">
            <FooterHeading>Enlaces rápidos</FooterHeading>

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

          <Stack gap={3} align="flex-start">
            <FooterHeading>Información</FooterHeading>

            <HStack gap={2} color="brand.muted" align="flex-start">
              <Box pt={0.5}>
                <IconMapPin size={16} />
              </Box>
              <Text fontSize="sm">Universidad Tecnológica de Pereira</Text>
            </HStack>

            <HStack gap={2} color="brand.muted" align="flex-start">
              <Box pt={0.5}>
                <IconMail size={16} />
              </Box>
              <Text fontSize="sm">egresados@utp.edu.co, aseutp@utp.edu.co</Text>
            </HStack>

            <HStack gap={2} color="brand.muted" align="flex-start">
              <Box pt={0.5}>
                <IconPhone size={16} />
              </Box>
              <Text fontSize="sm">+57 606 313 7110 - 313 7533</Text>
            </HStack>
          </Stack>

          <Box asChild w="full">
            <form className="max-w-xs">
              <Stack gap={4} align="flex-start">
                <FooterHeading>Boletín</FooterHeading>

                <Text fontSize="sm" color="brand.muted">
                  Recibe novedades de La Convención.
                </Text>

                <Flex gap="2" align="center" w="full">
                  <IconMail size={24} color="rgba(255,255,255,0.6)" />

                  <Field.Root flex={1}>
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      color="white"
                      bg="rgba(255,255,255,0.03)"
                      border="1px solid rgba(255,255,255,0.08)"
                      borderRadius="xl"
                      _placeholder={{ color: "rgba(255,255,255,0.5)" }}
                      _hover={{ borderColor: "rgba(255,255,255,0.16)" }}
                      _focus={{
                        borderColor: "brand.cyan",
                        boxShadow: "0 0 12px rgba(0,229,255,0.2)",
                      }}
                    />
                  </Field.Root>
                </Flex>

                <Button
                  type="submit"
                  bg="linear-gradient(90deg, #ff0f7b, #0969ff)"
                  color="white"
                  fontWeight="black"
                  borderRadius="xl"
                  w="full"
                  _hover={{ transform: "translateY(-2px)" }}
                >
                  <NextLink href="/registro" className="flex gap-2">
                    Suscribirme <IconArrowRight size={18} />
                  </NextLink>
                </Button>
              </Stack>
            </form>
          </Box>
        </Grid>

        <Separator my={8} borderColor="rgba(255,255,255,0.08)" />

        <Box
          display="flex"
          flexDirection={{ base: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          gap={4}
        >
          <Text fontSize="xs" color="brand.muted" textAlign="center">
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
        </Box>
      </Container>
    </Box>
  );
}
