"use client";

import { useEffect, useState } from "react";
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
  Field,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconId,
  IconUser,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUpdateMe } from "@/features/users/hooks/useProfile";
import { ApiError } from "@/features/users/api/users.client";
import { updateUserSchema } from "@/features/users/schemas/users.schema";

interface UserIncompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingFields: string[];
  defaultCedula?: string | null;
  defaultFullName?: string | null;
}

export function UserIncompleteDialog({
  open,
  onOpenChange,
  missingFields,
  defaultCedula,
  defaultFullName,
}: UserIncompleteDialogProps) {
  const router = useRouter();
  const { mutate: doUpdate, isPending } = useUpdateMe();

  const needsCedula = missingFields.includes("cedula");
  const needsFullName = missingFields.includes("fullName");

  const [cedula, setCedula] = useState(defaultCedula ?? "");
  const [fullName, setFullName] = useState(defaultFullName ?? "");
  const [errors, setErrors] = useState<{ cedula?: string; fullName?: string }>(
    {},
  );

  useEffect(() => {
    if (open) {
      setCedula(defaultCedula ?? "");
      setFullName(defaultFullName ?? "");
      setErrors({});
    }
  }, [open, defaultCedula, defaultFullName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: { cedula?: string; fullName?: string } = {};

    if (needsCedula) payload.cedula = cedula.trim();
    if (needsFullName) payload.fullName = fullName.trim();

    const parsed = updateUserSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: { cedula?: string; fullName?: string } = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path[0];

        if (key === "cedula" || key === "fullName") {
          fieldErrors[key] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    doUpdate(parsed.data, {
      onSuccess: () => {
        toast.success("Datos guardados", {
          description: "Tu información se actualizó correctamente.",
        });

        onOpenChange(false);
      },
      onError: (err: Error) => {
        const description =
          err instanceof ApiError
            ? `${err.message} (${err.code})`
            : err.message || "No se pudo guardar la información";

        toast.error("Error al guardar", { description });
      },
    });
  };

  const handleBack = () => {
    onOpenChange(false);
    router.push("/entradas");
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => {
        if (!e.open && (needsCedula || needsFullName)) return;
        onOpenChange(e.open);
      }}
      placement="center"
      size={{ base: "xs", md: "sm" }}
      closeOnInteractOutside={false}
      closeOnEscape={false}
    >
      <DialogBackdrop bg="rgba(0,0,0,0.75)" backdropFilter="blur(4px)" />

      <DialogPositioner>
        <DialogContent
          as="form"
          onSubmit={handleSubmit}
          bg="brand.panel"
          border="1px solid rgba(255,255,255,0.12)"
          borderRadius="2xl"
          boxShadow="0 24px 80px rgba(0,0,0,0.7)"
          color="white"
        >
          <DialogHeader>
            <DialogTitle color="white" fontSize="xl">
              Completa tus datos
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
                  Para procesar el pago necesitamos tu nombre y cédula.
                </Text>
              </HStack>

              <VStack align="stretch" gap={4}>
                {needsFullName && (
                  <Field.Root invalid={!!errors.fullName}>
                    <Field.Label color="brand.muted">
                      <HStack gap={2}>
                        <IconUser size={16} color="#00e5ff" />

                        <Text>Nombre completo</Text>
                      </HStack>
                    </Field.Label>

                    <Input
                      autoFocus
                      placeholder="Tu nombre completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      bg="rgba(255,255,255,0.03)"
                      border="1px solid rgba(255,255,255,0.08)"
                      borderRadius="xl"
                      color="white"
                      _hover={{ borderColor: "rgba(255,255,255,0.16)" }}
                      _focus={{
                        borderColor: "brand.cyan",
                        boxShadow: "0 0 12px rgba(0,229,255,0.2)",
                      }}
                    />
                    {errors.fullName && (
                      <Field.ErrorText color="red.300">
                        {errors.fullName}
                      </Field.ErrorText>
                    )}
                  </Field.Root>
                )}

                {needsCedula && (
                  <Field.Root invalid={!!errors.cedula}>
                    <Field.Label color="brand.muted">
                      <HStack gap={2}>
                        <IconId size={16} color="#00e5ff" />
                        <Text>Cédula</Text>
                      </HStack>
                    </Field.Label>

                    <Input
                      inputMode="numeric"
                      placeholder="Número de cédula"
                      value={cedula}
                      onChange={(e) =>
                        setCedula(e.target.value.replace(/\D/g, ""))
                      }
                      bg="rgba(255,255,255,0.03)"
                      border="1px solid rgba(255,255,255,0.08)"
                      borderRadius="xl"
                      color="white"
                      _hover={{ borderColor: "rgba(255,255,255,0.16)" }}
                      _focus={{
                        borderColor: "utp.azul",
                        boxShadow: "0 0 12px rgba(0,229,255,0.2)",
                      }}
                    />
                    {errors.cedula && (
                      <Field.ErrorText color="red.300">
                        {errors.cedula}
                      </Field.ErrorText>
                    )}
                  </Field.Root>
                )}
              </VStack>
            </VStack>
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleBack}
              color="white"
              borderColor="rgba(255,255,255,0.16)"
              borderRadius="xl"
              _hover={{ bg: "rgba(255,255,255,0.06)" }}
            >
              <IconArrowLeft size={16} style={{ marginRight: 6 }} />
              Volver a entradas
            </Button>

            <Button
              type="submit"
              bg="utp.azul"
              color="brand.dark"
              fontWeight="black"
              borderRadius="xl"
              loading={isPending}
              _hover={{ opacity: 0.9, transform: "translateY(-1px)" }}
              transition="all 0.2s ease"
            >
              Guardar y continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
