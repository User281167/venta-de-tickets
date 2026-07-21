"use client";

import {
  Box,
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { IconMail, IconMessage } from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ConfirmationSentModal({ open, onClose }: Props) {
  const reduced = useReducedMotion();

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="center"
      size="md"
    >
      <DialogBackdrop bg="rgba(2,4,20,0.85)" backdropFilter="blur(6px)" />

      <DialogPositioner>
        <DialogContent
          bg="brand.panel"
          color="brand.light"
          border="1px solid rgba(0,229,255,0.25)"
          borderRadius="2xl"
          maxW="440px"
          w="full"
          mx={4}
          asChild
        >
          <motion.div
            initial={reduced ? {} : { opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="3px"
              bg="linear-gradient(90deg, #ff0f7b, #00e5ff)"
              borderTopRadius="2xl"
            />

            <DialogHeader pt={6}>
              <Stack gap={2} align="center" textAlign="center" w="full">
                <HStack gap={2} color="brand.cyan">
                  <IconMail size={28} aria-hidden />
                </HStack>

                <DialogTitle color="white" fontSize="xl" fontWeight="bold">
                  Confirmación enviada
                </DialogTitle>
              </Stack>
            </DialogHeader>

            <DialogBody>
              <Stack gap={4} align="center" textAlign="center">
                <Text color="brand.light" fontSize="md" lineHeight="1.5">
                  Se envió un link al comprador para que autorice el ingreso.
                </Text>

                <Stack
                  gap={2}
                  p={4}
                  borderRadius="xl"
                  bg="rgba(0,0,0,0.3)"
                  border="1px solid rgba(255,255,255,0.08)"
                  w="full"
                >
                  <HStack gap={3} color="brand.light">
                    <Box color="brand.cyan">
                      <IconMail size={18} aria-hidden />
                    </Box>
                    <Text fontSize="sm" textAlign="left">
                      Revisa el correo electrónico asociado a la cuenta del
                      comprador.
                    </Text>
                  </HStack>

                  <HStack gap={3} color="brand.light">
                    <Box color="brand.teal">
                      <IconMessage size={18} aria-hidden />
                    </Box>
                    <Text fontSize="sm" textAlign="left">
                      También se intentó enviar por WhatsApp al número
                      registrado.
                    </Text>
                  </HStack>
                </Stack>

                <Text color="brand.muted" fontSize="xs">
                  Vuelve a escanear el QR cuando el comprador haya confirmado
                  para permitir el ingreso.
                </Text>
              </Stack>
            </DialogBody>

            <DialogFooter>
              <Button
                w="full"
                bg="brand.cyan"
                color="brand.dark"
                fontWeight="bold"
                _hover={{ bg: "#00cfe6" }}
                onClick={onClose}
              >
                Entendido
              </Button>
            </DialogFooter>

            <DialogCloseTrigger
              color="brand.muted"
              _hover={{ color: "white" }}
            />
          </motion.div>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
