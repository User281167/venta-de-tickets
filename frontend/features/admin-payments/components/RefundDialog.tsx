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
  Field,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { useProcessRefund } from "../api/admin-payments.queries";
import { refundFormSchema } from "../schemas/admin-payments.schema";
import { toast } from "sonner";
import { IconAlertTriangle } from "@tabler/icons-react";

interface RefundDialogProps {
  paymentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RefundDialog({
  paymentId,
  open,
  onOpenChange,
}: RefundDialogProps) {
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mutation = useProcessRefund(paymentId);

  const reset = useCallback(() => {
    setReason("");
    setErrors({});
  }, []);

  const handleSubmit = useCallback(async () => {
    const parsed = refundFormSchema.safeParse({ reason });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};

      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }

      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      await mutation.mutateAsync(parsed.data);
      toast.success("Reembolso procesado exitosamente");
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Error al procesar el reembolso");
    }
  }, [reason, mutation, reset, onOpenChange]);

  const handleCancel = useCallback(() => {
    reset();
    onOpenChange(false);
  }, [reset, onOpenChange]);

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      size={{ base: "xs", md: "md" }}
      scrollBehavior="inside"
    >
      <DialogBackdrop bg="rgba(0,0,0,0.75)" backdropFilter="blur(4px)" />
      <DialogPositioner>
        <DialogContent
          bg="brand.panel"
          border="1px solid rgba(255,255,255,0.12)"
          borderRadius="2xl"
          boxShadow="0 24px 80px rgba(0,0,0,0.7)"
          color="white"
          maxH="90vh"
        >
          <DialogHeader>
            <DialogTitle color="white" fontSize="xl">
              Procesar reembolso
            </DialogTitle>
            <DialogCloseTrigger
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
            />
          </DialogHeader>

          <DialogBody spaceY={5}>
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
                Se cancelarán todos los tickets asociados a este pago. Esta acción
                no se puede deshacer.
              </Text>
            </VStack>

            <Field.Root invalid={!!errors.reason}>
              <Field.Label color="brand.muted" fontSize="sm">
                Razón del reembolso
              </Field.Label>

              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describa el motivo del reembolso (mín. 10 caracteres)"
                bg="rgba(255,255,255,0.04)"
                border="1px solid rgba(255,255,255,0.12)"
                borderRadius="xl"
                color="white"
                _placeholder={{ color: "brand.muted" }}
                _hover={{ borderColor: "rgba(255,255,255,0.2)" }}
                _focus={{
                  borderColor: "brand.cyan",
                  boxShadow: "0 0 0 1px brand.cyan",
                }}
                minH="120px"
              />

              {errors.reason && (
                <Field.ErrorText color="red.400">{errors.reason}</Field.ErrorText>
              )}
            </Field.Root>
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={mutation.isPending}
              color="white"
              borderColor="rgba(255,255,255,0.16)"
              borderRadius="xl"
              _hover={{ bg: "rgba(255,255,255,0.06)" }}
            >
              Cancelar
            </Button>

            <Button
              colorPalette="red"
              onClick={handleSubmit}
              loading={mutation.isPending}
              borderRadius="xl"
            >
              Procesar reembolso
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
