"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Box, Button, HStack, Input, Stack, Text } from "@chakra-ui/react";
import { IconCamera, IconKeyboard, IconRefresh } from "@tabler/icons-react";

interface Props {
  onScan: (text: string) => void;
  paused: boolean;
  onResume: () => void;
}

type ScannerState = "loading" | "scanning" | "denied" | "unsupported" | "error";

export function QrScanner({ onScan, paused, onResume }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const lastScanRef = useRef<string | null>(null);

  const [state, setState] = useState<ScannerState>("loading");
  const [manualMode, setManualMode] = useState(false);
  const [manualValue, setManualValue] = useState("");

  useEffect(() => {
    if (paused || manualMode) return;

    const video = videoRef.current;
    if (!video) return;

    const scanner = new QrScanner(
      video,
      (result) => {
        const text =
          typeof result === "string" ? result : (result.data as string);

        if (text && text !== lastScanRef.current) {
          lastScanRef.current = text;
          onScan(text);
        }
      },
      {
        returnDetailedScanResult: true,
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        onDecodeError: () => {},
      },
    );

    scannerRef.current = scanner;

    QrScanner.hasCamera()
      .then((hasCamera) => {
        if (!hasCamera) {
          scanner.destroy();
          scannerRef.current = null;
          setState("unsupported");
          return;
        }

        return scanner.start();
      })
      .then(() => {
        if (scannerRef.current) setState("scanning");
      })
      .catch((err) => {
        const name = err instanceof Error ? err.name : "";

        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setState("denied");
        } else {
          setState("error");
        }
      });

    return () => {
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [paused, manualMode, onScan]);

  const handleResume = () => {
    lastScanRef.current = null;
    setState("loading");
    onResume();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = manualValue.trim();

    if (value) onScan(value);
  };

  if (manualMode) {
    return (
      <Box
        className="glass-card"
        borderRadius="2xl"
        p={6}
        border="1px solid rgba(255,255,255,0.08)"
        bg="brand.panel"
      >
        <form onSubmit={handleManualSubmit}>
          <Stack gap={4}>
            <HStack gap={2} color="brand.cyan">
              <IconKeyboard size={20} aria-hidden />

              <Text color="white" fontWeight="bold">
                Ingreso manual
              </Text>
            </HStack>

            <Text color="brand.muted" fontSize="sm">
              Pega o digita el contenido del QR para testear sin cámara.
            </Text>

            <Input
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              placeholder="Contenido del QR"
              bg="rgba(0,0,0,0.3)"
              borderColor="rgba(255,255,255,0.16)"
              color="white"
              _placeholder={{ color: "brand.muted" }}
              _focus={{ borderColor: "brand.cyan", boxShadow: "none" }}
            />

            <HStack gap={2}>
              <Button
                type="submit"
                bg="brand.cyan"
                color="brand.dark"
                fontWeight="bold"
                _hover={{ bg: "#00cfe6" }}
                disabled={!manualValue.trim()}
              >
                Escanear
              </Button>

              <Button
                type="button"
                variant="outline"
                color="white"
                borderColor="rgba(255,255,255,0.2)"
                onClick={() => {
                  setManualValue("");
                  setManualMode(false);
                }}
                _hover={{ bg: "rgba(255,255,255,0.06)" }}
              >
                Usar cámara
              </Button>
            </HStack>
          </Stack>
        </form>
      </Box>
    );
  }

  return (
    <Box
      className="glass-card"
      borderRadius="2xl"
      overflow="hidden"
      border="1px solid rgba(255,255,255,0.08)"
      bg="brand.panel"
    >
      <Box position="relative" bg="black" aspectRatio={1} w="full">
        <video
          ref={videoRef}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          playsInline
          muted
        />

        {state === "loading" && (
          <Box
            position="absolute"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="rgba(2,4,20,0.7)"
          >
            <Text color="brand.cyan">Iniciando cámara…</Text>
          </Box>
        )}

        {paused && state === "scanning" && (
          <Box
            position="absolute"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="rgba(2,4,20,0.6)"
            pointerEvents="none"
          >
            <Text color="white" fontWeight="bold">
              Escaneo en pausa
            </Text>
          </Box>
        )}

        {(state === "denied" ||
          state === "unsupported" ||
          state === "error") && (
          <Stack
            position="absolute"
            inset={0}
            align="center"
            justify="center"
            gap={3}
            bg="rgba(2,4,20,0.85)"
            color="white"
            p={6}
            textAlign="center"
          >
            <IconCamera size={36} aria-hidden />

            <Text fontWeight="bold">
              {state === "denied" && "Permiso de cámara denegado"}
              {state === "unsupported" && "No hay cámara disponible"}
              {state === "error" && "No se pudo iniciar la cámara"}
            </Text>

            <Text color="brand.muted" fontSize="sm">
              Usa el ingreso manual para testear sin cámara.
            </Text>
          </Stack>
        )}
      </Box>

      <HStack gap={2} p={4} justify="space-between">
        <Button
          size="sm"
          variant="outline"
          color="white"
          borderColor="rgba(255,255,255,0.2)"
          onClick={() => setManualMode(true)}
          _hover={{ bg: "rgba(255,255,255,0.06)" }}
        >
          <IconKeyboard size={16} />
          Ingreso manual
        </Button>

        {paused && (
          <Button
            size="sm"
            bg="brand.cyan"
            color="brand.dark"
            fontWeight="bold"
            _hover={{ bg: "#00cfe6" }}
            onClick={handleResume}
          >
            <IconRefresh size={16} />
            Escanear otro
          </Button>
        )}
      </HStack>
    </Box>
  );
}
