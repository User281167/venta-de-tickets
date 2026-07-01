"use client";

import { useState, useEffect } from "react";
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
import { toaster } from "@/components/ui/toaster";
import type { AdminTicketType, CreateTicketTypeInput, UpdateTicketTypeInput } from "../schemas/ticket-types.schema";

interface TicketTypeFormProps {
  ticketType?: AdminTicketType | null;
  eventId: string;
  onCreate?: (data: CreateTicketTypeInput) => Promise<void>;
  onUpdate?: (id: string, data: UpdateTicketTypeInput) => Promise<void>;
  onCancel: () => void;
}

export function TicketTypeForm({
  ticketType,
  onCreate,
  onUpdate,
  onCancel,
}: TicketTypeFormProps) {
  const isEditing = !!ticketType;
  const [name, setName] = useState(ticketType?.name ?? "");
  const [description, setDescription] = useState(ticketType?.description ?? "");
  const [price, setPrice] = useState(ticketType?.price ?? 0);
  const [quantityTotal, setQuantityTotal] = useState(ticketType?.quantityTotal ?? 0);
  const [maxPerUser, setMaxPerUser] = useState(ticketType?.maxPerUser ?? null);
  const [isActive, setIsActive] = useState(ticketType?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ticketType) {
      setName(ticketType.name);
      setDescription(ticketType.description ?? "");
      setPrice(ticketType.price);
      setQuantityTotal(ticketType.quantityTotal);
      setMaxPerUser(ticketType.maxPerUser);
      setIsActive(ticketType.isActive);
    }
  }, [ticketType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditing && ticketType && onUpdate) {
        await onUpdate(ticketType.id, {
          name: name || undefined,
          description: description || undefined,
          price: price || undefined,
          quantityTotal: quantityTotal || undefined,
          maxPerUser: maxPerUser ?? undefined,
          isActive,
        });
        toaster.create({ title: "Tipo de entrada actualizado", type: "success" });
      } else if (onCreate) {
        await onCreate({
          name,
          description: description || undefined,
          price,
          quantityTotal,
          maxPerUser: maxPerUser ?? undefined,
        });
        toaster.create({ title: "Tipo de entrada creado", type: "success" });
      }

      onCancel();
    } catch (err) {
      toaster.create({
        title: "Error al guardar",
        description: (err as Error).message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack gap={4} align="stretch">
        <Field.Root required>
          <Field.Label>Nombre</Field.Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: General" required />
        </Field.Root>

        <Field.Root>
          <Field.Label>Descripción</Field.Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción opcional"
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>Precio (COP)</Field.Label>
          <Input
            type="number"
            min={0}
            step={100}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>Cantidad total</Field.Label>
          <Input
            type="number"
            min={1}
            step={1}
            value={quantityTotal}
            onChange={(e) => setQuantityTotal(Number(e.target.value))}
            required
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Máx. por persona</Field.Label>
          <Input
            type="number"
            min={1}
            step={1}
            value={maxPerUser ?? ""}
            onChange={(e) => setMaxPerUser(e.target.value ? Number(e.target.value) : null)}
            placeholder="Sin límite"
          />
        </Field.Root>

        {isEditing && (
          <Field.Root>
            <HStack justify="space-between">
              <Field.Label>Activo</Field.Label>
              <Switch.Root checked={isActive} onCheckedChange={(e) => setIsActive(e.checked)}>
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
    </Box>
  );
}
