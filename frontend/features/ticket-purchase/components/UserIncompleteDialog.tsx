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
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconId, IconUser, IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface UserIncompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingFields: string[];
}

const FIELD_META: Record<string, { label: string; icon: typeof IconUser }> = {
  cedula: { label: "Cédula", icon: IconId },
  fullName: { label: "Nombre completo", icon: IconUser },
};

export function UserIncompleteDialog({
  open,
  onOpenChange,
  missingFields,
}: UserIncompleteDialogProps) {
  const router = useRouter();

  const handleGoToProfile = () => {
    onOpenChange(false);
    router.push("/mi-cuenta/perfil");
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      size={{ base: "xs", md: "sm" }}
    >
      <DialogBackdrop bg="rgba(0,0,0,0.75)" backdropFilter="blur(4px)" />
      <DialogPositioner>
        <DialogContent
          bg="brand.panel"
          border="1px solid rgba(255,255,255,0.12)"
          borderRadius="2xl"
          boxShadow="0 24px 80px rgba(0,0,0,0.7)"
          color="white"
        >
          <DialogHeader>
            <DialogTitle color="white" fontSize="xl">
              Completa tu perfil
            </DialogTitle>
            <DialogCloseTrigger
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
            />
          </DialogHeader>

          <DialogBody>
            <VStack align="stretch" gap={4}>
              <HStack
                gap={2}
                p={3}
                borderRadius="xl"
                bg="rgba(245,158,11,0.08)"
                border="1px solid rgba(245,158,11,0.25)"
              >
                <IconAlertCircle size={20} color="#f59e0b" />
                <Text color="amber.200" fontSize="sm" lineHeight="1.5">
                  Para procesar el pago necesitamos los siguientes datos.
                </Text>
              </HStack>

              <VStack align="stretch" gap={2}>
                {missingFields.map((field) => {
                  const meta = FIELD_META[field];
                  if (!meta) return null;
                  const Icon = meta.icon;
                  return (
                    <HStack
                      key={field}
                      gap={3}
                      p={3}
                      borderRadius="lg"
                      bg="rgba(255,255,255,0.03)"
                      border="1px solid rgba(255,255,255,0.08)"
                    >
                      <Box
                        p={2}
                        borderRadius="md"
                        bg="rgba(0,229,255,0.1)"
                      >
                        <Icon size={18} color="#00e5ff" />
                      </Box>
                      <Text color="white" fontWeight="medium">
                        {meta.label}
                      </Text>
                    </HStack>
                  );
                })}
              </VStack>
            </VStack>
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              color="white"
              borderColor="rgba(255,255,255,0.16)"
              borderRadius="xl"
              _hover={{ bg: "rgba(255,255,255,0.06)" }}
            >
              Cancelar
            </Button>

            <Button
              bg="brand.cyan"
              color="brand.dark"
              fontWeight="black"
              borderRadius="xl"
              onClick={handleGoToProfile}
              _hover={{ opacity: 0.9, transform: "translateY(-1px)" }}
              transition="all 0.2s ease"
            >
              Completar perfil
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
