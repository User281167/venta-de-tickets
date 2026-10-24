"use client";

import { Box, SimpleGrid, VStack } from "@chakra-ui/react";
import { useRegisterSummary } from "../api/analytics.queries";
import { StatusBarChart } from "./charts/FunnelChart";
import { KpiCards } from "./charts/KpiCards";

export function RegisterTab() {
  const summary = useRegisterSummary();
  const data = summary.data;

  const kpis = [
    {
      label: "Total registros",
      value: data ? String(data.total) : "—",
      color: "#00e5ff",
    },
    {
      label: "Confirmados",
      value: data ? `${data.confirmedCount} (${data.confirmedPercent}%)` : "—",
      color: "#00d5b8",
    },
    {
      label: "Egresados",
      value: data ? `${data.egresadoCount} (${data.egresadoPercent}%)` : "—",
      color: "#7c3cff",
    },
    {
      label: "Asociados",
      value: data ? `${data.asociadoCount} (${data.asociadoPercent}%)` : "—",
      color: "#ffb547",
    },
  ];

  const professionData = (data?.byProfession ?? []).map((p) => ({
    status: p.profession,
    count: p.count,
  }));

  return (
    <VStack align="stretch" gap={6}>
      <KpiCards items={kpis} />

      <SimpleGrid columns={{ base: 1, lg: 1 }} gap={6}>
        <Box className="glass-card" borderRadius="2xl" p={5} w="full">
          <StatusBarChart
            data={professionData}
            isLoading={summary.isLoading}
            isError={summary.isError}
          />
        </Box>
      </SimpleGrid>
    </VStack>
  );
}
