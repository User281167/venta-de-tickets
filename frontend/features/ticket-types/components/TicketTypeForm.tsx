"use client";

import { useState, useEffect } from "react";

import {
  Box,
  Button,
  Field,
  Grid,
  HStack,
  Input,
  Switch,
  Textarea,
  Text,
} from "@chakra-ui/react";
import { toast } from "sonner";

import {
  createTicketTypeSchema,
  updateTicketTypeSchema,
  AdminTicketType,
  CreateTicketTypeInput,
  UpdateTicketTypeInput,
} from "../schemas/ticket-types.schema";
import {
  formatZodErrors,
  FieldErrors,
} from "../schemas/ticket-types.validator";

interface TicketTypeFormProps {
  ticketType?: AdminTicketType | null;
  onCreate?: (data: CreateTicketTypeInput) => Promise<void>;
  onUpdate?: (id: string, data: UpdateTicketTypeInput) => Promise<void>;
  onCancel: () => void;
}

const num = (v: unknown) => (v != null ? Number(v) : 0);

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

export function TicketTypeForm({
  ticketType,
  onCreate,
  onUpdate,
  onCancel,
}: TicketTypeFormProps) {
  const isEditing = !!ticketType;
  const [name, setName] = useState(ticketType?.name ?? "");
  const [description, setDescription] = useState(ticketType?.description ?? "");
  const [price, setPrice] = useState<number>(num(ticketType?.price));
  const [quantityTotal, setQuantityTotal] = useState<number>(
    num(ticketType?.quantityTotal),
  );
  const [maxPerUser, setMaxPerUser] = useState(ticketType?.maxPerUser ?? null);
  const [saleEndsAt, setSaleEndsAt] = useState(ticketType?.saleEndsAt ?? "");
  const [isActive, setIsActive] = useState(ticketType?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (ticketType) {
      setName(ticketType.name);
      setDescription(ticketType.description ?? "");
      setPrice(num(ticketType.price));
      setQuantityTotal(num(ticketType.quantityTotal));
      setMaxPerUser(ticketType.maxPerUser);
      setSaleEndsAt(ticketType.saleEndsAt ?? "");
      setIsActive(ticketType.isActive);
    }
  }, [ticketType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (isEditing && ticketType && onUpdate) {
      const payload = {
        name: name || undefined,
        description: description || undefined,
        price: price || undefined,
        quantityTotal: quantityTotal || undefined,
        maxPerUser: maxPerUser ?? undefined,
        saleEndsAt: saleEndsAt || null,
        isActive,
      };
      const parsed = updateTicketTypeSchema.safeParse(payload);

      if (!parsed.success) {
        setErrors(formatZodErrors(parsed.error));
        return;
      }

      if (
        parsed.data.quantityTotal != null &&
        parsed.data.quantityTotal < ticketType.quantitySold
      ) {
        setErrors({
          quantityTotal: `No puede ser menor a las vendidas (${ticketType.quantitySold})`,
        });
        return;
      }

      setSaving(true);

      try {
        await onUpdate(ticketType.id, parsed.data);
        toast.success("Tipo de entrada actualizado");
        onCancel();
      } catch (err) {
        toast.error("Error al actualizar", {
          description: (err as Error).message,
        });
      } finally {
        setSaving(false);
      }
    } else if (onCreate) {
      const payload = {
        name,
        description: description || undefined,
        price,
        quantityTotal,
        maxPerUser: maxPerUser ?? undefined,
        saleEndsAt: saleEndsAt || undefined,
      };
      const parsed = createTicketTypeSchema.safeParse(payload);

      if (!parsed.success) {
        setErrors(formatZodErrors(parsed.error));
        return;
      }

      setSaving(true);

      try {
        await onCreate(parsed.data);
        toast.success("Tipo de entrada creado");
        onCancel();
      } catch (err) {
        toast.error("Error al crear", {
          description: (err as Error).message,
        });
      } finally {
        setSaving(false);
      }
    }
  }

  return (
    <Box asChild>
      <form onSubmit={handleSubmit} noValidate>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
          <Field.Root required invalid={!!errors.name}>
            <Field.Label color="brand.muted">Nombre</Field.Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: General"
              {...inputStyles}
            />
            {errors.name && <Field.ErrorText>{errors.name}</Field.ErrorText>}
          </Field.Root>

          <Field.Root>
            <Field.Label color="brand.muted">Máx. por persona</Field.Label>
            <Input
              type="number"
              min={1}
              step={1}
              value={maxPerUser ?? ""}
              onChange={(e) =>
                setMaxPerUser(e.target.value ? Number(e.target.value) : null)
              }
              placeholder="Sin límite"
              {...inputStyles}
            />
          </Field.Root>

          <Field.Root gridColumn={{ md: "span 2" }}>
            <Field.Label color="brand.muted">Descripción</Field.Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
              {...inputStyles}
              minH="80px"
            />
          </Field.Root>

          <Field.Root required invalid={!!errors.price}>
            <Field.Label color="brand.muted">Precio (COP)</Field.Label>
            <Input
              type="number"
              min={1}
              step={100}
              value={price || ""}
              onChange={(e) =>
                setPrice(e.target.value ? Number(e.target.value) : 0)
              }
              placeholder="Ej: 120000"
              {...inputStyles}
            />
            {errors.price && <Field.ErrorText>{errors.price}</Field.ErrorText>}
          </Field.Root>

          <Field.Root required invalid={!!errors.quantityTotal}>
            <Field.Label color="brand.muted">Cantidad total</Field.Label>
            <Input
              type="number"
              min={1}
              step={1}
              value={quantityTotal || ""}
              onChange={(e) =>
                setQuantityTotal(e.target.value ? Number(e.target.value) : 0)
              }
              placeholder="Ej: 500"
              {...inputStyles}
            />
            {errors.quantityTotal && (
              <Field.ErrorText>{errors.quantityTotal}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root>
            <Field.Label color="brand.muted">Venta hasta</Field.Label>
            <Input
              type="date"
              value={saleEndsAt ?? ""}
              onChange={(e) => setSaleEndsAt(e.target.value)}
              {...inputStyles}
            />
          </Field.Root>

          {isEditing && (
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
          )}
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
            _hover={{ color: "black" }}
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
            {isEditing ? "Actualizar" : "Crear"}
          </Button>
        </HStack>
      </form>
    </Box>
  );
}
