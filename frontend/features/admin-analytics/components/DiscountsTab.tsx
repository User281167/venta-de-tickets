"use client";

import {
  Box,
  HStack,
  Heading,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { formatCurrency } from "@/shared/utils/formats";
import {
  useDiscountsTotalAmount,
  useTopDiscountCodes,
} from "../api/analytics.queries";
import { ChartEmpty, ChartError, ChartLoading } from "./charts/FunnelChart";
import { KpiCards } from "./charts/KpiCards";
import type { AnalyticsDateRange } from "../schemas/analytics.schema";

type Props = {
  range: AnalyticsDateRange;
};

export function DiscountsTab({ range }: Props) {
  const top = useTopDiscountCodes();
  const total = useDiscountsTotalAmount(range);

  const kpis = [
    {
      label: "Monto descontado",
      value: total.data ? formatCurrency(total.data.amountCents) : "—",
      color: "#00e5ff",
    },
    {
      label: "Usos",
      value: total.data ? String(total.data.uses) : "—",
      color: "#7c3cff",
    },
    {
      label: "Códigos top",
      value: top.data ? String(top.data.length) : "—",
      color: "#ff0f7b",
    },
  ];

  return (
    <VStack align="stretch" gap={6}>
      <KpiCards items={kpis} />

      <Box className="glass-card" borderRadius="2xl" p={5} w="full">
        <Heading as="h3" size="md" color="white" mb={4} fontWeight="bold">
          Top códigos por uso
        </Heading>
        <DiscountTable
          isLoading={top.isLoading}
          isError={top.isError}
          rows={top.data ?? []}
        />
      </Box>
    </VStack>
  );
}

function DiscountTable({
  isLoading,
  isError,
  rows,
}: {
  isLoading: boolean;
  isError: boolean;
  rows: Array<{
    id: string;
    code: string;
    usedCount: number;
    maxUses: number | null;
    conversionPercent: number | null;
    discountCents: number;
  }>;
}) {
  if (isLoading) return <ChartLoading />;
  if (isError) return <ChartError />;
  if (rows.length === 0)
    return <ChartEmpty message="Aún no se han usado códigos de descuento" />;

  return (
    <Box overflowX="auto">
      <Table.Root size="sm" variant="line">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader color="brand.muted">Código</Table.ColumnHeader>
            <Table.ColumnHeader color="brand.muted" textAlign="end">
              Usos
            </Table.ColumnHeader>
            <Table.ColumnHeader color="brand.muted" textAlign="end">
              Tope
            </Table.ColumnHeader>
            <Table.ColumnHeader color="brand.muted" textAlign="end">
              Conversión
            </Table.ColumnHeader>
            <Table.ColumnHeader color="brand.muted" textAlign="end">
              Descontado
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((r) => (
            <Table.Row key={r.id}>
              <Table.Cell color="white" fontWeight="bold">
                {r.code}
              </Table.Cell>
              <Table.Cell color="white" textAlign="end">
                {r.usedCount}
              </Table.Cell>
              <Table.Cell color="brand.muted" textAlign="end">
                {r.maxUses ?? "—"}
              </Table.Cell>
              <Table.Cell textAlign="end">
                <HStack justify="flex-end">
                  <Text color="white">
                    {r.conversionPercent !== null
                      ? `${r.conversionPercent}%`
                      : "—"}
                  </Text>
                </HStack>
              </Table.Cell>
              <Table.Cell color="white" textAlign="end">
                {formatCurrency(r.discountCents)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
