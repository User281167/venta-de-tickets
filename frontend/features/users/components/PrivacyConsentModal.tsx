"use client";

import {
  Button,
  Checkbox,
  Heading,
  HStack,
  Link as ChakraLink,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import { useAcceptPolicies } from "../hooks/useProfile";

export function PrivacyConsentModal() {
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { mutate: doAccept, isPending } = useAcceptPolicies();

  const bothChecked = acceptedPrivacy && acceptedTerms;

  const handleAccept = () => {
    doAccept(["privacy_policy", "terms_of_service"]);
  };

  return (
    <VStack gap={6} align="stretch" maxW="lg" mx="auto" mt={10} p={6}>
      <Heading as="h1" size="lg">
        Políticas y términos
      </Heading>

      <Text fontSize="sm" color="gray.400">
        Para continuar, debes leer y aceptar nuestras políticas de privacidad y
        los términos del servicio. De acuerdo con la Ley 1581 de Protección de
        Datos Personales en Colombia, autorizas el tratamiento de tus datos
        personales para los fines del evento.
      </Text>

      <VStack
        align="stretch"
        gap={3}
        p={4}
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        borderRadius="md"
      >
        <HStack justify="space-between" align="center" gap={3}>
          <Text fontWeight="semibold" color="gray.200">
            Política de privacidad
          </Text>

          <ChakraLink
            as={NextLink}
            href="/privacidad"
            target="_blank"
            rel="noopener noreferrer"
            color="blue.300"
            fontSize="sm"
            textDecoration="underline"
          >
            Leer
          </ChakraLink>
        </HStack>

        <Checkbox.Root
          checked={acceptedPrivacy}
          onCheckedChange={(e) => setAcceptedPrivacy(!!e.checked)}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>
            He leído y acepto la política de privacidad
          </Checkbox.Label>
        </Checkbox.Root>
      </VStack>

      <VStack
        align="stretch"
        gap={3}
        p={4}
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        borderRadius="md"
      >
        <HStack justify="space-between" align="center" gap={3}>
          <Text fontWeight="semibold" color="gray.200">
            Términos del servicio
          </Text>

          <ChakraLink
            as={NextLink}
            href="/terminos"
            target="_blank"
            rel="noopener noreferrer"
            color="blue.300"
            fontSize="sm"
            textDecoration="underline"
          >
            Leer
          </ChakraLink>
        </HStack>

        <Checkbox.Root
          checked={acceptedTerms}
          onCheckedChange={(e) => setAcceptedTerms(!!e.checked)}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>
            He leído y acepto los términos del servicio
          </Checkbox.Label>
        </Checkbox.Root>
      </VStack>

      <Button
        colorPalette="blue"
        disabled={!bothChecked}
        loading={isPending}
        onClick={handleAccept}
      >
        Aceptar y continuar
      </Button>
    </VStack>
  );
}
