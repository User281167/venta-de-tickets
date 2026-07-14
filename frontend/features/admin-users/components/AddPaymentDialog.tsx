"use client";

import {
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Field,
  Input,
  Portal,
  Select,
  Table,
  Text,
  VStack,
  createListCollection,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { useAdminTicketTypes } from "@/features/ticket-types/api/ticket-types.queries";
import { useCreateAdminPayment } from "@/features/admin-payments/api/admin-payments.queries";
import type { UserRow } from "../api/admin-users.queries";
import { toast } from "sonner";
import { tableCss } from "@/shared/components/tablecss";

const PROVIDER_OPTIONS = createListCollection({
  items: [
    { value: "MANUAL", label: "Manual" },
    { value: "GIFT", label: "Cortesía" },
  ],
});

interface Props {
  user: UserRow | null;
  setUser: (user: UserRow | null) => void;
}

export function AddPaymentDialog({ user, setUser }: Props) {
  const { data: ticketTypes, isLoading } = useAdminTicketTypes();
  const mutation = useCreateAdminPayment();

  const activeTicketTypes = useMemo(
    () => (ticketTypes ?? []).filter((tt) => tt.isActive),
    [ticketTypes],
  );

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [provider, setProvider] = useState<string>("MANUAL");

  const reset = useCallback(() => {
    setQuantities({});
    setProvider("MANUAL");
  }, []);

  const total = useMemo(() => {
    return activeTicketTypes.reduce(
      (sum, tt) => sum + tt.price * (quantities[tt.id] ?? 0),
      0,
    );
  }, [activeTicketTypes, quantities]);

  const hasSelection = useMemo(
    () => Object.values(quantities).some((q) => q > 0),
    [quantities],
  );

  const handleSubmit = useCallback(async () => {
    if (!user || !hasSelection) return;

    const tickets = activeTicketTypes
      .filter((tt) => (quantities[tt.id] ?? 0) > 0)
      .map((tt) => ({
        ticketTypeId: tt.id,
        quantity: quantities[tt.id]!,
      }));

    try {
      await mutation.mutateAsync({
        userId: user.id,
        provider: provider as "MANUAL" | "GIFT",
        tickets,
      });
      toast.success("Pago registrado exitosamente");
      reset();
      setUser(null);
    } catch {
      toast.error("Error al registrar el pago");
    }
  }, [
    user,
    hasSelection,
    activeTicketTypes,
    quantities,
    provider,
    mutation,
    reset,
    setUser,
  ]);

  const handleCancel = useCallback(() => {
    reset();
    setUser(null);
  }, [reset, setUser]);

  return (
    <DialogRoot
      open={!!user}
      onOpenChange={(e) => {
        if (!e.open) setUser(null);
      }}
      size="lg"
    >
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent bg="gray.600" color="brand.light">
          <DialogHeader>
            <DialogTitle color="brand.light">
              Pago manual — {user?.fullName ?? ""}
            </DialogTitle>
          </DialogHeader>

          <DialogBody spaceY={4}>
            {isLoading ? (
              <Text>Cargando tipos de entrada...</Text>
            ) : activeTicketTypes.length === 0 ? (
              <Text>No hay tipos de entrada activos disponibles.</Text>
            ) : (
              <VStack align="stretch" spaceY={4}>
                <Table.Root css={tableCss}>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader w="35%">Tipo</Table.ColumnHeader>
                      <Table.ColumnHeader w="20%">Precio</Table.ColumnHeader>
                      <Table.ColumnHeader w="20%">
                        Disponibles
                      </Table.ColumnHeader>
                      <Table.ColumnHeader w="25%" textAlign="center">
                        Cantidad
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {activeTicketTypes.map((tt) => {
                      const available = tt.quantityTotal - tt.quantitySold;

                      return (
                        <Table.Row key={tt.id}>
                          <Table.Cell>{tt.name}</Table.Cell>

                          <Table.Cell>
                            ${tt.price.toLocaleString("es-CO")}
                          </Table.Cell>

                          <Table.Cell>{available}</Table.Cell>

                          <Table.Cell textAlign="center">
                            <Input
                              type="number"
                              min={0}
                              max={Math.max(0, available)}
                              w="80px"
                              value={quantities[tt.id] ?? 0}
                              onChange={(e) => {
                                const raw = parseInt(e.target.value, 10);
                                const clamped = Number.isNaN(raw)
                                  ? 0
                                  : Math.max(0, Math.min(available, raw));
                                setQuantities((prev) => ({
                                  ...prev,
                                  [tt.id]: clamped,
                                }));
                              }}
                              textAlign="center"
                            />
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>

                <Field.Root>
                  <Field.Label>Proveedor</Field.Label>

                  <Select.Root
                    collection={PROVIDER_OPTIONS}
                    defaultValue={[PROVIDER_OPTIONS.items[0].value]}
                    value={[provider]}
                    onValueChange={({ value }) =>
                      setProvider(value[0] ?? "MANUAL")
                    }
                  >
                    <Select.HiddenSelect />

                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText />
                      </Select.Trigger>

                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>

                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {PROVIDER_OPTIONS.items.map((opt) => (
                            <Select.Item
                              item={opt}
                              key={opt.value}
                              color="black"
                            >
                              {opt.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Field.Root>

                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  textAlign="right"
                  color="brand.light"
                >
                  Total: ${total.toLocaleString("es-CO")}
                </Text>
              </VStack>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outline"
              color="white"
              _hover={{ color: "black" }}
              onClick={handleCancel}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>

            <Button
              colorPalette="teal"
              onClick={handleSubmit}
              loading={mutation.isPending}
              disabled={!hasSelection || isLoading}
            >
              Registrar pago
            </Button>
          </DialogFooter>

          <DialogCloseTrigger color="brand.muted" />
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
