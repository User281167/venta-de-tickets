"use client";

import {
  Flex,
  Input,
  Field,
  Select,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import { useCallback } from "react";

const STATUS_OPTIONS = createListCollection({
  items: [
    { value: "", label: "Todos los estados" },
    { value: "pending", label: "Pendiente" },
    { value: "completed", label: "Completado" },
    { value: "failed", label: "Fallido" },
    { value: "refunded", label: "Reembolsado" },
  ],
});

interface PaymentFiltersProps {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  onSearchChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onDateFromChange: (val: string) => void;
  onDateToChange: (val: string) => void;
}

export function PaymentFilters({
  search,
  status,
  dateFrom,
  dateTo,
  onSearchChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
}: PaymentFiltersProps) {
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value),
    [onSearchChange],
  );

  const handleStatus = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => onStatusChange(e.target.value),
    [onStatusChange],
  );

  const handleDateFrom = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onDateFromChange(e.target.value),
    [onDateFromChange],
  );

  const handleDateTo = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onDateToChange(e.target.value),
    [onDateToChange],
  );

  return (
    <Flex gap={3} wrap="wrap" w="full" align="end" justify="center">
      <Input
        flex="1"
        placeholder="Buscar por nombre, cédula o correo..."
        value={search}
        onChange={handleSearch}
        size="lg"
      />

      <Field.Root w="180px">
        <Field.Label color="white">Estado</Field.Label>

        <Select.Root
          collection={STATUS_OPTIONS}
          value={[status]}
          onValueChange={({ value }) => onStatusChange(value[0] ?? "")}
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
                {STATUS_OPTIONS.items.map((opt) => (
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

      <Field.Root w="180px">
        <Field.Label color="white">Desde</Field.Label>

        <Input
          type="date"
          size="lg"
          value={dateFrom}
          onChange={handleDateFrom}
          title="Desde"
        />
      </Field.Root>

      <Field.Root w="180px">
        <Field.Label color="white">Hasta</Field.Label>

        <Input
          type="date"
          size="lg"
          value={dateTo}
          onChange={handleDateTo}
          title="Hasta"
        />
      </Field.Root>
    </Flex>
  );
}
