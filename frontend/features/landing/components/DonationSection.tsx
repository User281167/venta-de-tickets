"use client";

import { useEffect, useState } from "react";
import { HStack, Stack, Text } from "@chakra-ui/react";
import { IconHeartFilled } from "@tabler/icons-react";
import { DonationButton } from "@/features/donaciones/components/DonationButton";
import { DefaultWaves } from "@/shared/components/Waves";
import { Particles } from "@/shared/components/Particles";

const VICTIMAS_HASH = "#donaciones-comunidad-utp";

export function DonationSection() {
  const [victimasOpen, setVictimasOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      if (window.location.hash === VICTIMAS_HASH) {
        setVictimasOpen(true);
      }
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

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
      <Particles />

      <Stack align="center" gap={6} px={4}>
        <IconHeartFilled size={32} color="#ff0f7b" />

        <Text fontSize="3xl" fontWeight="bold" color="white" textAlign="center">
          Haz tu donación
        </Text>

        <Text
          id="donaciones-comunidad-utp"
          fontSize="xl"
          color="brand.muted"
          textAlign="center"
          maxW="500px"
        >
          Apoya a La Asociación de Egresados UTP, Barranqueros UTP o a los
          Víctimas y Damnificados por el sismo en Colombia con tu donación. Cada
          aporte cuenta.
        </Text>

        <HStack gap={4} wrap="wrap" justify="center">
          {/*<DonationButton account="LA_CONVENCION" />*/}

          {/*<DonationButton
            account="BARRANQUEROS_UTP"
            socialMedia="https://www.instagram.com/barranqueros_utp"
          />*/}

          <DonationButton
            account="VICTIMAS"
            label="Víctimas/Damnificados por el Sismo"
            open={victimasOpen}
            onOpenChange={setVictimasOpen}
          />
        </HStack>
      </Stack>
    </section>
  );
}
