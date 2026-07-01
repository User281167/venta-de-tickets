"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { IconTicket } from "@tabler/icons-react";
import NextLink from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { TicketType } from "../schemas/ticket-types.schema";

interface TicketTypeCardProps {
  ticketType: TicketType;
}

export function TicketTypeCard({ ticketType }: TicketTypeCardProps) {
  const { user } = useAuth();

  return (
    <Flex
      direction="column"
      borderWidth={1}
      borderRadius="xl"
      p={6}
      bg="white"
      boxShadow="sm"
      _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
      transition="all 0.2s"
      h="full"
    >
      <Box flex={1}>
        <Heading as="h3" size="md" color="#303841" mb={1}>
          {ticketType.name}
        </Heading>

        <HStack justify="space-between" align="baseline" mb={2}>
          <Heading as="span" size="xl" color="#76ABAE">
            ${Number(ticketType.price).toLocaleString("es-CO")}
          </Heading>
          <Badge
            colorPalette={
              ticketType.isSoldOut
                ? "red"
                : ticketType.availableCount <= 10
                  ? "orange"
                  : "green"
            }
            size="sm"
          >
            {ticketType.isSoldOut
              ? "Agotado"
              : `${ticketType.availableCount} disponibles`}
          </Badge>
        </HStack>

        {ticketType.maxPerUser && (
          <Text fontSize="xs" color="gray.400">
            Máx. {ticketType.maxPerUser} por persona
          </Text>
        )}

        {ticketType.description && (
          <Text fontSize="sm" color="gray.500" mt={4}>
            {ticketType.description}
          </Text>
        )}
      </Box>

      {ticketType.isSoldOut ? (
        <Button disabled colorPalette="orange" size="lg" w="full" mt={4}>
          <HStack gap={2}>
            <IconTicket size={18} />
            <Text>Agotado</Text>
          </HStack>
        </Button>
      ) : user ? (
        <>
          <Button
            colorPalette="orange"
            size="lg"
            w="full"
            mt={4}
            _hover={{ transform: "translateY(-1px)" }}
          >
            <HStack gap={2}>
              <IconTicket size={18} />
              <Text>Comprar</Text>
            </HStack>
          </Button>
        </>
      ) : (
        <Button
          asChild
          colorPalette="orange"
          size="lg"
          w="full"
          mt={4}
          _hover={{ transform: "translateY(-1px)" }}
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
