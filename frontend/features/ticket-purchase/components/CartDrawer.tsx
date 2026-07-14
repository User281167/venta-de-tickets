"use client";

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
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { CartItemRow } from "./CartItemRow";
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
    subtotalCents,
    canIncrement,
    canDecrement,
  } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleBuy = () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    router.push("/checkout");
  };

  const handleIncrement = (ticketTypeId: string) => {
    if (items.find((i) => i.ticketTypeId === ticketTypeId)) {
      increment(ticketTypeId);
    }
  };

  const handleDecrement = (ticketTypeId: string) => {
    const item = items.find((i) => i.ticketTypeId === ticketTypeId);
    if (!item) return;
    if (item.quantity <= 1) {
      removeItem(ticketTypeId);
    } else {
      decrement(ticketTypeId);
    }
  };

  return (
    <DrawerRoot
      open={open}
      onOpenChange={({ open: isOpen }) => {
        if (!isOpen) onClose();
      }}
      size="md"
    >
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent bg="brand.panel" color="brand.light">
          <DrawerHeader
            borderBottom="1px solid"
            borderColor="rgba(174, 184, 216, 0.12)"
          >
            <DrawerTitle fontSize="xl" fontWeight="bold">
              Tu carrito
            </DrawerTitle>
          </DrawerHeader>

          <DrawerBody p={4}>
            {items.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                h="200px"
                color="brand.muted"
              >
                <Text fontSize="md" textAlign="center">
                  No has seleccionado entradas
                </Text>
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

          <Separator borderColor="rgba(174, 184, 216, 0.12)" />

          <DrawerFooter
            borderTop="1px solid"
            borderColor="rgba(174, 184, 216, 0.12)"
          >
            <Flex direction="column" w="full" gap={3}>
              <Flex justify="space-between" align="center">
                <Text fontSize="md" fontWeight="bold">
                  Total
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="brand.cyan">
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
                fontWeight="bold"
                fontSize="md"
                _hover={{
                  transform: items.length > 0 ? "translateY(-1px)" : undefined,
                  boxShadow:
                    items.length > 0
                      ? "0 0 20px rgba(0,229,255,0.3)"
                      : undefined,
                }}
                _active={{
                  transform: items.length > 0 ? "translateY(0)" : undefined,
                }}
                transition="all 0.2s"
                opacity={items.length === 0 ? 0.4 : 1}
                cursor={items.length === 0 ? "not-allowed" : "pointer"}
              >
                COMPRAR
              </Button>
            </Flex>
          </DrawerFooter>

          <DrawerCloseTrigger
            color="brand.muted"
            _hover={{ color: "brand.light" }}
          />
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  );
}
