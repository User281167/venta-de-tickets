"use client";

import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  IconDashboard,
  IconTicket,
  IconUsers,
  IconCurrencyDollar,
  IconQrcode,
} from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";
import NextLink from "next/link";
import { useAdmin } from "@/features/admin-auth/hooks/useAdmin";

const QUICK_LINKS = [
  { href: "/admin/ticket-types", label: "Tipos de entrada", icon: IconTicket, color: "#00e5ff" },
  { href: "/admin/usuarios", label: "Usuarios", icon: IconUsers, color: "#7c3cff" },
  { href: "/admin/pagos", label: "Pagos", icon: IconCurrencyDollar, color: "#ff0f7b" },
  { href: "#", label: "Check-in", icon: IconQrcode, color: "#00d5b8", disabled: true },
];

export default function AdminDashboard() {
  const { admin, isLoading } = useAdmin();
  const reduced = useReducedMotion();

  if (isLoading) {
    return (
      <Flex flex={1} align="center" justify="center">
        <Text color="brand.muted">Cargando...</Text>
      </Flex>
    );
  }

  const roleLabel: Record<string, string> = {
    super_admin: "Super administrador",
    admin: "Administrador",
    checker: "Validador",
  };

  return (
    <Container maxW="5xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
      <VStack gap={10} align="stretch">
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            className="glass-card"
            borderRadius="2xl"
            p={{ base: 6, md: 10 }}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bg="linear-gradient(90deg, #ff0f7b, #00e5ff)"
            />
            <Box
              position="absolute"
              top="-80px"
              right="-80px"
              w="240px"
              h="240px"
              borderRadius="full"
              bg="radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)"
              pointerEvents="none"
            />

            <HStack gap={4} mb={4}>
              <Flex
                w={14}
                h={14}
                borderRadius="xl"
                bg="rgba(0,229,255,0.1)"
                border="1px solid rgba(0,229,255,0.2)"
                align="center"
                justify="center"
              >
                <IconDashboard size={28} color="#00e5ff" />
              </Flex>
              <Box>
                <Text
                  color="brand.cyan"
                  fontSize="sm"
                  fontWeight="black"
                  textTransform="uppercase"
                  letterSpacing="0.15em"
                >
                  Panel de control
                </Text>
                <Heading as="h1" size="2xl" color="white" lineHeight="1.1">
                  Bienvenido
                </Heading>
              </Box>
            </HStack>

            <Text color="brand.muted" fontSize="lg" maxW="600px" lineHeight="1.7">
              Hola{admin?.email ? `, ${admin.email}` : ""}. Has ingresado como{" "}
              <Text as="span" color="white" fontWeight="bold">
                {roleLabel[admin?.role ?? ""] ?? admin?.role}
              </Text>
              . Selecciona una sección para gestionar el evento.
            </Text>
          </Box>
        </motion.div>

        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Text color="white" fontSize="xl" fontWeight="bold" mb={4}>
            Accesos rápidos
          </Text>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              const content = (
                <Box
                  className="glass-card"
                  borderRadius="2xl"
                  p={5}
                  transition="all 0.25s ease"
                  opacity={link.disabled ? 0.6 : 1}
                  cursor={link.disabled ? "not-allowed" : "pointer"}
                  _hover={
                    link.disabled
                      ? {}
                      : {
                          transform: "translateY(-4px)",
                          borderColor: link.color,
                          boxShadow: `0 12px 32px ${link.color}22`,
                        }
                  }
                >
                  <Flex
                    w={12}
                    h={12}
                    borderRadius="xl"
                    bg={`${link.color}15`}
                    border={`1px solid ${link.color}30`}
                    align="center"
                    justify="center"
                    mb={4}
                  >
                    <Icon size={24} color={link.color} />
                  </Flex>
                  <Text color="white" fontWeight="bold" fontSize="lg">
                    {link.label}
                  </Text>
                  {link.disabled && (
                    <Text fontSize="xs" color="brand.muted" mt={1}>
                      Próximamente
                    </Text>
                  )}
                </Box>
              );

              return link.disabled ? (
                <Box key={link.label}>{content}</Box>
              ) : (
                <Box key={link.label} asChild>
                  <NextLink href={link.href}>{content}</NextLink>
                </Box>
              );
            })}
          </SimpleGrid>
        </motion.div>
      </VStack>
    </Container>
  );
}
