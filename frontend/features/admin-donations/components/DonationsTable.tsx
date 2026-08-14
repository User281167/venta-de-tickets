"use client";

import { Badge, Box, Table, Text } from "@chakra-ui/react";
import { tableCss } from "@/shared/components/tablecss";
import { formatCurrency, formatDate } from "@/shared/utils/formats";
import {
  DONATION_STATE_COLORS,
  DONATION_STATE_LABELS,
  DONATION_ACCOUNT_LABELS,
  type DonationState,
  type DonationAccount,
} from "@/shared/utils/donation-status";
import type { DonationListRow } from "../types";

export function DonationsTable({ donations }: { donations: DonationListRow[] }) {
  return (
    <Box
      w="full"
      minW={0}
      maxW="100%"
      overflowX="auto"
      className="scrollbar-thin"
    >
      <Table.Root css={tableCss} minW="1000px">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="14%">Fecha</Table.ColumnHeader>
            <Table.ColumnHeader w="16%">Donante</Table.ColumnHeader>
            <Table.ColumnHeader w="14%">Empresa</Table.ColumnHeader>
            <Table.ColumnHeader w="20%">Correo</Table.ColumnHeader>
            <Table.ColumnHeader w="12%">Monto</Table.ColumnHeader>
            <Table.ColumnHeader w="12%">Cuenta</Table.ColumnHeader>
            <Table.ColumnHeader w="12%">Estado</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {donations.map((donation) => {
            const stateColor =
              DONATION_STATE_COLORS[donation.state as DonationState] ??
              "#6b7280";
            const stateLabel =
              DONATION_STATE_LABELS[donation.state as DonationState] ??
              donation.state;
            const accountLabel =
              DONATION_ACCOUNT_LABELS[
                donation.account as DonationAccount
              ] ?? donation.account;

            return (
              <Table.Row
                key={donation.id}
                _hover={{ bg: "rgba(255,255,255,0.03)" }}
                transition="background 0.2s ease"
              >
                <Table.Cell>
                  <Text color="brand.muted" fontSize="sm">
                    {formatDate(donation.createdAt)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color="white" fontWeight="bold" fontSize="sm">
                    {donation.fullName ?? "Anónimo"}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color="brand.muted" fontSize="sm">
                    {donation.company ?? "—"}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color="brand.muted" fontSize="sm">
                    {donation.email ?? "—"}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color="white" fontWeight="black" fontSize="sm">
                    {formatCurrency(donation.amountCents)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color="white" fontSize="sm">
                    {accountLabel}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    bg={`${stateColor}18`}
                    border={`1px solid ${stateColor}33`}
                    color={stateColor}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {stateLabel}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
