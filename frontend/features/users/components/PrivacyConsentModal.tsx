"use client";

import {
  Button,
  Checkbox,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAcceptPrivacy } from "../hooks/useProfile";

export function PrivacyConsentModal() {
  const [accepted, setAccepted] = useState(false);
  const { mutate: doAccept, isPending } = useAcceptPrivacy();

  const handleAccept = () => {
    doAccept();
  };

  return (
    <VStack gap={6} align="stretch" maxW="lg" mx="auto" mt={10} p={6}>
      <Heading as="h1" size="lg">
        Aviso de Privacidad
      </Heading>

      <Text fontSize="sm" color="gray.600">
        De acuerdo con la Ley 1581 de Protección de Datos Personales en
        Colombia, autorizas el tratamiento de tus datos personales para los
        fines de registro, comunicación y organización del evento.
      </Text>

      <Text fontSize="sm" color="gray.600">
        Tus datos serán almacenados de forma segura y no serán compartidos
        con terceros sin tu consentimiento explícito. Puedes revisar, actualizar
        o solicitar la eliminación de tus datos en cualquier momento.
      </Text>

      <Checkbox.Root
        checked={accepted}
        onCheckedChange={(e) => setAccepted(!!e.checked)}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>
          He leído y acepto el aviso de privacidad
        </Checkbox.Label>
      </Checkbox.Root>

      <Button
        colorScheme="blue"
        disabled={!accepted}
        loading={isPending}
        onClick={handleAccept}
      >
        Aceptar y continuar
      </Button>
    </VStack>
  );
}
