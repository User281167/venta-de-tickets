"use client";

import {
  Box,
  HStack,
  IconButton,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { IconMinus, IconPlus, IconTicket } from "@tabler/icons-react";
import { formatCurrency } from "@/shared/utils/formats";
import type { AdminTicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

interface TicketQuantityCardProps {
  ticketType: AdminTicketType;
  quantity: number;
  onChange: (value: number) => void;
}

export function TicketQuantityCard({
  ticketType,
  quantity,
  onChange,
}: TicketQuantityCardProps) {
  const available = Math.max(0, ticketType.quantityTotal - ticketType.quantitySold);
  const priceCents = Number(ticketType.price * 100);

  const decrement = () => onChange(Math.max(0, quantity - 1));
  const increment = () => onChange(Math.min(available, quantity + 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInt(e.target.value, 10);
    const clamped = Number.isNaN(raw)
      ? 0
      : Math.max(0, Math.min(available, raw));
    onChange(clamped);
  };

  return (
    <Box
      className="glass-card"
      borderRadius="2xl"
      p={4}
      position="relative"
      overflow="hidden"
      opacity={available === 0 ? 0.6 : 1}
      transition="all 0.2s ease"
      _hover={available > 0 ? { borderColor: "brand.cyan" } : {}}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="3px"
        bg="linear-gradient(90deg, #ff0f7b, #00e5ff)"
      />

      <HStack justify="space-between" align="flex-start" mb={3}>
        <HStack gap={3}>
          <Box
            p={2}
            borderRadius="xl"
            bg="rgba(0,229,255,0.08)"
            border="1px solid rgba(0,229,255,0.16)"
          >
            <IconTicket size={22} color="#00e5ff" />
          </Box>
          <Stack gap={0}>
            <Text color="white" fontWeight="bold" fontSize="lg">
              {ticketType.name}
            </Text>
            <Text color="brand.muted" fontSize="sm">
              {available} disponibles
            </Text>
          </Stack>
        </HStack>

        <Text
          color="white"
          fontWeight="black"
          fontSize="xl"
          className="gradient-text"
        >
          {formatCurrency(priceCents)}
        </Text>
      </HStack>

      <HStack justify="space-between" align="center">
        <Text color="brand.muted" fontSize="sm">
          Cantidad
        </Text>

        <HStack gap={1}>
          <IconButton
            aria-label="Disminuir"
            size="sm"
            color="white"
            borderColor="rgba(255,255,255,0.16)"
            borderRadius="lg"
            onClick={decrement}
            disabled={quantity <= 0 || available === 0}
          >
            <IconMinus size={16} />
          </IconButton>

          <Input
            type="number"
            min={0}
            max={available}
            value={quantity}
            onChange={handleInputChange}
            textAlign="center"
            w="64px"
            bg="rgba(255,255,255,0.03)"
            border="1px solid rgba(255,255,255,0.08)"
            borderRadius="lg"
            color="white"
            disabled={available === 0}
            _focus={{
              borderColor: "brand.cyan",
              boxShadow: "0 0 8px rgba(0,229,255,0.2)",
            }}
          />

          <IconButton
            aria-label="Aumentar"
            size="sm"
            color="white"
            borderColor="rgba(255,255,255,0.16)"
            borderRadius="lg"
            onClick={increment}
            disabled={quantity >= available || available === 0}
          >
            <IconPlus size={16} />
          </IconButton>
        </HStack>
      </HStack>
    </Box>
  );
}
