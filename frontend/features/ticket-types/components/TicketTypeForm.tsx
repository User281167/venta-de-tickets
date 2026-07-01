"use client";

import { useState, useEffect } from "react";
import type { ZodError } from "zod";
import {
  Box,
  Button,
  Field,
  Input,
  Textarea,
  VStack,
  HStack,
  Switch,
} from "@chakra-ui/react";
import { toast } from "sonner";
import {
  createTicketTypeSchema,
  updateTicketTypeSchema,
} from "../schemas/ticket-types.schema";
import type {
  AdminTicketType,
  CreateTicketTypeInput,
  UpdateTicketTypeInput,
} from "../schemas/ticket-types.schema";

interface TicketTypeFormProps {
  ticketType?: AdminTicketType | null;
  eventId: string;
  onCreate?: (data: CreateTicketTypeInput) => Promise<void>;
  onUpdate?: (id: string, data: UpdateTicketTypeInput) => Promise<void>;
  onCancel: () => void;
}

interface FieldErrors {
  name?: string;
  price?: string;
  quantityTotal?: string;
}

const num = (v: unknown) => (v != null ? Number(v) : 0);

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
        <VStack gap={4} align="stretch">
          <Field.Root required invalid={!!errors.name}>
            <Field.Label>Nombre</Field.Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: General"
            />
            {errors.name && <Field.ErrorText>{errors.name}</Field.ErrorText>}
          </Field.Root>

          <Field.Root>
            <Field.Label>Descripción</Field.Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
            />
          </Field.Root>

          <Field.Root required invalid={!!errors.price}>
            <Field.Label>Precio (COP)</Field.Label>
            <Input
              type="number"
              min={1}
              step={100}
              value={price || ""}
              onChange={(e) =>
                setPrice(e.target.value ? Number(e.target.value) : 0)
              }
            />
            {errors.price && <Field.ErrorText>{errors.price}</Field.ErrorText>}
          </Field.Root>

          <Field.Root required invalid={!!errors.quantityTotal}>
            <Field.Label>Cantidad total</Field.Label>
            <Input
              type="number"
              min={1}
              step={1}
              value={quantityTotal || ""}
              onChange={(e) =>
                setQuantityTotal(e.target.value ? Number(e.target.value) : 0)
              }
            />
            {errors.quantityTotal && (
              <Field.ErrorText>{errors.quantityTotal}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root>
            <Field.Label>Máx. por persona</Field.Label>
            <Input
              type="number"
              min={1}
              step={1}
              value={maxPerUser ?? ""}
              onChange={(e) =>
                setMaxPerUser(e.target.value ? Number(e.target.value) : null)
              }
              placeholder="Sin límite"
            />
          </Field.Root>

          {isEditing && (
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
          )}

          <HStack gap={3} justify="flex-end" pt={2}>
            <Button variant="outline" onClick={onCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" colorPalette="teal" loading={saving}>
              {isEditing ? "Actualizar" : "Crear"}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}

function formatZodErrors(error: ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0] as keyof FieldErrors;

    if (field && !fieldErrors[field]) {
      if (field === "name") fieldErrors.name = "El nombre es obligatorio";
      else if (field === "price")
        fieldErrors.price = "El precio debe ser mayor a 0";
      else if (field === "quantityTotal")
        fieldErrors.quantityTotal = "La cantidad debe ser mayor a 0";
    }
  }

  return fieldErrors;
}
