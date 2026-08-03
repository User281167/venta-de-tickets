"use client";

import { Box } from "@chakra-ui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartEmpty, ChartError, ChartLoading } from "./FunnelChart";
import { formatCurrency } from "@/shared/utils/formats";
import type { DayPoint } from "../../schemas/analytics.schema";

type Props = {
  data: DayPoint[];
  isLoading?: boolean;
  isError?: boolean;
  color?: string;
  yLabel?: string;
  formatYAsCurrency?: boolean;
};

function compactCop(cents: number): string {
  if (cents >= 1_000_000) return `$${(cents / 1_000_000).toFixed(1)}M`;
  if (cents >= 1_000) return `$${(cents / 1_000).toFixed(0)}K`;
  return `$${cents.toFixed(0)}`;
}

export function WeeklyLineChart({
  data,
  isLoading,
  isError,
  color = "#ff0f7b",
  yLabel = "Cantidad",
  formatYAsCurrency = false,
}: Props) {
  if (isLoading) return <ChartLoading />;
  if (isError) return <ChartError />;
  if (!data || data.length === 0) return <ChartEmpty message="Sin datos en el rango" />;

  const yFormatter: ((value: unknown) => string) | undefined =
    formatYAsCurrency
      ? (v) => compactCop(Number(v))
      : undefined;

  const yDomain: [number | "auto", number | "auto"] = [
    0,
    "auto",
  ];

  return (
    <Box w="full" h="280px">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            domain={yDomain}
            tickFormatter={yFormatter}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(13, 17, 23, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
            }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(value) =>
              formatYAsCurrency
                ? formatCurrency(Number(value))
                : Number(value).toLocaleString("es-CO")
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
            name={yLabel}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

type StackedProps = {
  data: Array<Record<string, string | number>>;
  series: Array<{ key: string; name: string; color: string }>;
  isLoading?: boolean;
  isError?: boolean;
};

export function StackedBarChart({
  data,
  series,
  isLoading,
  isError,
}: StackedProps) {
  if (isLoading) return <ChartLoading />;
  if (isError) return <ChartError />;
  if (!data || data.length === 0) return <ChartEmpty message="Sin datos" />;

  return (
    <Box w="full" h="320px">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} domain={[0, "auto"]} />
          <Tooltip
            contentStyle={{
              background: "rgba(13, 17, 23, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
            }}
            labelStyle={{ color: "#94a3b8" }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              stackId="a"
              fill={s.color}
              name={s.name}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
