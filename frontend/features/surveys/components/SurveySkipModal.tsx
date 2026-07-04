"use client";

import { Box, Button, Center, HStack, Text, VStack } from "@chakra-ui/react";
import { IconPlayerSkipForward, IconX } from "@tabler/icons-react";

type SurveySkipModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export function SurveySkipModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: SurveySkipModalProps) {
  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(48, 56, 65, 0.55)"
      backdropFilter="blur(4px)"
      zIndex="modal"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={onClose}
    >
      <Box
        maxW="sm"
        w="full"
        bg="white"
        borderRadius="2xl"
        boxShadow="2xl"
        onClick={(e) => e.stopPropagation()}
        overflow="hidden"
      >
        <Box p={6} pb={4}>
          <VStack gap={3} textAlign="center">
            <Center w={14} h={14} bg="#F0F7F7" borderRadius="full">
              <IconPlayerSkipForward size={28} color="#76ABAE" />
            </Center>

            <Text fontSize="lg" fontWeight="bold" color="#303841">
              ¿Saltar encuesta?
            </Text>

            <Text fontSize="sm" color="gray.500" lineHeight="tall">
              Puedes completar la encuesta después desde tu perfil. Tus datos
              nos ayudan a mejorar tu experiencia en La Convención 2026.
            </Text>
          </VStack>
        </Box>

        <Box px={6} pb={5}>
          <VStack gap={2.5}>
            <Button
              onClick={onConfirm}
              w="full"
              size="md"
              colorPalette="teal"
              loading={isLoading}
            >
              <HStack gap={2}>
                <IconPlayerSkipForward size={16} />
                <Text>Sí, saltar encuesta</Text>
              </HStack>
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              w="full"
              size="md"
              color="gray.600"
              borderColor="gray.200"
              _hover={{ bg: "gray.50" }}
            >
              <HStack gap={2}>
                <IconX size={16} />
                <Text>Seguir respondiendo</Text>
              </HStack>
            </Button>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
