"use client";

import { useState, useEffect } from "react";

import {
  Box,
  Button,
  Field,
  Grid,
  HStack,
  Input,
  Portal,
  Select,
  Switch,
  Textarea,
  Text,
  createListCollection,
} from "@chakra-ui/react";
import { toast } from "sonner";

import {
  createTicketTypeSchema,
  updateTicketTypeSchema,
  AdminTicketType,
  CreateTicketTypeInput,
  UpdateTicketTypeInput,
  TicketTypeZona,
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

function toIsoEndOfDay(value: string | null | undefined): string | null {
  if (!value) return null;
  // ya es ISO completo (la API devuelve con T)
  if (value.includes("T")) return value;
  // <input type="date"> produce YYYY-MM-DD -> fin de dia en UTC
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T23:59:59.000Z`;
  }
  return value;
}

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

const STATUS_OPTIONS = createListCollection({
  items: [
    { value: "enabled", label: "Activo (visible y comprable)" },
    { value: "disabled", label: "Inactivo (visible, no comprable)" },
    { value: "blocked", label: "Bloqueado (oculto al público)" },
  ],
});

const ZONA_OPTIONS = createListCollection({
  items: [
    { value: "__null__", label: "Sin zona" },
    { value: "vip", label: "VIP" },
    { value: "plata", label: "Plata" },
    { value: "bronce", label: "Bronce" },
  ],
});

const ZONA_VALUES: TicketTypeZona[] = ["vip", "plata", "bronce"];

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
  const [status, setStatus] = useState<"enabled" | "disabled" | "blocked">(
    ticketType?.status ?? "enabled",
  );
  const [onlyEgresados, setOnlyEgresados] = useState(
    ticketType?.onlyEgresados ?? false,
  );
  const [zona, setZona] = useState<TicketTypeZona | null>(
    ticketType?.zona ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (ticketType) {
      setName(ticketType.name);
      setDescription(ticketType.description ?? "");
      setPrice(num(ticketType.price));
      setQuantityTotal(num(ticketType.quantityTotal));
      setMaxPerUser(ticketType.maxPerUser);
      setSaleEndsAt(ticketType.saleEndsAt?.slice(0, 10) ?? "");
      setStatus(ticketType.status);
      setOnlyEgresados(ticketType.onlyEgresados);
      setZona(ticketType.zona);
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
        saleEndsAt: toIsoEndOfDay(saleEndsAt),
        status,
        onlyEgresados,
        zona,
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
        saleEndsAt: toIsoEndOfDay(saleEndsAt) ?? undefined,
        onlyEgresados,
        zona,
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
              <Field.Label color="brand.muted">Estado</Field.Label>
              <Select.Root
                collection={STATUS_OPTIONS}
                value={[status]}
                onValueChange={({ value }) =>
                  setStatus((value[0] as "enabled" | "disabled" | "blocked") ?? "enabled")
                }
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger {...inputStyles}>
                    <Select.ValueText placeholder="Selecciona un estado" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {STATUS_OPTIONS.items.map((opt) => (
                        <Select.Item item={opt} key={opt.value}>
                          <Text color="black">{opt.label}</Text>
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Field.Root>
          )}

          <Field.Root>
            <HStack justify="space-between" align="center" h="full" py={1}>
              <Field.Label color="brand.muted" mb={0}>
                Solo egresados
              </Field.Label>
              <Switch.Root
                checked={onlyEgresados}
                onCheckedChange={(e) => setOnlyEgresados(e.checked)}
              >
                <Switch.HiddenInput />
                <Switch.Control bg={onlyEgresados ? "green.400" : "red.400"}>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </HStack>
          </Field.Root>

          <Field.Root gridColumn={{ md: "span 2" }}>
            <Field.Label color="brand.muted">Zona</Field.Label>
            <Select.Root
              collection={ZONA_OPTIONS}
              value={[zona === null ? "__null__" : zona]}
              onValueChange={({ value }) => {
                const v = value[0];

                if (v === "__null__") setZona(null);
                else if (ZONA_VALUES.includes(v as TicketTypeZona))
                  setZona(v as TicketTypeZona);
              }}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger {...inputStyles}>
                  <Select.ValueText placeholder="Selecciona una zona" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {ZONA_OPTIONS.items.map((opt) => (
                      <Select.Item item={opt} key={opt.value}>
                        <Text color="black">{opt.label}</Text>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
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
