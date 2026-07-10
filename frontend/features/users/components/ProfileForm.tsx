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
import { useMe, useUpdateMe } from "../hooks/useProfile";
import type { UpdateUserInput } from "../schemas/users.schema";
import { updateUserSchema } from "../schemas/users.schema";

export function ProfileForm() {
  const { data, isLoading } = useMe();
  const { mutate: doUpdate, isPending } = useUpdateMe();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateUserInput>({
    fullName: "",
    phone: "",
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
    setForm({ fullName: user.fullName ?? "", phone: user.phone ?? "" });
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
      return;
    }

    setError(null);
    doUpdate(parsed.data, {
      onSuccess: () => setEditing(false),
    });
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6}>
      <VStack gap={6} align="stretch">
        <Heading as="h1" size="lg">
          Mi cuenta
        </Heading>

        <Field.Root>
          <Field.Label>Correo electrónico</Field.Label>
          <Input value={user.email} disabled />
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
