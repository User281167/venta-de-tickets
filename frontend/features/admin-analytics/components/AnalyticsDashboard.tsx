"use client";

import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { IconChartBar } from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { DateRangePicker } from "./DateRangePicker";
import { SalesTab } from "./SalesTab";
import { FunnelTab } from "./FunnelTab";
import { UsersTab } from "./UsersTab";
import { RefundsTab } from "./RefundsTab";
import { DiscountsTab } from "./DiscountsTab";
import { DonationsTab } from "./DonationsTab";
import { CheckinTab } from "./CheckinTab";
import { useDateRange } from "../hooks/useDateRange";

const TABS = [
  { key: "sales", label: "Ventas" },
  { key: "funnel", label: "Entradas" },
  { key: "users", label: "Usuarios" },
  { key: "refunds", label: "Reembolsos" },
  // { key: "discounts", label: "Descuentos" },
  { key: "donations", label: "Donaciones" },
  { key: "checkin", label: "Check-in" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function AnalyticsDashboard() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<TabKey>("sales");
  const { range, setRange, reset } = useDateRange(30);

  return (
    <VStack align="stretch" w="full" minW={0} gap={6}>
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack align="stretch" gap={1}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconChartBar size={18} color="#00e5ff" />
            <Text
              color="utp.azul"
              fontSize="sm"
              fontWeight="black"
              textTransform="uppercase"
              letterSpacing="0.15em"
            >
              Administración
            </Text>
          </Box>
          <Heading as="h1" size="2xl" color="white" lineHeight="1.1">
            Analíticas
          </Heading>
          <Text color="brand.muted" maxW="600px">
            Historial por día de ventas, entradas, usuarios, pagos, reembolsos,
            descuentos y check-in.
          </Text>
        </VStack>
      </motion.div>

      <DateRangePicker value={range} onChange={setRange} onReset={reset} />

      <Box display="flex" gap={2} flexWrap="wrap">
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              style={{
                padding: "8px 16px",
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 700,
                border: "1px solid",
                borderColor: isActive
                  ? "#00e5ff"
                  : "rgba(255,255,255,0.12)",
                background: isActive
                  ? "rgba(0,229,255,0.12)"
                  : "rgba(255,255,255,0.04)",
                color: isActive ? "#00e5ff" : "white",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </Box>

      <Box>
        {active === "sales" && <SalesTab range={range} />}
        {active === "funnel" && <FunnelTab range={range} />}
        {active === "users" && <UsersTab range={range} />}
        {active === "refunds" && <RefundsTab range={range} />}
        {/*{active === "discounts" && <DiscountsTab range={range} />}*/}
        {active === "donations" && <DonationsTab range={range} />}
        {active === "checkin" && <CheckinTab />}
      </Box>
    </VStack>
  );
}
