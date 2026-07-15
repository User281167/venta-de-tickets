"use client";

import { Box, Grid, HStack, Text } from "@chakra-ui/react";
import {
  IconCheck,
  IconTicket,
  IconTrendingUp,
  IconX,
} from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";
import type { AdminTicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: string | number;
  icon: typeof IconTicket;
  color: string;
  delay: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Box
        className="glass-card"
        borderRadius="xl"
        p={4}
        display="flex"
        alignItems="center"
        gap={4}
        transition="all 0.25s ease"
        _hover={{ borderColor: color, boxShadow: `0 8px 24px ${color}18` }}
      >
        <Box
          w={10}
          h={10}
          borderRadius="xl"
          bg={`${color}15`}
          border={`1px solid ${color}30`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Icon size={22} color={color} />
        </Box>
        <Box>
          <Text color="brand.muted" fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
            {label}
          </Text>
          <Text color="white" fontSize="2xl" fontWeight="black" lineHeight="1.1">
            {value}
          </Text>
        </Box>
      </Box>
    </motion.div>
  );
}

export function TicketTypesStats({
  ticketTypesList,
}: {
  ticketTypesList: AdminTicketType[];
}) {
  const total = ticketTypesList.length;
  const active = ticketTypesList.filter((t) => t.isActive).length;
  const inactive = total - active;
  const sold = ticketTypesList.reduce((sum, t) => sum + t.quantitySold, 0);

  return (
    <Grid templateColumns={{ base: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }} gap={4}>
      <StatCard label="Total" value={total} icon={IconTicket} color="#00e5ff" delay={0} />
      <StatCard label="Activos" value={active} icon={IconCheck} color="#22c55e" delay={0.05} />
      <StatCard label="Inactivos" value={inactive} icon={IconX} color="#ef4444" delay={0.1} />
      <StatCard label="Vendidas" value={sold} icon={IconTrendingUp} color="#ff0f7b" delay={0.15} />
    </Grid>
  );
}
