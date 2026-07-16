"use client";

import {
  Flex,
  Input,
  Field,
  Select,
  Portal,
  createListCollection,
  Box,
  Text,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { IconSearch, IconCalendar } from "@tabler/icons-react";

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

const inputStyles = {
  bg: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "xl",
  color: "white",
  _placeholder: { color: "brand.muted" },
  _hover: { borderColor: "rgba(255,255,255,0.16)" },
  _focus: {
    borderColor: "brand.cyan",
    boxShadow: "0 0 12px rgba(0,229,255,0.2)",
  },
};

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Field.Root>
      <Field.Label color="brand.muted" fontSize="sm" mb={1}>
        {label}
      </Field.Label>
      <Box position="relative">
        <Box
          position="absolute"
          left={3}
          top="50%"
          transform="translateY(-50%)"
          pointerEvents="none"
          zIndex={1}
        >
          <IconCalendar size={18} color="#aeb8d8" />
        </Box>
        <Input
          type="date"
          size="lg"
          value={value}
          onChange={onChange}
          pl={10}
          {...inputStyles}
        />
      </Box>
    </Field.Root>
  );
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
    <Box
      className="glass-card"
      borderRadius="2xl"
      p={{ base: 4, md: 5 }}
      w="full"
    >
      <Flex
        gap={3}
        wrap={{ base: "wrap", lg: "nowrap" }}
        w="full"
        align="end"
      >
        <Field.Root
          flex={{ lg: "1.5" }}
          minW={{ base: "full", md: "260px" }}
        >
          <Field.Label color="brand.muted" fontSize="sm" mb={1}>
            Buscar
          </Field.Label>
          <Box position="relative" w="full">
            <Box
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              pointerEvents="none"
              zIndex={1}
            >
              <IconSearch size={18} color="#aeb8d8" />
            </Box>
            <Input
              placeholder="Buscar por nombre, cédula o correo..."
              value={search}
              onChange={handleSearch}
              size="lg"
              pl={10}
              {...inputStyles}
            />
          </Box>
        </Field.Root>

        <Flex
          gap={3}
          wrap={{ base: "wrap", lg: "nowrap" }}
          flex={{ lg: "1" }}
          minW={{ base: "full", md: "auto" }}
          w="full"
          align="end"
        >
          <Field.Root minW={{ base: "full", md: "140px" }} flex={{ lg: "1" }}>
            <Field.Label color="brand.muted" fontSize="sm" mb={1}>
              Estado
            </Field.Label>
            <Select.Root
              collection={STATUS_OPTIONS}
              value={[status]}
              onValueChange={({ value }) => onStatusChange(value[0] ?? "")}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger
                  bg="rgba(255,255,255,0.03)"
                  border="1px solid rgba(255,255,255,0.08)"
                  borderRadius="xl"
                  color="white"
                  h="48px"
                  px={3}
                  w="full"
                  _hover={{ borderColor: "rgba(255,255,255,0.16)" }}
                  _focus={{
                    borderColor: "brand.cyan",
                    boxShadow: "0 0 12px rgba(0,229,255,0.2)",
                  }}
                >
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

          <Box minW={{ base: "full", md: "160px" }} flex={{ lg: "1" }}>
            <DateInput
              label="Desde"
              value={dateFrom}
              onChange={handleDateFrom}
            />
          </Box>

          <Box minW={{ base: "full", md: "160px" }} flex={{ lg: "1" }}>
            <DateInput
              label="Hasta"
              value={dateTo}
              onChange={handleDateTo}
            />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
