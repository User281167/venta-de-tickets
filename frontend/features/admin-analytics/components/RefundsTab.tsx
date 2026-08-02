"use client";

import { Box, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { formatCurrency } from "@/shared/utils/formats";
import { useRefundsDaily, useRefundsRate } from "../api/analytics.queries";
import { KpiCards } from "./charts/KpiCards";
import { WeeklyLineChart } from "./charts/WeeklyLineChart";
import type { AnalyticsDateRange } from "../schemas/analytics.schema";

type Props = {
  range: AnalyticsDateRange;
};

export function RefundsTab({ range }: Props) {
  const daily = useRefundsDaily(range);
  const rate = useRefundsRate(range);

  const totalRefunded = daily.data?.reduce((acc, p) => acc + p.count, 0) ?? 0;
  const totalAmount = daily.data?.reduce((acc, p) => acc + p.amountCents, 0) ?? 0;

  const kpis = [
    {
      label: "Reembolsos (rango)",
      value: daily.data ? String(totalRefunded) : "—",
      color: "#ef4444",
    },
    {
      label: "Monto reembolsado",
      value: daily.data ? formatCurrency(totalAmount) : "—",
      color: "#ff0f7b",
    },
    {
      label: "Tasa de reembolso",
      value: rate.data ? `${rate.data.refundRatePercent}%` : "—",
      hint: rate.data
        ? `${rate.data.refundedCount} de ${rate.data.refundedCount + rate.data.completedCount}`
        : undefined,
      color: "#ffb547",
    },
  ];

  return (
    <VStack align="stretch" gap={6}>
      <KpiCards items={kpis} />

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        <ChartCard title="Reembolsos por día">
          <WeeklyLineChart
            data={
              daily.data?.map((p) => ({
                day: p.day,
                label: p.label,
                value: p.count,
              })) ?? []
            }
            isLoading={daily.isLoading}
            isError={daily.isError}
            color="#ef4444"
            yLabel="Reembolsos"
          />
        </ChartCard>

        <ChartCard title="Monto reembolsado por día (COP)">
          <WeeklyLineChart
            data={
              daily.data?.map((p) => ({
                day: p.day,
                label: p.label,
                value: p.amountCents,
              })) ?? []
            }
            isLoading={daily.isLoading}
            isError={daily.isError}
            color="#ff0f7b"
            yLabel="Monto (COP)"
            formatYAsCurrency
          />
        </ChartCard>
      </SimpleGrid>

      {daily.data && daily.data.length === 0 && (
        <Box textAlign="center" py={4}>
          <Text color="brand.muted" fontSize="sm">
            No hay reembolsos en el rango seleccionado.
          </Text>
        </Box>
      )}
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
