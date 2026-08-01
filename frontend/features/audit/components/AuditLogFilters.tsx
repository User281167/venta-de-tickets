"use client";

import { Button, Flex, HStack, Text } from "@chakra-ui/react";
import { IconFilter, IconX } from "@tabler/icons-react";
import { AUDIT_ENTITY_TYPES, type AuditEntityType } from "../types";

interface Props {
  selected: AuditEntityType | null;
  onChange: (value: AuditEntityType | null) => void;
}

export function AuditLogFilters({ selected, onChange }: Props) {
  return (
    <Flex align="center" gap={3} flexWrap="wrap">
      <HStack gap={2}>
        <IconFilter size={16} color="#a1a1aa" />
        <Text color="brand.muted" fontSize="sm" fontWeight="medium">
          Entidad:
        </Text>
      </HStack>

      <HStack gap={2} flexWrap="wrap">
        <Button
          size="xs"
          variant={selected === null ? "solid" : "outline"}
          colorPalette={selected === null ? "teal" : undefined}
          color={selected === null ? undefined : "white"}
          borderColor="rgba(255,255,255,0.16)"
          borderRadius="full"
          bg={selected === null ? undefined : "transparent"}
          _hover={{
            bg: selected === null ? undefined : "rgba(255,255,255,0.06)",
          }}
          onClick={() => onChange(null)}
        >
          Todas
        </Button>

        {AUDIT_ENTITY_TYPES.map((entityType) => {
          const isActive = selected === entityType;
          return (
            <Button
              key={entityType}
              size="xs"
              variant={isActive ? "solid" : "outline"}
              colorPalette={isActive ? "teal" : undefined}
              color={isActive ? undefined : "white"}
              borderColor="rgba(255,255,255,0.16)"
              borderRadius="full"
              bg={isActive ? undefined : "transparent"}
              _hover={{
                bg: isActive ? undefined : "rgba(255,255,255,0.06)",
              }}
              onClick={() => onChange(entityType)}
            >
              {entityType}
            </Button>
          );
        })}
      </HStack>

      {selected && (
        <Button
          size="xs"
          variant="ghost"
          color="brand.muted"
          onClick={() => onChange(null)}
        >
          <HStack gap={1}>
            <IconX size={14} />
            <Text>Limpiar</Text>
          </HStack>
        </Button>
      )}
    </Flex>
  );
}
