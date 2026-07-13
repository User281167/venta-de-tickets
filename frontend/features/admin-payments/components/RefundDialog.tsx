"use client";

import {
  Button,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  Field,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { useProcessRefund } from "../api/admin-payments.queries";
import { refundFormSchema } from "../schemas/admin-payments.schema";
import { toast } from "sonner";

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
    <DialogRoot open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Procesar reembolso</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody spaceY={4}>
          <Text fontSize="sm" color="red.600" fontWeight="medium">
            Se cancelarán todos los tickets asociados a este pago. Esta acción
            no se puede deshacer.
          </Text>

          <Field.Root invalid={!!errors.reason}>
            <Field.Label>Razón del reembolso</Field.Label>

            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describa el motivo del reembolso (mín. 10 caracteres)"
            />

            {errors.reason && (
              <Field.ErrorText>{errors.reason}</Field.ErrorText>
            )}

          </Field.Root>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>

          <Button
            colorPalette="red"
            onClick={handleSubmit}
            loading={mutation.isPending}
          >
            Procesar reembolso
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
