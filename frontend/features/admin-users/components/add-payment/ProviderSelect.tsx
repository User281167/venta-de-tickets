"use client";

import { Field, Portal, Select, createListCollection } from "@chakra-ui/react";

const PROVIDER_OPTIONS = createListCollection({
  items: [
    { value: "MANUAL", label: "Manual" },
    { value: "GIFT", label: "Cortesía" },
  ],
});

interface ProviderSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProviderSelect({ value, onChange }: ProviderSelectProps) {
  return (
    <Field.Root>
      <Field.Label color="brand.muted">Proveedor</Field.Label>
      <Select.Root
        collection={PROVIDER_OPTIONS}
        value={[value]}
        onValueChange={({ value }) => onChange(value[0] ?? "MANUAL")}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Selecciona proveedor" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content color="black">
              {PROVIDER_OPTIONS.items.map((opt) => (
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
  );
}
