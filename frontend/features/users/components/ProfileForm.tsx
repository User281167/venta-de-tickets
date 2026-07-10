"use client";

import {
  Box,
  Button,
  Field,
  Heading,
  HStack,
  Input,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { toast } from "sonner";
import { useMe, useUpdateMe } from "../hooks/useProfile";
import type { UpdateUserInput } from "../schemas/users.schema";
import { updateUserSchema } from "../schemas/users.schema";
import { ApiError } from "../api/users.client";

export function ProfileForm() {
  const { data, isLoading } = useMe();
  const { mutate: doUpdate, isPending } = useUpdateMe();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateUserInput>({
    fullName: "",
    phone: "",
    cedula: "",
    address: "",
    dateOfBirth: "",
  });
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <Box maxW="md" mx="auto" mt={10} p={6}>
        <VStack gap={6} align="stretch">
          <Skeleton height="28px" width="120px" />
          <Skeleton height="40px" width="full" />
          <Skeleton height="40px" width="full" />
          <Skeleton height="40px" width="full" />
          <Skeleton height="36px" width="100px" />
        </VStack>
      </Box>
    );
  }

  const { user, consentStatus } = data;

  const startEdit = () => {
    setForm({
      fullName: user.fullName ?? "",
      phone: user.phone ?? "",
      cedula: user.cedula ?? "",
      address: user.address ?? "",
      dateOfBirth: user.dateOfBirth ?? "",
    });
    setError(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError(null);
  };

  const saveEdit = () => {
    const parsed = updateUserSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(", "));
      toast.error("Error de validación", {
        description: parsed.error.issues.map((i) => i.message).join(", "),
      });
      return;
    }

    setError(null);
    doUpdate(parsed.data, {
      onSuccess: () => {
        setEditing(false);
        toast.success("Información actualizada", {
          description: "Tus datos se han guardado correctamente",
        });
      },
      onError: (err: Error) => {
        const description = err instanceof ApiError
          ? `${err.message} (${err.code})`
          : err.message || "No se pudo guardar la información";
        toast.error("Error al actualizar", { description });
      },
    });
  };

  return (
    <Box maxW="md" mx="auto">
      <VStack gap={6} align="stretch">
        <Heading as="h1" size="lg">
          Mi cuenta
        </Heading>

        <Field.Root>
          <Field.Label>Correo electrónico</Field.Label>
          <Input value={user.email} disabled />
        </Field.Root>

        <Field.Root>
          <Field.Label>Cédula</Field.Label>
          <Input
            value={editing ? form.cedula : user.cedula ?? ""}
            disabled={!editing || !!user.cedula}
            onChange={(e) => setForm({ ...form, cedula: e.target.value })}
          />
          {editing && user.cedula && (
            <Text fontSize="xs" color="gray.500" mt={1}>
              La cédula no puede modificarse una vez establecida
            </Text>
          )}
        </Field.Root>

        <Field.Root>
          <Field.Label>Nombre completo</Field.Label>
          <Input
            value={editing ? form.fullName : user.fullName ?? ""}
            disabled={!editing}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Teléfono</Field.Label>
          <Input
            value={editing ? (form.phone ?? "") : user.phone ?? ""}
            disabled={!editing}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value || null })
            }
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Dirección</Field.Label>
          <Input
            value={editing ? (form.address ?? "") : user.address ?? ""}
            disabled={!editing}
            onChange={(e) => setForm({ ...form, address: e.target.value || null })}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Fecha de nacimiento</Field.Label>
          <Input
            type="date"
            value={editing ? form.dateOfBirth ?? "" : user.dateOfBirth ?? ""}
            disabled={!editing}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value || null })}
          />
        </Field.Root>

        {error && (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        )}

        {editing ? (
          <HStack gap={4}>
            <Button bg="brand.violet" onClick={saveEdit} loading={isPending}>
              Guardar
            </Button>

            <Button variant="outline" color="white" onClick={cancelEdit}>
              Cancelar
            </Button>
          </HStack>
        ) : (
          <Button bg="brand.violet" onClick={startEdit}>
            Editar
          </Button>
        )}

        {consentStatus.acceptedAt && (
          <Box pt={4} borderTop="1px" borderColor="gray.200">
            <Text fontSize="sm" color="gray.500">
              Consentimiento de privacidad aceptado el{" "}
              {new Date(consentStatus.acceptedAt).toLocaleDateString("es-CO")}
            </Text>

            <Text fontSize="xs" color="gray.400">
              Versión: {consentStatus.policyVersion}
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
