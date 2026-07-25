"use client";

import { Box, Container, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { IconCheck, IconX } from "@tabler/icons-react";

const RULES = [
  { ok: true, text: "Portadas, cierres e invitaciones institucionales." },
  { ok: true, text: "Videos, banners y cuñas radiales." },
  { ok: true, text: "Menciones oficiales del evento." },
  { ok: false, text: "Reemplazo del nombre oficial del evento." },
  { ok: false, text: "Encerrar la marca en marcos o cajas." },
  { ok: false, text: "Deformar, rotar o aplicar efectos 3D." },
];

export function SloganSection() {
  return (
    <Box
      as="section"
      bg="utp.noche"
      color="utp.artico"
      py={{ base: 16, md: 24 }}
      borderBottomWidth="1px"
      borderColor="whiteAlpha.100"
    >
      <Container maxW="5xl" textAlign="center">
        <Stack gap={{ base: 8, md: 12 }} align="center">
          <Text textStyle="eyebrow" color="utp.azul">
            Slogan oficial
          </Text>
          <Heading
            as="h2"
            fontFamily="heading"
            fontSize={{ base: "3.5rem", md: "6rem", lg: "8rem" }}
            lineHeight="0.9"
            textTransform="uppercase"
            letterSpacing="-0.02em"
            style={{ textWrap: "balance" }}
          >
            La U{" "}
            <Box as="span" color="utp.azul">
              del futuro
            </Box>
          </Heading>
          <Text
            fontFamily="body"
            fontSize={{ base: "md", md: "lg" }}
            color="utp.artico"
            opacity={0.78}
            maxW="2xl"
          >
            Funciona como cierre emocional, visual y sonoro de la marca. Logo o
            nombre del evento primero; slogan después, como remate final de
            comunicación.
          </Text>

          <Stack
            w="100%"
            maxW="3xl"
            gap={2}
            p={{ base: 5, md: 6 }}
            rounded="2xl"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            bg="whiteAlpha.50"
            textAlign="left"
          >
            {RULES.map((r) => (
              <HStack key={r.text} gap={3}>
                <Box
                  w="28px"
                  h="28px"
                  rounded="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg={r.ok ? "utp.verde" : "utp.magenta"}
                  color="utp.noche"
                  flexShrink={0}
                >
                  {r.ok ? <IconCheck size={16} /> : <IconX size={16} />}
                </Box>
                <Text fontFamily="body" color="utp.artico" opacity={0.9}>
                  {r.text}
                </Text>
              </HStack>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
