"use client";

import {
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  IconAlertCircle,
  IconShoppingCartX,
  IconLockAccess,
  IconServerOff,
  IconReceiptOff,
} from "@tabler/icons-react";

export type CheckoutErrorCode =
  | "SOLD_OUT"
  | "MAX_PER_USER_EXCEEDED"
  | "TICKET_TYPE_NOT_AVAILABLE"
  | "UNAUTHORIZED"
  | "INTERNAL_ERROR"
  | "NETWORK_ERROR";

interface CheckoutErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: CheckoutErrorCode | null;
  message?: string;
  onRetry?: () => void;
}

interface ErrorPresentation {
  title: string;
  description: string;
  icon: typeof IconAlertCircle;
  color: string;
  primaryLabel: string;
}

const PRESENTATION: Record<CheckoutErrorCode, ErrorPresentation> = {
  SOLD_OUT: {
    title: "Entradas agotadas",
    description: "Una o más entradas de tu carrito se agotaron mientras comprabas. Ajusta las cantidades e inténtalo de nuevo.",
    icon: IconShoppingCartX,
    color: "#f59e0b",
    primaryLabel: "Ajustar carrito",
  },
  MAX_PER_USER_EXCEEDED: {
    title: "Límite por usuario excedido",
    description: "Has alcanzado el máximo permitido de entradas para uno o más tipos. Reduce las cantidades para continuar.",
    icon: IconReceiptOff,
    color: "#f59e0b",
    primaryLabel: "Ajustar carrito",
  },
  TICKET_TYPE_NOT_AVAILABLE: {
    title: "Entradas no disponibles",
    description: "Una o más entradas de tu carrito ya no están disponibles. Te recomendamos revisar la selección.",
    icon: IconShoppingCartX,
    color: "#f59e0b",
    primaryLabel: "Ajustar carrito",
  },
  UNAUTHORIZED: {
    title: "Sesión expirada",
    description: "Tu sesión expiró. Inicia sesión nuevamente para completar el pago.",
    icon: IconLockAccess,
    color: "#ef4444",
    primaryLabel: "Iniciar sesión",
  },
  INTERNAL_ERROR: {
    title: "Error al procesar el pago",
    description: "Tuvimos un problema al procesar tu pago. Inténtalo de nuevo en unos segundos.",
    icon: IconServerOff,
    color: "#ef4444",
    primaryLabel: "Reintentar",
  },
  NETWORK_ERROR: {
    title: "Sin conexión",
    description: "No pudimos comunicarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.",
    icon: IconServerOff,
    color: "#ef4444",
    primaryLabel: "Reintentar",
  },
};

const FALLBACK: ErrorPresentation = {
  title: "Algo salió mal",
  description: "No pudimos completar la operación. Inténtalo de nuevo.",
  icon: IconAlertCircle,
  color: "#ef4444",
  primaryLabel: "Reintentar",
};

export function CheckoutErrorDialog({
  open,
  onOpenChange,
  code,
  message,
  onRetry,
}: CheckoutErrorDialogProps) {
  const presentation = (code && PRESENTATION[code]) || FALLBACK;
  const Icon = presentation.icon;

  const handlePrimary = () => {
    if (onRetry) onRetry();
    onOpenChange(false);
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      size={{ base: "xs", md: "sm" }}
    >
      <DialogBackdrop bg="rgba(0,0,0,0.75)" backdropFilter="blur(4px)" />
      <DialogPositioner>
        <DialogContent
          bg="brand.panel"
          border="1px solid rgba(255,255,255,0.12)"
          borderRadius="2xl"
          boxShadow="0 24px 80px rgba(0,0,0,0.7)"
          color="white"
        >
          <DialogHeader>
            <DialogTitle color="white" fontSize="xl">
              {presentation.title}
            </DialogTitle>
            <DialogCloseTrigger
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
            />
          </DialogHeader>

          <DialogBody>
            <VStack align="stretch" gap={3}>
              <HStack
                gap={3}
                p={3}
                borderRadius="xl"
                bg={`${presentation.color}15`}
                border={`1px solid ${presentation.color}40`}
              >
                <Icon size={28} color={presentation.color} />
                <Text color="white" fontSize="sm" lineHeight="1.6">
                  {message ?? presentation.description}
                </Text>
              </HStack>
            </VStack>
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              color="white"
              borderColor="rgba(255,255,255,0.16)"
              borderRadius="xl"
              _hover={{ bg: "rgba(255,255,255,0.06)" }}
            >
              Cerrar
            </Button>

            <Button
              bg="brand.cyan"
              color="brand.dark"
              fontWeight="black"
              borderRadius="xl"
              onClick={handlePrimary}
              _hover={{ opacity: 0.9, transform: "translateY(-1px)" }}
              transition="all 0.2s ease"
            >
              {presentation.primaryLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
