"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Field,
  Input,
  HStack,
  Grid,
  Switch,
  createListCollection,
  Select,
  Portal,
  Text,
} from "@chakra-ui/react";
import { toast } from "sonner";

import { adminUserUpdateSchema } from "../schemas/admin-user.schema";
import type { UserRow, UpdateUserInput } from "../api/admin-users.queries";

const ROLE_OPTIONS = createListCollection({
  items: [
    { value: "client", label: "Cliente" },
    { value: "checker", label: "Checker" },
    { value: "admin", label: "Admin" },
  ],
});

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
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
          <Field.Root required invalid={!!errors.fullName}>
            <Field.Label color="brand.muted">Nombre completo</Field.Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
            {errors.phone && <Field.ErrorText>{errors.phone}</Field.ErrorText>}
          </Field.Root>

          <Field.Root invalid={!!errors.cedula}>
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

          <Field.Root>
            <Field.Label color="brand.muted">Rol</Field.Label>
            <Select.Root
              collection={ROLE_OPTIONS}
              value={[role]}
              onValueChange={({ value }) => setRole(value[0] ?? "")}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Selecciona un rol" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {ROLE_OPTIONS.items.map((opt) => (
                      <Select.Item item={opt} key={opt.value}>
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
            <Field.Label color="brand.muted">Correo</Field.Label>
            <Input value={user.email} disabled {...inputStyles} />
          </Field.Root>

          <Field.Root>
            <HStack justify="space-between" align="center" h="full" py={1}>
              <Field.Label color="brand.muted" mb={0}>
                Activo
              </Field.Label>
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
            Guardar
          </Button>
        </HStack>
      </form>
    </Box>
  );
}
