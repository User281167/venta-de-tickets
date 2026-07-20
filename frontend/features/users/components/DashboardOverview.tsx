"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Link as ChakraLink,
  Progress,
  Skeleton,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  IconArrowRight,
  IconCreditCard,
  IconRefresh,
  IconTicket,
  IconUser,
} from "@tabler/icons-react";
import { useMe } from "../hooks/useProfile";
import { useMyTickets } from "../hooks/useMyTickets";
import { useMyPayments } from "../hooks/usePayments";
import { PaymentRow } from "./PaymentRow";
import { formatCurrency } from "@/shared/utils/formats";
import type { GetMeResponse } from "../api/users.client";

const PROFILE_FIELDS: (keyof GetMeResponse["user"])[] = [
  "fullName",
  "cedula",
  "phone",
  "address",
  "dateOfBirth",
];

function calculateProfileCompletion(user: GetMeResponse["user"] | undefined) {
  if (!user) return 0;
  const filled = PROFILE_FIELDS.filter((key) => Boolean(user[key])).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

function DashboardSkeleton() {
  return (
    <Stack gap={8}>
      <Skeleton height="120px" borderRadius="2xl" />
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
        <Skeleton height="160px" borderRadius="2xl" />
        <Skeleton height="160px" borderRadius="2xl" />
        <Skeleton height="160px" borderRadius="2xl" />
      </Grid>
      <Skeleton height="240px" borderRadius="2xl" />
    </Stack>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Box textAlign="center" py={20}>
      <Box
        w={20}
        h={20}
        mx="auto"
        borderRadius="full"
        bg="rgba(255,255,255,0.04)"
        border="1px solid rgba(255,255,255,0.08)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={6}
      >
        <IconRefresh size={36} color="#ff0f7b" />
      </Box>
      <Text color="white" fontSize="xl" fontWeight="bold" mb={2}>
        Error al cargar el dashboard
      </Text>
      <Text color="brand.muted" maxW="400px" mx="auto" mb={6}>
        No se pudieron cargar tus datos. Intenta de nuevo.
      </Text>
      <Button
        onClick={onRetry}
        bg="linear-gradient(90deg, #ff0f7b, #7c3cff)"
        color="white"
        borderRadius="xl"
        px={6}
        _hover={{ opacity: 0.9 }}
      >
        Reintentar
      </Button>
    </Box>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  href,
  cta,
}: {
  icon: typeof IconTicket;
  label: string;
  value: React.ReactNode;
  color: string;
  href: string;
  cta: string;
}) {
  return (
    <Box
      className="glass-card"
      borderRadius="2xl"
      p={6}
      position="relative"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{ transform: "translateY(-4px)" }}
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        w="120px"
        h="120px"
        bg={`radial-gradient(circle at top right, ${color}18, transparent 70%)`}
        pointerEvents="none"
      />
      <Stack gap={5} position="relative">
        <HStack justify="space-between" align="flex-start">
          <Flex
            w={12}
            h={12}
            borderRadius="xl"
            bg={`${color}12`}
            border={`1px solid ${color}26`}
            align="center"
            justify="center"
          >
            <Icon size={24} color={color} />
          </Flex>
          <ChakraLink asChild>
            <NextLink href={href}>
              <HStack gap={1} color={color} fontSize="sm" fontWeight="bold">
                <Text>{cta}</Text>
                <IconArrowRight size={16} />
              </HStack>
            </NextLink>
          </ChakraLink>
        </HStack>
        <Stack gap={1}>
          <Text color="brand.muted" fontSize="sm">
            {label}
          </Text>
          <Text color="white" fontSize="4xl" fontWeight="black" lineHeight={1}>
            {value}
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
}

function ProfileCompletionCard({
  user,
  completion,
}: {
  user: GetMeResponse["user"];
  completion: number;
}) {
  return (
    <Box
      className="glass-card"
      borderRadius="2xl"
      p={6}
      position="relative"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{ transform: "translateY(-4px)" }}
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        w="120px"
        h="120px"
        bg="radial-gradient(circle at top right, rgba(0,229,255,0.12), transparent 70%)"
        pointerEvents="none"
      />
      <Stack gap={5} position="relative">
        <HStack justify="space-between" align="flex-start">
          <Flex
            w={12}
            h={12}
            borderRadius="xl"
            bg="rgba(0,229,255,0.08)"
            border="1px solid rgba(0,229,255,0.16)"
            align="center"
            justify="center"
          >
            <IconUser size={24} color="#00e5ff" />
          </Flex>
          <ChakraLink asChild>
            <NextLink href="/mi-cuenta/perfil">
              <HStack gap={1} color="brand.cyan" fontSize="sm" fontWeight="bold">
                <Text>{completion === 100 ? "Ver perfil" : "Completar"}</Text>
                <IconArrowRight size={16} />
              </HStack>
            </NextLink>
          </ChakraLink>
        </HStack>
        <Stack gap={3}>
          <HStack justify="space-between">
            <Text color="brand.muted" fontSize="sm">
              Perfil completado
            </Text>
            <Text color="white" fontWeight="black">
              {completion}%
            </Text>
          </HStack>
          <Progress.Root
            value={completion}
            size="sm"
            borderRadius="full"
            colorPalette={completion === 100 ? "green" : "cyan"}
          >
            <Progress.Track bg="rgba(255,255,255,0.08)">
              <Progress.Range
                bg={
                  completion === 100
                    ? "linear-gradient(90deg, #22c55e, #00d5b8)"
                    : "linear-gradient(90deg, #00e5ff, #7c3cff)"
                }
              />
            </Progress.Track>
          </Progress.Root>
          <Text color="brand.muted" fontSize="xs">
            {completion === 100
              ? "Tu información está completa."
              : "Completa tus datos para agilizar futuras compras."}
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
}

function EmptyRecentPayments() {
  return (
    <Box
      className="glass-card"
      borderRadius="2xl"
      p={8}
      textAlign="center"
    >
      <Box
        w={16}
        h={16}
        mx="auto"
        borderRadius="full"
        bg="rgba(255,255,255,0.04)"
        border="1px solid rgba(255,255,255,0.08)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={4}
      >
        <IconCreditCard size={28} color="#ff0f7b" />
      </Box>
      <Text color="white" fontWeight="bold" mb={1}>
        No hay pagos recientes
      </Text>
      <Text color="brand.muted" fontSize="sm">
        Tus últimas transacciones aparecerán aquí.
      </Text>
    </Box>
  );
}

export function DashboardOverview() {
  const reduced = useReducedMotion();
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useMe();
  const {
    data: tickets,
    isLoading: ticketsLoading,
    error: ticketsError,
    refetch: refetchTickets,
  } = useMyTickets(1, 1);
  const {
    data: payments,
    isLoading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
  } = useMyPayments(1, 3);

  const isLoading = profileLoading || ticketsLoading || paymentsLoading;
  const error = profileError || ticketsError || paymentsError;

  function handleRetry() {
    refetchProfile();
    refetchTickets();
    refetchPayments();
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={handleRetry} />;
  }

  const completion = calculateProfileCompletion(profile?.user);
  const activeTickets = tickets?.total ?? 0;
  const totalSpent =
    payments?.data.reduce((sum, p) => {
      if (p.status === "completed") return sum + p.totalCents;
      return sum;
    }, 0) ?? 0;
  const recentPayments = payments?.data ?? [];

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Stack gap={10}>
        <Stack gap={2}>
          <Text
            color="brand.cyan"
            fontSize="sm"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            Bienvenido de nuevo
          </Text>
          <Heading as="h1" color="white" fontSize="3xl" fontWeight="black">
            Resumen de tu cuenta
          </Heading>
          <Text color="brand.muted" maxW="600px">
            Aquí encuentras un vistazo de tus entradas, pagos y progreso de perfil.
          </Text>
        </Stack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          <StatCard
            icon={IconTicket}
            label="Entradas activas"
            value={activeTickets}
            color="#00e5ff"
            href="/mi-cuenta/entradas"
            cta="Ver entradas"
          />
          <StatCard
            icon={IconCreditCard}
            label="Total pagado"
            value={formatCurrency(totalSpent)}
            color="#ff0f7b"
            href="/mi-cuenta/pagos"
            cta="Ver pagos"
          />
          <ProfileCompletionCard
            user={profile!.user}
            completion={completion}
          />
        </Grid>

        <Stack gap={6}>
          <HStack justify="space-between" align="center">
            <Stack gap={1}>
              <Text
                color="brand.pink"
                fontSize="sm"
                fontWeight="black"
                textTransform="uppercase"
                letterSpacing="0.15em"
              >
                Finanzas
              </Text>
              <Text color="white" fontSize="2xl" fontWeight="black">
                Pagos recientes
              </Text>
            </Stack>
            <Button
              asChild
              variant="outline"
              color="white"
              borderColor="rgba(255,255,255,0.16)"
              borderRadius="xl"
              size="sm"
            >
              <NextLink href="/mi-cuenta/pagos">
                <HStack gap={2}>
                  <Text>Ver todo</Text>
                  <IconArrowRight size={16} />
                </HStack>
              </NextLink>
            </Button>
          </HStack>

          {recentPayments.length === 0 ? (
            <EmptyRecentPayments />
          ) : (
            <VStack gap={4} align="stretch">
              {recentPayments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </VStack>
          )}
        </Stack>

        <Box
          className="glass-card"
          borderRadius="2xl"
          p={6}
          bg="linear-gradient(90deg, rgba(255,15,123,0.12), rgba(0,229,255,0.08))"
        >
          <Stack
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            gap={4}
          >
            <Stack gap={1}>
              <Text color="white" fontWeight="bold" fontSize="lg">
                ¿Necesitas actualizar tus datos?
              </Text>
              <Text color="brand.muted" fontSize="sm">
                Revisa y edita tu información personal desde tu perfil.
              </Text>
            </Stack>
            <Button
              asChild
              bg="white"
              color="brand.dark"
              borderRadius="xl"
              px={6}
              fontWeight="bold"
              _hover={{ bg: "brand.light" }}
            >
              <NextLink href="/mi-cuenta/perfil">
                <HStack gap={2}>
                  <IconUser size={18} />
                  <Text>Ir a perfil</Text>
                </HStack>
              </NextLink>
            </Button>
          </Stack>
        </Box>
      </Stack>
    </motion.div>
  );
}
