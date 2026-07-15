"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Badge,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  IconTicket,
  IconUser,
  IconCircleCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import NextLink from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { TicketType } from "../schemas/ticket-types.schema";
import { formatCurrency } from "@/shared/utils/formats";

interface TicketTypeCardProps {
  ticketType: TicketType;
}

export function TicketTypeCard({ ticketType }: TicketTypeCardProps) {
  const { user } = useAuth();

  const status = !ticketType.isActive
    ? "inactive"
    : ticketType.isSoldOut
      ? "soldout"
      : ticketType.availableCount <= 10
        ? "low"
        : "available";

  const badgeConfig = {
    inactive: { color: "gray", label: "No disponible", icon: IconAlertCircle },
    soldout: { color: "red", label: "Agotado", icon: IconAlertCircle },
    low: { color: "orange", label: `${ticketType.availableCount} disponibles`, icon: IconAlertCircle },
    available: { color: "green", label: `${ticketType.availableCount} disponibles`, icon: IconCircleCheck },
  };

  const badge = badgeConfig[status];
  const StatusIcon = badge.icon;

  return (
    <Flex
      direction="column"
      borderRadius="2xl"
      p={{ base: 5, md: 6 }}
      bg="linear-gradient(145deg, rgba(7,10,34,0.95), rgba(2,4,20,0.98))"
      border="1px solid rgba(255,255,255,0.08)"
      boxShadow="0 8px 32px rgba(0,0,0,0.35)"
      _hover={{
        transform: "translateY(-6px)",
        boxShadow: "0 16px 48px rgba(0,229,255,0.14)",
        borderColor: "brand.cyan",
      }}
      transition="all 0.25s ease"
      h="full"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="4px"
        bg={
          status === "available"
            ? "linear-gradient(90deg, #ff0f7b, #00e5ff)"
            : status === "low"
              ? "linear-gradient(90deg, #ff9f1c, #ff0f7b)"
              : "linear-gradient(90deg, #6b7280, #374151)"
        }
      />

      <VStack gap={5} align="stretch" flex={1} pt={2}>
        <HStack justify="space-between" align="flex-start">
          <Box
            p={2.5}
            borderRadius="xl"
            bg="rgba(255,15,123,0.1)"
            border="1px solid rgba(255,15,123,0.2)"
          >
            <IconTicket size={28} color="#ff0f7b" />
          </Box>

          <Badge
            colorPalette={badge.color}
            size="md"
            px={2.5}
            py={1}
            borderRadius="full"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <StatusIcon size={14} />
            {badge.label}
          </Badge>
        </HStack>

        <Box>
          <Heading as="h3" size="lg" color="white" mb={1}>
            {ticketType.name}
          </Heading>

          <Heading
            as="span"
            size="2xl"
            className="gradient-text"
            fontWeight="black"
          >
            {formatCurrency(Number(ticketType.price * 100))}
          </Heading>
        </Box>

        {ticketType.description && (
          <Text fontSize="sm" color="brand.muted" lineHeight="1.7">
            {ticketType.description}
          </Text>
        )}

        <VStack gap={1} align="stretch" mt="auto">
          {ticketType.maxPerUser && (
            <HStack gap={2} color="brand.muted" fontSize="xs">
              <IconUser size={14} />
              <Text>Máx. {ticketType.maxPerUser} por persona</Text>
            </HStack>
          )}
        </VStack>
      </VStack>

      {!ticketType.isActive ? (
        <Button
          disabled
          variant="outline"
          size="lg"
          w="full"
          mt={6}
          borderColor="whiteAlpha.200"
          color="whiteAlpha.500"
          _hover={{}}
        >
          <HStack gap={2}>
            <IconTicket size={18} />
            <Text>No disponible</Text>
          </HStack>
        </Button>
      ) : ticketType.isSoldOut ? (
        <Button
          disabled
          size="lg"
          w="full"
          mt={6}
          bg="rgba(239,68,68,0.15)"
          color="red.300"
          border="1px solid rgba(239,68,68,0.3)"
          _hover={{}}
        >
          <HStack gap={2}>
            <IconTicket size={18} />
            <Text>Agotado</Text>
          </HStack>
        </Button>
      ) : user ? (
        <Button
          asChild
          size="lg"
          w="full"
          mt={6}
          minH="52px"
          bg="linear-gradient(90deg, #ff0f7b 0%, #0969ff 100%)"
          color="white"
          fontWeight="bold"
          borderRadius="xl"
          transition="all 0.25s ease"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "0 0 28px rgba(255,15,123,0.35)",
          }}
        >
          <NextLink href="/entradas">
            <HStack gap={2}>
              <IconTicket size={18} />
              <Text>Ver ubicación y comprar</Text>
            </HStack>
          </NextLink>
        </Button>
      ) : (
        <Button
          asChild
          size="lg"
          w="full"
          mt={6}
          minH="52px"
          border="2px solid transparent"
          bg={`
            linear-gradient(#020414, #020414) padding-box,
            linear-gradient(90deg, #ff0f7b, #00e5ff) border-box
          `}
          color="white"
          fontWeight="bold"
          borderRadius="xl"
          transition="all 0.25s ease"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "0 0 28px rgba(0,229,255,0.28)",
          }}
        >
          <NextLink href="/login?redirect=/">
            <HStack gap={2}>
              <IconTicket size={18} />
              <Text>Inicia sesión para comprar</Text>
            </HStack>
          </NextLink>
        </Button>
      )}
    </Flex>
  );
}
