"use client";

import { Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { ReactNode } from "react";
import { IconArrowLeft } from "@tabler/icons-react";

interface CheckoutResultCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  details?: ReactNode;
  primaryAction: {
    label: string;
    href: string;
  };
  statusColor: string;
  bgGlow?: string;
}

export function CheckoutResultCard({
  icon,
  title,
  subtitle,
  details,
  primaryAction,
  statusColor,
  bgGlow = "rgba(0,229,255,0.15)",
}: CheckoutResultCardProps) {
  return (
    <Box
      minH="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={{ base: 6, md: 10 }}
      px={4}
    >
      <VStack
        maxW="480px"
        w="full"
        bg="brand.panel"
        borderRadius="2xl"
        p={{ base: 6, md: 8 }}
        border="1px solid"
        borderColor="rgba(255,255,255,0.08)"
        boxShadow={`0 24px 80px rgba(0,0,0,0.5), 0 0 60px ${bgGlow}`}
        textAlign="center"
        gap={5}
      >
        <Box
          p={4}
          borderRadius="full"
          bg={`${statusColor}15`}
          border={`1px solid ${statusColor}40`}
          display="inline-flex"
        >
          {icon}
        </Box>

        <VStack gap={2}>
          <Heading as="h1" size="xl" color="white" lineHeight="1.2">
            {title}
          </Heading>

          {subtitle && (
            <Text fontSize="md" color="brand.muted">
              {subtitle}
            </Text>
          )}
        </VStack>

        {details && (
          <Box
            w="full"
            p={4}
            borderRadius="xl"
            bg="rgba(255,255,255,0.03)"
            border="1px solid rgba(255,255,255,0.06)"
            textAlign="left"
          >
            {details}
          </Box>
        )}

        <Button
          asChild
          w="full"
          h="52px"
          borderRadius="xl"
          bg="brand.cyan"
          color="brand.dark"
          fontWeight="black"
          fontSize="md"
          _hover={{ opacity: 0.9, transform: "translateY(-2px)" }}
          transition="all 0.2s ease"
        >
          <Link href={primaryAction.href}>
            <HStack gap={2} justify="center">
              <IconArrowLeft size={18} />
              <Text>{primaryAction.label}</Text>
            </HStack>
          </Link>
        </Button>
      </VStack>
    </Box>
  );
}
