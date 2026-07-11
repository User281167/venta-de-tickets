"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Field,
  Input,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { toast } from "sonner";

import { adminUserCreateSchema } from "../schemas/admin-user.schema";
import type { CreateUserInput } from "../api/admin-users.queries";

interface Props {
  onSave: (data: CreateUserInput) => Promise<void>;
  onCancel: () => void;
}

export function UserCreateForm({ onSave, onCancel }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [cedula, setCedula] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload: CreateUserInput = {
      email,
      password,
      fullName,
      phone: phone || null,
      ...(cedula ? { cedula } : {}),
    };

    const parsed = adminUserCreateSchema.safeParse(payload);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};

      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "_");

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    setSaving(true);

    try {
      await onSave(parsed.data);
      toast.success("Usuario creado");
      onCancel();
    } catch (err) {
      toast.error("Error al crear usuario", {
        description: (err as Error).message,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box asChild>
      <form onSubmit={handleSubmit} noValidate>
        <VStack gap={4} align="stretch">
          <Field.Root required invalid={!!errors.email}>
            <Field.Label>Correo electrónico</Field.Label>

            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
            />

            {errors.email && (
              <Field.ErrorText>{errors.email}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root required invalid={!!errors.password}>
            <Field.Label>Contraseña</Field.Label>

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />

            {errors.password && (
              <Field.ErrorText>{errors.password}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root required invalid={!!errors.fullName}>
            <Field.Label>Nombre completo</Field.Label>

            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre y apellido"
            />

            {errors.fullName && (
              <Field.ErrorText>{errors.fullName}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root>
            <Field.Label>Teléfono</Field.Label>

            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 300 000 0000"
            />

            {errors.phone && (
              <Field.ErrorText>{errors.phone}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.cedula}>
            <Field.Label>Cédula</Field.Label>

            <Input
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="1234567890"
            />

            {errors.cedula && (
              <Field.ErrorText>{errors.cedula}</Field.ErrorText>
            )}
          </Field.Root>

          <HStack gap={3} justify="flex-end" pt={2}>
            <Button
              variant="outline"
              color="white"
              _hover={{ color: "black" }}
              onClick={onCancel}
              disabled={saving}
            >
              Cancelar
            </Button>

            <Button type="submit" colorPalette="teal" loading={saving}>
              Crear usuario
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}
