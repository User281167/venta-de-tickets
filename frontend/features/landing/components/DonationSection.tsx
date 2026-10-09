"use client";

import { HStack, Stack, Text } from "@chakra-ui/react";
import { IconHeartFilled } from "@tabler/icons-react";
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

      <Stack align="center" gap={6} px={4}>
        <IconHeartFilled size={32} color="#f5bd35" />

        <Text fontSize="3xl" fontWeight="bold" color="white" textAlign="center">
          Súmate a UTPton
        </Text>

        <Text
          id="donaciones-comunidad-utp"
          fontSize="xl"
          color="brand.muted"
          textAlign="center"
          maxW="500px"
        >
          Tu aporte voluntario fortalece el fondo de solidaridad para apoyar a
          la comunidad UTP afectada por el sismo. La participación en la jornada
          no requiere comprar una entrada.
        </Text>

        <HStack gap={4} wrap="wrap" justify="center">
          <DonationButton
            account="VICTIMAS"
            label="Donar a UTPton"
          />
        </HStack>
        <DonationCounter />
      </Stack>
    </section>
  );
}
