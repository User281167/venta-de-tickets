"use client";

import { Flex, HStack, Stack, Text } from "@chakra-ui/react";
import NextImage from "next/image";
import { DonationButton } from "@/features/donaciones/components/DonationButton";
import { DonationCounter } from "@/features/donaciones/components/DonationCounter";
import { DefaultWaves } from "@/shared/components/Waves";

export function DonationSection() {
  return (
    <section
      id="donaciones"
      className="!relative !overflow-hidden !py-16 sm:!py-20"
      style={{
        background:
          "linear-gradient(100deg, #4116a8 0%, #000000 50%, #0969ff 100%)",
      }}
    >
      <DefaultWaves />

      <Flex align="center" justify="center" wrap="wrap" gap={6} px={4}>
        <Stack align="center" gap={6} px={4}>
          <NextImage
            src="/assets/todos_somo_utp_transparent.png"
            alt="La U del Futuro 2026 · UTPtón"
            width={320}
            height={110}
            className="!h-10 !w-auto sm:!h-12"
          />

          <Text
            fontSize="3xl"
            fontWeight="bold"
            color="white"
            textAlign="center"
          >
            Súmate a UTPtón
          </Text>

          <Text
            id="donaciones-comunidad-utp"
            fontSize="xl"
            color="brand.muted"
            textAlign="center"
            maxW="500px"
          >
            Tu aporte voluntario fortalece el fondo de solidaridad para apoyar a
            la comunidad UTP afectada por el sismo. La participación en la
            jornada no requiere comprar una entrada.
          </Text>

          <HStack gap={4} wrap="wrap" justify="center">
            <DonationButton account="VICTIMAS" label="Donar a UTPtón" />
          </HStack>
        </Stack>

        <DonationCounter />
      </Flex>
    </section>
  );
}
