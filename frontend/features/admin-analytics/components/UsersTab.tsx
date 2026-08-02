"use client";

import { Box, Heading, SimpleGrid, VStack } from "@chakra-ui/react";
import {
  useLoginActivity,
  useUsersByRole,
  useUsersDailySignups,
} from "../api/analytics.queries";
import { StatusBarChart } from "./charts/FunnelChart";
import { KpiCards } from "./charts/KpiCards";
import { WeeklyLineChart } from "./charts/WeeklyLineChart";
import type { AnalyticsDateRange, RoleBreakdown } from "../schemas/analytics.schema";

type Props = {
  range: AnalyticsDateRange;
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  checker: "Validador",
  client: "Comprador",
};

const STAFF_ROLES = new Set(["super_admin", "admin", "checker"]);

export function UsersTab({ range }: Props) {
  const signups = useUsersDailySignups(range);
  const rolesQuery = useUsersByRole();
  const logins = useLoginActivity(range);
  const roles: RoleBreakdown[] = rolesQuery.data ?? [];

  const totalSignups = signups.data?.reduce((acc, p) => acc + p.value, 0) ?? 0;
  const totalLogins = logins.data?.reduce((acc, p) => acc + p.activeUsers, 0) ?? 0;
  const buyers = roles.find((r) => r.role === "client")?.count ?? 0;
  const staff = roles
    .filter((r) => STAFF_ROLES.has(r.role))
    .reduce((acc, r) => acc + r.count, 0);

  const kpis = [
    {
      label: "Registros (rango)",
      value: signups.data ? String(totalSignups) : "—",
      color: "#00e5ff",
    },
    {
      label: "Compradores activos (rango)",
      value: logins.data ? String(totalLogins) : "—",
      hint: "Usuarios con rol 'client' que crearon tickets",
      color: "#7c3cff",
    },
    {
      label: "Compradores totales",
      value: String(buyers),
      color: "#ff0f7b",
    },
    {
      label: "Staff (admin/checker)",
      value: String(staff),
      color: "#00d5b8",
    },
  ];

  const roleData = roles.map((r) => ({
    status: ROLE_LABELS[r.role] ?? r.role,
    count: r.count,
  }));

  return (
    <VStack align="stretch" gap={6}>
      <KpiCards items={kpis} />

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        <ChartCard title="Registros nuevos por día">
          <WeeklyLineChart
            data={signups.data ?? []}
            isLoading={signups.isLoading}
            isError={signups.isError}
            color="#00e5ff"
            yLabel="Usuarios"
          />
        </ChartCard>

        <ChartCard title="Compradores activos por día">
          <WeeklyLineChart
            data={
              logins.data?.map((p) => ({
                day: p.day,
                label: p.label,
                value: p.activeUsers,
              })) ?? []
            }
            isLoading={logins.isLoading}
            isError={logins.isError}
            color="#7c3cff"
            yLabel="Activos"
          />
        </ChartCard>
      </SimpleGrid>

      <ChartCard title="Distribución por rol">
        <StatusBarChart
          data={roleData}
          isLoading={rolesQuery.isLoading}
          isError={rolesQuery.isError}
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
