"use client";

import { Box, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import {
  useFunnel,
  useNoShows,
  useTicketsStatusBreakdown,
} from "../api/analytics.queries";
import { ChartEmpty, ChartError, ChartLoading } from "./charts/FunnelChart";
import { KpiCards } from "./charts/KpiCards";
import { StatusBarChart } from "./charts/FunnelChart";
import type { AnalyticsDateRange } from "../schemas/analytics.schema";

type Props = {
  range: AnalyticsDateRange;
};

const STATUS_LABELS: Record<string, string> = {
  reserved: "Reservados (pre-pago)",
  paid: "Pagados",
  pending_confirmation: "Por confirmar entrada",
  confirmed: "Confirmados",
  used: "Asistieron",
  cancelled: "Cancelados",
  expired: "Expirados",
};

export function FunnelTab({ range }: Props) {
  const funnel = useFunnel();
  const breakdown = useTicketsStatusBreakdown();
  const noShows = useNoShows(range);

  const noShow = noShows.data;
  const kpis = [
    {
      label: "Asistieron",
      value: String(funnel.data?.find((s) => s.status === "used")?.count ?? 0),
      color: "#00d5b8",
    },
    {
      label: "Confirmados",
      value: String(
        funnel.data?.find((s) => s.status === "confirmed")?.count ?? 0,
      ),
      color: "#7c3cff",
    },
    {
      label: "No-shows",
      value: noShow ? String(noShow.count) : "—",
      hint: noShow ? `${noShow.noShowPercent}% de confirmados` : undefined,
      color: "#ef4444",
    },
    {
      label: "Reservados (pre-pago)",
      value: String(
        funnel.data?.find((s) => s.status === "reserved")?.count ?? 0,
      ),
      color: "#00e5ff",
    },
  ];

  const breakdownData = (breakdown.data ?? []).map((b) => ({
    status: STATUS_LABELS[b.status] ?? b.status,
    count: b.count,
  }));

  return (
    <VStack align="stretch" gap={6}>
      <KpiCards items={kpis} />

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        <ChartCard title="Estado de las entradas">
          <FunnelViz
            steps={funnel.data ?? []}
            isLoading={funnel.isLoading}
            isError={funnel.isError}
          />
        </ChartCard>

        <ChartCard title="Distribución de estados">
          <StatusBarChart
            data={breakdownData}
            isLoading={breakdown.isLoading}
            isError={breakdown.isError}
          />
        </ChartCard>
      </SimpleGrid>
    </VStack>
  );
}

function FunnelViz({
  steps,
  isLoading,
  isError,
}: {
  steps: Array<{ status: string; label: string; count: number; percentOfFirst: number }>;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) return <ChartLoading />;
  if (isError) return <ChartError />;
  if (!steps || steps.length === 0) return <ChartEmpty message="Sin datos" />;

  const max = Math.max(...steps.map((s) => s.count), 1);
  const gradient = ["#00e5ff", "#7c3cff", "#ff0f7b", "#00d5b8", "#ffb547"];

  return (
    <VStack align="stretch" gap={3} w="full">
      {steps.map((step, i) => {
        const widthPct = (step.count / max) * 100;
        const color = gradient[i % gradient.length];
        const previousCount = i > 0 ? steps[i - 1].count : null;
        const drop =
          previousCount !== null && previousCount > 0
            ? Math.round(((previousCount - step.count) / previousCount) * 100)
            : null;
        return (
          <Box key={step.status} w="full">
            <HStack justify="space-between" mb={1} px={1}>
              <HStack gap={2}>
                <Box
                  w="10px"
                  h="10px"
                  borderRadius="full"
                  bg={color}
                />
                <Text color="white" fontWeight="semibold" fontSize="sm">
                  {step.label}
                </Text>
              </HStack>
              <HStack gap={3}>
                <Text color="brand.muted" fontSize="xs">
                  {step.percentOfFirst}% del inicio
                </Text>
                {drop !== null && drop > 0 && (
                  <Text color="rgba(239,68,68,0.85)" fontSize="xs">
                    -{drop}% vs anterior
                  </Text>
                )}
                <Text color="white" fontSize="sm" fontWeight="bold">
                  {step.count}
                </Text>
              </HStack>
            </HStack>
            <Box
              h="40px"
              borderRadius="md"
              bg="rgba(255,255,255,0.04)"
              position="relative"
              overflow="hidden"
              border="1px solid rgba(255,255,255,0.06)"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                bottom={0}
                w={`${widthPct}%`}
                bg={`linear-gradient(90deg, ${color}cc, ${color}66)`}
                borderRight="1px solid"
                borderColor={color}
                transition="width 0.4s ease"
              />
            </Box>
          </Box>
        );
      })}
    </VStack>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box className="glass-card" borderRadius="2xl" p={5} w="full">
      <Heading as="h3" size="md" color="white" mb={4} fontWeight="bold">
        {title}
      </Heading>
      {children}
    </Box>
  );
}
