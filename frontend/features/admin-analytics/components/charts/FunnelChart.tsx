"use client";

import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type FunnelDatum = {
  status: string;
  label: string;
  count: number;
  percentOfFirst: number;
};

type Props = {
  data: FunnelDatum[];
  isLoading?: boolean;
  isError?: boolean;
};

export function FunnelChart({ data, isLoading, isError }: Props) {
  if (isLoading) return <ChartLoading />;
  if (isError) return <ChartError />;
  if (!data || data.length === 0)
    return <ChartEmpty message="Sin datos de embudo" />;

  const max = Math.max(...data.map((d) => d.count), 1);
  const gradient = ["#00e5ff", "#7c3cff", "#ff0f7b", "#00d5b8", "#ffb547"];

  return (
    <VStack align="stretch" gap={3} w="full">
      {data.map((step, i) => {
        const widthPct = (step.count / max) * 100;
        const color = gradient[i % gradient.length];
        return (
          <Box key={step.status} w="full">
            <Box
              display="flex"
              justifyContent="space-between"
              mb={1}
              px={1}
            >
              <Text color="white" fontWeight="semibold" fontSize="sm">
                {step.label}
              </Text>
              <Text color="brand.muted" fontSize="sm">
                {step.count} · {step.percentOfFirst}%
              </Text>
            </Box>
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

export function ChartLoading() {
  return (
    <VStack py={10} gap={3}>
      <Spinner color="#00e5ff" />
      <Text color="brand.muted" fontSize="sm">
        Cargando datos…
      </Text>
    </VStack>
  );
}

export function ChartError() {
  return (
    <Box
      p={4}
      borderRadius="xl"
      bg="rgba(239,68,68,0.1)"
      border="1px solid rgba(239,68,68,0.3)"
    >
      <Text color="white" fontSize="sm" fontWeight="bold">
        No se pudieron cargar los datos.
      </Text>
    </Box>
  );
}

export function ChartEmpty({ message }: { message: string }) {
  return (
    <Box
      p={4}
      borderRadius="xl"
      bg="rgba(255,255,255,0.03)"
      border="1px dashed rgba(255,255,255,0.1)"
    >
      <Text color="brand.muted" fontSize="sm" textAlign="center">
        {message}
      </Text>
    </Box>
  );
}

export function StatusBarChart({
  data,
  isLoading,
  isError,
}: {
  data: Array<{ status: string; count: number }>;
  isLoading?: boolean;
  isError?: boolean;
}) {
  if (isLoading) return <ChartLoading />;
  if (isError) return <ChartError />;
  if (!data || data.length === 0) return <ChartEmpty message="Sin datos" />;

  const colors = ["#00e5ff", "#7c3cff", "#ff0f7b", "#00d5b8", "#ffb547", "#ef4444", "#94a3b8"];

  return (
    <Box w="full" h="280px">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" stroke="#94a3b8" fontSize={12} />
          <YAxis
            type="category"
            dataKey="status"
            stroke="#94a3b8"
            fontSize={12}
            width={140}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(13, 17, 23, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
            }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
