"use client";

import { IconCheck, IconDots, IconX } from "@tabler/icons-react";
import { Box, IconButton, Menu, Portal } from "@chakra-ui/react";
import type { TicketItem } from "../types/ticket.types";

interface Props {
  ticket: TicketItem;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
}

export function TicketActionsMenu({ ticket, onConfirm, onReject }: Props) {
  if (ticket.status !== "pending_confirmation") return null;

  return (
    <Box position="absolute" top={3} right={3} zIndex={2}>
      <Menu.Root positioning={{ placement: "bottom-end" }}>
        <Menu.Trigger asChild>
          <IconButton
            aria-label="Acciones del ticket"
            size="sm"
            variant="ghost"
            color="brand.muted"
            _hover={{ bg: "rgba(255,255,255,0.08)", color: "white" }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconDots size={18} />
          </IconButton>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content
              bg="brand.panel"
              borderColor="rgba(255,255,255,0.08)"
              borderRadius="xl"
              minW="220px"
              py={1}
              boxShadow="0 16px 40px rgba(0,0,0,0.5)"
            >
              <Menu.Item
                value="confirm"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm(ticket.id);
                }}
                px={3}
                py={2.5}
                cursor="pointer"
                _hover={{ bg: "rgba(0,229,255,0.08)" }}
                color="white"
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Box color="brand.cyan">
                    <IconCheck size={16} />
                  </Box>

                  <Box>
                    <Box fontWeight="medium" fontSize="sm">
                      Confirmar ingreso
                    </Box>

                    <Box color="brand.muted" fontSize="xs">
                      Autoriza al portador del QR
                    </Box>
                  </Box>
                </Box>
              </Menu.Item>

              <Menu.Item
                value="reject"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(ticket.id);
                }}
                px={3}
                py={2.5}
                cursor="pointer"
                _hover={{ bg: "rgba(239,68,68,0.08)" }}
                color="white"
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Box color="red.400">
                    <IconX size={16} />
                  </Box>

                  <Box>
                    <Box fontWeight="medium" fontSize="sm">
                      Rechazar ingreso
                    </Box>

                    <Box color="brand.muted" fontSize="xs">
                      Vuelve el ticket a Pagado
                    </Box>
                  </Box>
                </Box>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  );
}
