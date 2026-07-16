"use client";

import { useState, useCallback } from "react";
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTitle,
  Button,
  Flex,
  Separator,
  Text,
  HStack,
  Box,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { IconShoppingCart, IconTicket, IconArrowRight, IconTrash, IconX } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { CartItemRow } from "./CartItemRow";
import { ClearCartDialog } from "./ClearCartDialog";
import { formatCurrency } from "@/shared/utils/formats";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const {
    items,
    increment,
    decrement,
    removeItem,
    clearCart,
    subtotalCents,
    canIncrement,
    canDecrement,
  } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleBuy = () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    router.push("/checkout");
  };

  const handleIncrement = (ticketTypeId: string) => {
    increment(ticketTypeId);
  };

  const handleDecrement = (ticketTypeId: string) => {
    decrement(ticketTypeId);
  };

  const handleClear = useCallback(() => {
    clearCart();
  }, [clearCart]);

  const totalTickets = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      <DrawerRoot
        open={open}
        onOpenChange={({ open: isOpen }) => {
          if (!isOpen) onClose();
        }}
        size="md"
      >
        <DrawerBackdrop bg="rgba(0,0,0,0.6)" backdropFilter="blur(4px)" />
        <DrawerPositioner>
          <DrawerContent
            bg="brand.panel"
            color="white"
            borderLeft="1px solid rgba(255,255,255,0.08)"
          >
            <DrawerHeader
              borderBottom="1px solid"
              borderColor="rgba(255,255,255,0.08)"
              py={5}
            >
              <HStack gap={3}>
                <Box p={2} borderRadius="xl" bg="rgba(124,60,255,0.12)">
                  <IconShoppingCart size={22} color="#7c3cff" />
                </Box>
                <Box>
                  <DrawerTitle fontSize="xl" fontWeight="black" color="white">
                    Tu carrito
                  </DrawerTitle>
                  <Text fontSize="xs" color="brand.muted">
                    {totalTickets} entrada{totalTickets !== 1 ? "s" : ""}
                  </Text>
                </Box>
              </HStack>
            </DrawerHeader>

            <DrawerBody p={{ base: 4, md: 5 }}>
              {items.length === 0 ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  h="300px"
                  color="brand.muted"
                  textAlign="center"
                  gap={4}
                >
                  <Box p={4} borderRadius="full" bg="rgba(255,255,255,0.04)">
                    <IconTicket size={40} color="brand.muted" />
                  </Box>
                  <VStack gap={1}>
                    <Text fontSize="md" fontWeight="semibold" color="white">
                      No has seleccionado entradas
                    </Text>
                    <Text fontSize="sm" color="brand.muted">
                      Explora las opciones disponibles y agrégalas aquí
                    </Text>
                  </VStack>
                </Flex>
              ) : (
                items.map((item) => (
                  <CartItemRow
                    key={item.ticketTypeId}
                    item={item}
                    onIncrement={() => handleIncrement(item.ticketTypeId)}
                    onDecrement={() => handleDecrement(item.ticketTypeId)}
                    onRemove={() => removeItem(item.ticketTypeId)}
                    canIncrement={canIncrement(item.ticketTypeId)}
                    canDecrement={canDecrement(item.ticketTypeId)}
                  />
                ))
              )}
            </DrawerBody>

            {items.length > 0 && (
              <>
                <Separator borderColor="rgba(255,255,255,0.08)" />

                <DrawerFooter
                  borderTop="1px solid"
                  borderColor="rgba(255,255,255,0.08)"
                  p={{ base: 4, md: 5 }}
                >
                  <Flex direction="column" w="full" gap={4}>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="md" fontWeight="black" color="white">
                        Total
                      </Text>
                      <Text
                        fontSize="2xl"
                        fontWeight="black"
                        color="brand.cyan"
                        lineHeight="1"
                      >
                        {formatCurrency(subtotalCents * 100)}
                      </Text>
                    </Flex>

                    <Button
                      w="full"
                      disabled={items.length === 0}
                      onClick={handleBuy}
                      border="1px solid transparent"
                      bg={`
                        linear-gradient(#020414, #020414) padding-box,
                        linear-gradient(90deg, #ff0f7b, #00e5ff) border-box
                      `}
                      color="white"
                      fontWeight="black"
                      fontSize="md"
                      borderRadius="xl"
                      h="48px"
                      _hover={{
                        transform: items.length > 0 ? "translateY(-2px)" : undefined,
                        boxShadow:
                          items.length > 0
                            ? "0 0 24px rgba(0,229,255,0.35)"
                            : undefined,
                      }}
                      _active={{
                        transform: items.length > 0 ? "translateY(0)" : undefined,
                      }}
                      _disabled={{
                        opacity: 0.4,
                        cursor: "not-allowed",
                      }}
                      transition="all 0.2s ease"
                      opacity={items.length === 0 ? 0.5 : 1}
                    >
                      <HStack gap={2}>
                        <Text>COMPRAR</Text>
                        <IconArrowRight size={18} />
                      </HStack>
                    </Button>

                    <Button
                      w="full"
                      variant="ghost"
                      color="red.400"
                      borderRadius="xl"
                      h="40px"
                      _hover={{ bg: "rgba(239,68,68,0.1)" }}
                      onClick={() => setShowClearDialog(true)}
                    >
                      <HStack gap={2}>
                        <IconTrash size={16} />
                        <Text fontSize="sm" fontWeight="semibold">
                          Vaciar carrito
                        </Text>
                      </HStack>
                    </Button>
                  </Flex>
                </DrawerFooter>
              </>
            )}

            <DrawerCloseTrigger
              top={4}
              right={4}
              p={2}
              borderRadius="xl"
              color="brand.muted"
              bg="rgba(255,255,255,0.04)"
              _hover={{ color: "white", bg: "rgba(255,255,255,0.12)" }}
            >
              <IconX size={20} />
            </DrawerCloseTrigger>
          </DrawerContent>
        </DrawerPositioner>
      </DrawerRoot>

      <ClearCartDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleClear}
      />
    </>
  );
}
