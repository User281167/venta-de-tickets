"use client";

import { Box } from "@chakra-ui/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartEmpty, ChartError, ChartLoading } from "./FunnelChart";
import { formatCurrency } from "@/shared/utils/formats";
import type { CumulativePoint } from "../../schemas/analytics.schema";

type Props = {
  data: CumulativePoint[];
  isLoading?: boolean;
  isError?: boolean;
};

function compactCop(cents: number): string {
  const pesos = cents / 100;
  if (pesos >= 1_000_000) return `$${(pesos / 1_000_000).toFixed(1)}M`;
  if (pesos >= 1_000) return `$${(pesos / 1_000).toFixed(0)}K`;
  return `$${pesos.toFixed(0)}`;
}

export function CumulativeAreaChart({ data, isLoading, isError }: Props) {
  if (isLoading) return <ChartLoading />;
  if (isError) return <ChartError />;
  if (!data || data.length === 0) return <ChartEmpty message="Sin ingresos en el rango" />;

  return (
    <Box w="full" h="280px">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <defs>
            <linearGradient id="cumulativeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            domain={[0, "auto"]}
            tickFormatter={(v) => compactCop(Number(v))}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(13, 17, 23, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
            }}
            formatter={(value) => formatCurrency(Number(value ?? 0))}
            labelStyle={{ color: "#94a3b8" }}
          />
          <Area
            type="monotone"
            dataKey="cumulativeCents"
            stroke="#00e5ff"
            strokeWidth={2}
            fill="url(#cumulativeFill)"
            name="Ingresos acumulados"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
