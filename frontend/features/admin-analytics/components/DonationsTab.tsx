"use client";

import { useMemo } from "react";
import { Box, Heading, SimpleGrid, VStack } from "@chakra-ui/react";
import { formatCurrency } from "@/shared/utils/formats";
import {
  useDonationsDaily,
  useDonationsSummary,
} from "../api/analytics.queries";
import { StatusBarChart } from "./charts/FunnelChart";
import { KpiCards } from "./charts/KpiCards";
import { WeeklyLineChart } from "./charts/WeeklyLineChart";
import type { AnalyticsDateRange } from "../schemas/analytics.schema";

type Props = {
  range: AnalyticsDateRange;
};

const donationStates: Record<string, string> = {
  rejected: 'Rechazado',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  pending: 'Pendiente',
}

const ACCOUNT_LABELS: Record<string, string> = {
  LA_CONVENCION: "La Convención",
  BARRANQUEROS_UTP: "Barranqueros UTP",
};

export function DonationsTab({ range: _range }: Props) {
  const daily = useDonationsDaily("confirmed");
  const summary = useDonationsSummary();

  const dailyByDay = useMemo(() => {
    const map = new Map<
      string,
      { day: string; label: string; amountPesos: number }
    >();
    for (const p of daily.data ?? []) {
      const cur = map.get(p.day);
      if (cur) cur.amountPesos += p.amountPesos;
      else
        map.set(p.day, {
          day: p.day,
          label: p.label,
          amountPesos: p.amountPesos,
        });
    }
    return [...map.values()].sort((a, b) => a.day.localeCompare(b.day));
  }, [daily.data]);

  const totalConfirmed = (summary.data ?? [])
    .filter((s) => s.state === "confirmed")
    .reduce((acc, s) => acc + s.amountPesos, 0);
  const countConfirmed = (summary.data ?? [])
    .filter((s) => s.state === "confirmed")
    .reduce((acc, s) => acc + s.count, 0);

  const kpis = [
    {
      label: "Total confirmado",
      value: summary.data ? formatCurrency(totalConfirmed) : "—",
      color: "#00d5b8",
    },
    {
      label: "Donaciones confirmadas",
      value: summary.data ? String(countConfirmed) : "—",
      color: "#00e5ff",
    },
    {
      label: "Pendientes",
      value: String(
        (summary.data ?? [])
          .filter((s) => s.state === "pending")
          .reduce((acc, s) => acc + s.count, 0),
      ),
      color: "#ffb547",
    },
  ];

  const summaryData = (summary.data ?? []).map((s) => ({
    status: `${ACCOUNT_LABELS[s.account] ?? s.account} · ${donationStates[s.state] ?? s.state}`,
    count: s.count,
  }));

  return (
    <VStack align="stretch" gap={6}>
      <KpiCards items={kpis} />

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        <ChartCard title="Donaciones confirmadas por día (COP)">
          <WeeklyLineChart
            data={dailyByDay.map((p) => ({
              day: p.day,
              label: p.label,
              value: p.amountPesos,
            }))}
            isLoading={daily.isLoading}
            isError={daily.isError}
            color="#00d5b8"
            yLabel="Monto (COP)"
            formatYAsCurrency
          />
        </ChartCard>

        <ChartCard title="Conteo por cuenta y estado">
          <StatusBarChart
            data={summaryData}
            isLoading={summary.isLoading}
            isError={summary.isError}
          />
        </ChartCard>
      </SimpleGrid>
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
