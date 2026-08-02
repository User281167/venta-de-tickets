"use client";

import { Box, Heading, VStack } from "@chakra-ui/react";
import { formatCurrency } from "@/shared/utils/formats";
import {
  useRevenueCumulative,
  useSalesByTicketType,
  useSalesDaily,
  useSalesSummary,
} from "../api/analytics.queries";
import { CumulativeAreaChart } from "./charts/CumulativeAreaChart";
import { KpiCards } from "./charts/KpiCards";
import {
  StackedBarChart,
  WeeklyLineChart,
} from "./charts/WeeklyLineChart";
import type { AnalyticsDateRange } from "../schemas/analytics.schema";

type Props = {
  range: AnalyticsDateRange;
};

const COLORS = ["#00e5ff", "#7c3cff", "#ff0f7b", "#00d5b8", "#ffb547", "#ef4444"];

export function SalesTab({ range }: Props) {
  const daily = useSalesDaily(range);
  const revenue = useRevenueCumulative(range);
  const byType = useSalesByTicketType(range);
  const summary = useSalesSummary(range);

  const kpis = [
    {
      label: "Ingresos",
      value: summary.data ? formatCurrency(summary.data.totalRevenueCents) : "—",
      color: "#00e5ff",
    },
    {
      label: "Tickets vendidos",
      value: summary.data ? String(summary.data.ticketsSold) : "—",
      color: "#7c3cff",
      hint: "",
    },
    {
      label: "Ticket promedio",
      value:
        summary.data && summary.data.ticketsSold > 0
          ? formatCurrency(summary.data.averageTicketCents)
          : "—",
      color: "#ff0f7b",
    },
    {
      label: "Capacidad vendida",
      value:
        summary.data && summary.data.capacitySoldPercent !== null
          ? `${summary.data.capacitySoldPercent}%`
          : "—",
      hint:
        summary.data && summary.data.totalCapacity > 0
          ? `${summary.data.ticketsSold} vendidos de ${summary.data.totalCapacity} cupos totales`
          : undefined,
      color: "#00d5b8",
    },
  ];

  return (
    <VStack align="stretch" gap={6}>
      <KpiCards items={kpis} />

      <ChartCard title="Tickets vendidos por día">
        <WeeklyLineChart
          data={daily.data ?? []}
          isLoading={daily.isLoading}
          isError={daily.isError}
          color="#ff0f7b"
          yLabel="Tickets"
        />
      </ChartCard>

      <ChartCard title="Ingresos acumulados (COP)">
        <CumulativeAreaChart
          data={revenue.data ?? []}
          isLoading={revenue.isLoading}
          isError={revenue.isError}
        />
      </ChartCard>

      <ChartCard title="Ventas por tipo de entrada">
        <StackedBarChart
          data={byType.data?.days ?? []}
          series={(byType.data?.ticketTypes ?? []).map((t, i) => ({
            key: t.id,
            name: t.name,
            color: COLORS[i % COLORS.length],
          }))}
          isLoading={byType.isLoading}
          isError={byType.isError}
        />
      </ChartCard>
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
