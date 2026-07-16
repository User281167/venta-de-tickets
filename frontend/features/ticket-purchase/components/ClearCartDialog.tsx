"use client";

import {
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
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconAlertTriangle } from "@tabler/icons-react";

interface ClearCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ClearCartDialog({
  open,
  onOpenChange,
  onConfirm,
}: ClearCartDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
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
              Vaciar carrito
            </DialogTitle>
            <DialogCloseTrigger
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
            />
          </DialogHeader>

          <DialogBody>
            <VStack
              align="start"
              gap={3}
              p={4}
              borderRadius="xl"
              bg="rgba(239,68,68,0.1)"
              border="1px solid rgba(239,68,68,0.25)"
            >
              <IconAlertTriangle size={28} color="#ef4444" />
              <Text color="red.300" fontSize="sm" fontWeight="medium" lineHeight="1.6">
                Se eliminarán todas las entradas seleccionadas. Esta acción no
                se puede deshacer.
              </Text>
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
              colorPalette="red"
              onClick={handleConfirm}
              borderRadius="xl"
            >
              Vaciar carrito
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
