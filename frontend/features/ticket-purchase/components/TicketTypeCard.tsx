"use client";

import { memo } from "react";
import { Box, Flex, Text, Badge, Button } from "@chakra-ui/react";
import { IconPlus, IconTicket } from "@tabler/icons-react";
import { CartQuantitySpinner } from "./CartQuantitySpinner";
import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";
import { formatCurrency } from "@/shared/utils/formats";

interface TicketTypeCardProps {
  ticketType: TicketType;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  canDecrement: boolean;
}

const LOW_STOCK_THRESHOLD = 10;

export const TicketTypeCard = memo(function TicketTypeCard({
  ticketType,
  quantity,
  onIncrement,
  onDecrement,
  canIncrement,
  canDecrement,
}: TicketTypeCardProps) {
  const isSoldOut = ticketType.availableCount <= 0;
  const isLowStock = !isSoldOut && ticketType.availableCount <= LOW_STOCK_THRESHOLD;

  return (
    <Flex
      direction="column"
      position="relative"
      bg="brand.panel"
      borderRadius="2xl"
      p={{ base: 5, md: 6 }}
      border="1px solid"
      borderColor="rgba(255,255,255,0.08)"
      transition="all 0.25s ease"
      _hover={
        isSoldOut
          ? undefined
          : {
              borderColor: "rgba(255,255,255,0.18)",
              transform: "translateY(-4px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
            }
      }
      opacity={isSoldOut ? 0.75 : 1}
      overflow="hidden"
    >
      {isSoldOut && (
        <Box
          position="absolute"
          inset={0}
          bg="rgba(2,4,20,0.55)"
          backdropFilter="blur(2px)"
          zIndex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Badge
            px={4}
            py={1.5}
            borderRadius="full"
            bg="rgba(239,68,68,0.15)"
            border="1px solid rgba(239,68,68,0.35)"
            color="red.400"
            fontSize="sm"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.1em"
          >
            Agotado
          </Badge>
        </Box>
      )}

      <Flex justify="space-between" align="flex-start" gap={4} mb={3}>
        <Box flex={1}>
          <Flex align="center" gap={2} mb={2}>
            <Box p={1.5} borderRadius="lg" bg="rgba(0,229,255,0.1)">
              <IconTicket size={18} color="#00e5ff" />
            </Box>
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="black"
              color="white"
              lineHeight="1.2"
            >
              {ticketType.name}
            </Text>
          </Flex>

          {isLowStock && (
            <Badge
              px={2}
              py={0.5}
              borderRadius="full"
              bg="rgba(255,159,28,0.12)"
              border="1px solid rgba(255,159,28,0.3)"
              color="brand.orange"
              fontSize="xs"
              fontWeight="bold"
            >
              ¡Solo quedan {ticketType.availableCount}!
            </Badge>
          )}

          {!isSoldOut && !isLowStock && (
            <Badge
              px={2}
              py={0.5}
              borderRadius="full"
              bg="rgba(34,197,94,0.1)"
              border="1px solid rgba(34,197,94,0.25)"
              color="green.400"
              fontSize="xs"
              fontWeight="bold"
            >
              Disponible
            </Badge>
          )}
        </Box>

        <Box textAlign="right">
          <Text fontSize="xs" color="brand.muted" mb={0.5}>
            Por persona
          </Text>
          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="black"
            color="brand.cyan"
            lineHeight="1"
          >
            {formatCurrency(Number(ticketType.price) * 100)}
          </Text>
        </Box>
      </Flex>

      {ticketType.description && (
        <Text
          fontSize="sm"
          color="brand.muted"
          mb={5}
          lineHeight="1.6"
          flex={1}
        >
          {ticketType.description}
        </Text>
      )}

      <Flex
        justify="space-between"
        align="center"
        mt="auto"
        pt={4}
        borderTop="1px solid"
        borderColor="rgba(255,255,255,0.06)"
        gap={4}
      >
        <Text fontSize="sm" color="brand.muted">
          {isSoldOut
            ? "No hay unidades disponibles"
            : `${ticketType.availableCount} disponibles`}
        </Text>

        {isSoldOut ? (
          <Button
            size="sm"
            variant="outline"
            disabled
            borderColor="rgba(255,255,255,0.12)"
            color="brand.muted"
            borderRadius="xl"
            opacity={0.5}
            cursor="not-allowed"
          >
            Agotado
          </Button>
        ) : quantity === 0 ? (
          <Button
            size="sm"
            variant="outline"
            disabled={!canIncrement}
            onClick={onIncrement}
            borderColor="brand.cyan"
            color="brand.cyan"
            borderRadius="xl"
            px={4}
            _hover={{
              bg: "rgba(0, 229, 255, 0.12)",
              transform: "translateY(-1px)",
              boxShadow: "0 0 16px rgba(0,229,255,0.25)",
            }}
            _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
            transition="all 0.2s ease"
          >
            <IconPlus size={16} />
            Agregar
          </Button>
        ) : (
          <CartQuantitySpinner
            quantity={quantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            canIncrement={canIncrement}
            canDecrement={canDecrement}
          />
        )}
      </Flex>
    </Flex>
  );
});
