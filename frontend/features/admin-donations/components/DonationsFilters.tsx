"use client";

import {
  Box,
  Field,
  Flex,
  Input,
  Select,
  Portal,
  createListCollection,
  Text,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { IconSearch } from "@tabler/icons-react";
import {
  DONATION_STATE_FILTER_OPTIONS,
  DONATION_ACCOUNT_FILTER_OPTIONS,
} from "@/shared/utils/donation-status";

const STATE_OPTIONS = createListCollection({
  items: DONATION_STATE_FILTER_OPTIONS.map((o) => ({ ...o })),
});

const ACCOUNT_OPTIONS = createListCollection({
  items: DONATION_ACCOUNT_FILTER_OPTIONS.map((o) => ({ ...o })),
});

interface DonationsFiltersProps {
  search: string;
  state: string;
  account: string;
  onSearchChange: (val: string) => void;
  onStateChange: (val: string) => void;
  onAccountChange: (val: string) => void;
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

const triggerStyles = {
  bg: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "xl",
  color: "white",
  h: "48px",
  px: 3,
  w: "full",
  _hover: { borderColor: "rgba(255,255,255,0.16)" },
  _focus: {
    borderColor: "brand.cyan",
    boxShadow: "0 0 12px rgba(0,229,255,0.2)",
  },
};

export function DonationsFilters({
  search,
  state,
  account,
  onSearchChange,
  onStateChange,
  onAccountChange,
}: DonationsFiltersProps) {
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value),
    [onSearchChange],
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
        wrap={{ base: "wrap", xl: "nowrap" }}
        w="full"
        align="end"
      >
        <Field.Root flex={{ lg: "1" }} minW={{ base: "full", md: "260px" }}>
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
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={handleSearch}
              size="lg"
              pl={10}
              {...inputStyles}
            />
          </Box>
        </Field.Root>

        <Field.Root minW={{ base: "full", md: "180px" }} flex={{ lg: "1" }}>
          <Field.Label color="brand.muted" fontSize="sm" mb={1}>
            Estado
          </Field.Label>
          <Select.Root
            collection={STATE_OPTIONS}
            value={[state]}
            onValueChange={({ value }) => onStateChange(value[0] ?? "")}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger {...triggerStyles}>
                <Select.ValueText placeholder="Estado" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {STATE_OPTIONS.items.map((opt) => (
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

        <Field.Root minW={{ base: "full", md: "180px" }} flex={{ lg: "1" }}>
          <Field.Label color="brand.muted" fontSize="sm" mb={1}>
            Cuenta
          </Field.Label>
          <Select.Root
            collection={ACCOUNT_OPTIONS}
            value={[account]}
            onValueChange={({ value }) => onAccountChange(value[0] ?? "")}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger {...triggerStyles}>
                <Select.ValueText placeholder="Cuenta" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {ACCOUNT_OPTIONS.items.map((opt) => (
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
      </Flex>
    </Box>
  );
}
