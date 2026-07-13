"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Field,
  Input,
  HStack,
  VStack,
  Switch,
  createListCollection,
  Select,
  Portal,
} from "@chakra-ui/react";
import { toast } from "sonner";

import { adminUserUpdateSchema } from "../schemas/admin-user.schema";
import type { UserRow, UpdateUserInput } from "../api/admin-users.queries";

const ROLE_OPTIONS = createListCollection({
  items: [
    { value: "cliente", label: "cliente" },
    { value: "checker", label: "checker" },
    { value: "admin", label: "admin" },
  ],
});

interface Props {
  user: UserRow;
  onSave: (id: string, data: UpdateUserInput) => Promise<void>;
  onCancel: () => void;
}

export function UserEditForm({ user, onSave, onCancel }: Props) {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [cedula, setCedula] = useState(user.cedula ?? "");
  const [role, setRole] = useState(user.role ?? "client");
  const [isActive, setIsActive] = useState(user.isActive);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFullName(user.fullName);
    setPhone(user.phone ?? "");
    setCedula(user.cedula ?? "");
    setRole(user.role ?? "client");
    setIsActive(user.isActive);
  }, [user]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});

      const payload: UpdateUserInput = {};

      if (fullName !== user.fullName) payload.fullName = fullName;
      if (phone !== (user.phone ?? "")) payload.phone = phone || null;
      if (cedula !== (user.cedula ?? "")) payload.cedula = cedula || undefined;
      if (role !== user.role) payload.role = role as UpdateUserInput["role"];
      if (isActive !== user.isActive) payload.isActive = isActive;

      const parsed = adminUserUpdateSchema.safeParse(payload);

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
        await onSave(user.id, parsed.data);
        toast.success("Usuario actualizado");
        onCancel();
      } catch (err) {
        toast.error("Error al actualizar", {
          description: (err as Error).message,
        });
      } finally {
        setSaving(false);
      }
    },
    [fullName, phone, cedula, role, isActive],
  );

  return (
    <Box asChild>
      <form onSubmit={handleSubmit} noValidate>
        <VStack gap={4} align="stretch">
          <Field.Root required invalid={!!errors.fullName}>
            <Field.Label>Nombre completo</Field.Label>

            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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

            {errors.phone && <Field.ErrorText>{errors.phone}</Field.ErrorText>}
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

          <Field.Root>
            <Field.Label>Rol</Field.Label>

            <Select.Root
              collection={ROLE_OPTIONS}
              defaultValue={[ROLE_OPTIONS.items[0].value]}
              value={[role]}
              onValueChange={({ value }) => setRole(value[0] ?? "")}
            >
              <Select.HiddenSelect />

              <Select.Control>
                <Select.Trigger status-trigger="status-trigger">
                  <Select.ValueText placeholder="Estado" />
                </Select.Trigger>

                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>

              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {ROLE_OPTIONS.items.map((opt) => (
                      <Select.Item item={opt} key={opt.value} color="black">
                        {opt.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Field.Root>

          <Field.Root>
            <HStack justify="space-between">
              <Field.Label>Activo</Field.Label>

              <Switch.Root
                checked={isActive}
                onCheckedChange={(e) => setIsActive(e.checked)}
              >
                <Switch.HiddenInput />

                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </HStack>
          </Field.Root>

          <Field.Root>
            <Field.Label>Correo</Field.Label>
            <Input value={user.email} disabled />
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
              Guardar
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}
