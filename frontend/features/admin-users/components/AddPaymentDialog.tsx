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
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { AddPaymentDialogContent } from "./add-payment/AddPaymentDialogContent";
import { useAddPaymentForm } from "./add-payment/useAddPaymentForm";
import type { UserRow } from "../api/admin-users.queries";

interface AddPaymentDialogProps {
  user: UserRow | null;
  setUser: (user: UserRow | null) => void;
}

export function AddPaymentDialog({ user, setUser }: AddPaymentDialogProps) {
  const handleClose = () => setUser(null);

  const {
    activeTicketTypes,
    quantities,
    provider,
    total,
    hasSelection,
    isLoading,
    isPending,
    updateQuantity,
    setProvider,
    submit,
    cancel,
  } = useAddPaymentForm(user, handleClose);

  const handleSubmit = async () => {
    try {
      await submit();
      toast.success("Pago registrado exitosamente");
    } catch {
      toast.error("Error al registrar el pago");
    }
  };

  return (
    <DialogRoot
      open={!!user}
      onOpenChange={(e) => {
        if (!e.open) handleClose();
      }}
      size="lg"
    >
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent
          bg="brand.panel"
          color="brand.light"
          border="1px solid rgba(255,255,255,0.08)"
          borderRadius="2xl"
          maxW="680px"
          w="full"
          mx={4}
        >
          <DialogHeader>
            <Stack gap={0}>
              <DialogTitle color="white" fontSize="2xl">
                Registrar pago
              </DialogTitle>
              <Text color="brand.muted" fontSize="sm">
                {user?.fullName ?? ""} · {user?.email ?? ""}
              </Text>
            </Stack>
          </DialogHeader>

          <DialogBody>
            <AddPaymentDialogContent
              ticketTypes={activeTicketTypes}
              quantities={quantities}
              provider={provider}
              total={total}
              isLoading={isLoading}
              onQuantityChange={updateQuantity}
              onProviderChange={setProvider}
            />
          </DialogBody>

          <DialogFooter>
            <HStack gap={3} w="full">
              <Button
                variant="outline"
                color="white"
                borderColor="rgba(255,255,255,0.16)"
                borderRadius="xl"
                flex={1}
                onClick={cancel}
                disabled={isPending}
              >
                Cancelar
              </Button>

              <Button
                bg="brand.violet"
                color="white"
                fontWeight="bold"
                borderRadius="xl"
                flex={1}
                onClick={handleSubmit}
                loading={isPending}
                disabled={!hasSelection || isLoading}
                _hover={{ bg: "#6a2be2", transform: "translateY(-2px)" }}
                transition="all 0.2s ease"
              >
                Registrar pago
              </Button>
            </HStack>
          </DialogFooter>

          <DialogCloseTrigger color="brand.muted" />
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
