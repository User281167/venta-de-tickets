"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Field,
  Input,
  HStack,
  Grid,
  Text,
} from "@chakra-ui/react";
import { toast } from "sonner";

import { adminUserCreateSchema } from "../schemas/admin-user.schema";
import type { CreateUserInput } from "../api/admin-users.queries";

const inputStyles = {
  bg: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "xl",
  color: "white",
  _hover: { borderColor: "rgba(255,255,255,0.16)" },
  _focus: {
    borderColor: "brand.cyan",
    boxShadow: "0 0 12px rgba(0,229,255,0.2)",
  },
};

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
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
          <Field.Root required invalid={!!errors.email}>
            <Field.Label color="brand.muted">Correo electrónico</Field.Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              {...inputStyles}
            />
            {errors.email && (
              <Field.ErrorText>{errors.email}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root required invalid={!!errors.password}>
            <Field.Label color="brand.muted">Contraseña</Field.Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              {...inputStyles}
            />
            {errors.password && (
              <Field.ErrorText>{errors.password}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root required invalid={!!errors.fullName}>
            <Field.Label color="brand.muted">Nombre completo</Field.Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre y apellido"
              {...inputStyles}
            />
            {errors.fullName && (
              <Field.ErrorText>{errors.fullName}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root>
            <Field.Label color="brand.muted">Teléfono</Field.Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 300 000 0000"
              {...inputStyles}
            />
            {errors.phone && (
              <Field.ErrorText>{errors.phone}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root gridColumn={{ md: "span 2" }} invalid={!!errors.cedula}>
            <Field.Label color="brand.muted">Cédula</Field.Label>
            <Input
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="1234567890"
              {...inputStyles}
            />
            {errors.cedula && (
              <Field.ErrorText>{errors.cedula}</Field.ErrorText>
            )}
          </Field.Root>
        </Grid>

        {Object.keys(errors).length > 0 && (
          <Text color="red.400" fontSize="sm" mt={4}>
            Revisa los campos marcados.
          </Text>
        )}

        <HStack gap={3} justify="flex-end" pt={6}>
          <Button
            variant="outline"
            color="white"
            borderColor="rgba(255,255,255,0.16)"
            borderRadius="xl"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            bg="brand.violet"
            color="white"
            fontWeight="bold"
            borderRadius="xl"
            loading={saving}
            _hover={{ bg: "#6a2be2", transform: "translateY(-2px)" }}
            transition="all 0.2s ease"
          >
            Crear usuario
          </Button>
        </HStack>
      </form>
    </Box>
  );
}
