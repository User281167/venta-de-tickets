"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { toPng } from "html-to-image";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
import { toast } from "sonner";
import type { TicketItem } from "../types/ticket.types";

export function TicketQrExpand({ ticket }: { ticket: TicketItem }) {
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!qrContainerRef.current) return;

    try {
      const dataUrl = await toPng(qrContainerRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `entrada-${ticket.ticketCode}.png`;
      link.click();
    } catch {
      toast.error("Error al descargar el QR", {
        description: "Intenta de nuevo más tarde",
      });
    }
  };

  return (
    <Flex direction="column" align="center" gap={4} pt={4}>
      <Box
        ref={qrContainerRef}
        bg="white"
        p={4}
        borderRadius="md"
        textAlign="center"
      >
        {ticket.qrToken ? (
          <>
            <Text color="gray.600" fontSize="xs" fontWeight="bold" mb={2}>
              La Convención 2026
            </Text>
            <QRCodeCanvas value={ticket.qrToken} size={200} level="M" />
            <Text color="gray.600" fontSize="xs" fontFamily="monospace" mt={2}>
              {ticket.ticketCode}
            </Text>
          </>
        ) : (
          <Box
            w={200}
            h={200}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.100"
            borderRadius="md"
          >
            <Text color="gray.400" fontSize="sm">
              QR no disponible
            </Text>
          </Box>
        )}
      </Box>

      {ticket.qrToken && (
        <Button size="sm" colorPalette="orange" onClick={handleDownload}>
          Descargar QR
        </Button>
      )}
    </Flex>
  );
}
