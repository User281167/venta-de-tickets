"use client";

import { useState } from "react";
import { z } from "zod";
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
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { IconHeart } from "@tabler/icons-react";
import { toast } from "sonner";
import { useCreateDonation } from "../hooks/useDonaciones";
import { formatCurrency } from "@/shared/utils/formats";

export type DonationAccount = "LA_CONVENCION" | "BARRANQUEROS_UTP";

const formSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  amount: z
    .number({ message: "Ingresa un monto válido" })
    .int()
    .min(2000, "El monto mínimo es $2.000 COP"),
});

interface Props {
  account: DonationAccount;
  open: boolean;
  onClose: () => void;
  onSubmitting?: (submitting: boolean) => void;
}

export function DonationForm({ account, open, onClose, onSubmitting }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useCreateDonation();

  const accountLabel =
    account === "LA_CONVENCION" ? "La Convención" : "Barranqueros UTP";

  async function handleSubmit() {
    const parsed = formSchema.safeParse({
      fullName: fullName || undefined,
      email: email || undefined,
      amount: amount ? Number(amount) : undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};

      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    onSubmitting?.(true);

    mutation.mutate(
      {
        fullName: parsed.data.fullName || null,
        email: parsed.data.email || null,
        amountCents: parsed.data.amount,
        account,
        provider: "epayco",
        backUrl: `${window.location.origin}/donaciones/retorno`,
      },
      {
        onSuccess: (data) => {
          window.location.href = data.initPoint;
        },
        onError: (err) => {
          onSubmitting?.(false);
          const msg =
            err instanceof Error ? err.message : "Error al crear donación. Intenta de nuevo más tarde.";
          toast.error(msg);
        },
      },
    );
  }

  return (
    <DialogRoot open={open} onOpenChange={(e) => { if (!e.open) onClose(); }} placement="center" size="md">
      <DialogBackdrop bg="rgba(2,4,20,0.85)" backdropFilter="blur(6px)" />
      <DialogPositioner>
        <DialogContent bg="brand.panel" color="brand.light" border="1px solid" borderRadius="2xl" maxW="440px">
          <DialogHeader pt={6} m="auto">
            <Stack align="center" gap={2}>
              <IconHeart size={32} color="#ff0f7b" />

              <DialogTitle fontSize="xl" fontWeight="bold" textAlign="center">
                Donar a {accountLabel}
              </DialogTitle>

              <Text fontSize="sm" color="brand.muted" textAlign="center">
                Tu donación apoya {account === "LA_CONVENCION" ? "la Convención de Egresados" : "a Barranqueros UTP"}
              </Text>
            </Stack>
          </DialogHeader>

          <DialogBody>
            <Stack gap={4}>
              <Field.Root invalid={!!errors.fullName}>
                <Field.Label>Nombre (opcional)</Field.Label>

                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre"
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                />

                <Field.ErrorText>{errors.fullName}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.email}>
                <Field.Label>Correo (opcional)</Field.Label>

                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                />

                <Field.ErrorText>{errors.email}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.amount} required>
                <Field.Label>Monto</Field.Label>

                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50000"
                  type="number"
                  min="2000"
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                />

                <Field.HelperText>Mínimo $2.000 COP</Field.HelperText>
                <Field.ErrorText>{errors.amount}</Field.ErrorText>
              </Field.Root>
            </Stack>
          </DialogBody>

          <DialogFooter gap={2}>
            <Button
              variant="ghost"
              color="brand.muted"
              _hover={{ color: "black" }}
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSubmit}
              loading={mutation.isPending}
              bgGradient="linear(100deg, #ff0f7b, #7c3cff)"
              color="white"
              _hover={{ opacity: 0.9 }}
            >
              Donar {amount ? formatCurrency(Number(amount) * 100) : "0"} COP
            </Button>
          </DialogFooter>

          <DialogCloseTrigger color="brand.muted" _hover={{ color: "white" }} />
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
