"use client";

import { memo } from "react";
import { Button, Box, Text } from "@chakra-ui/react";
import { IconShoppingCart } from "@tabler/icons-react";

interface CartFabProps {
  itemCount: number;
  onClick: () => void;
}

export const CartFab = memo(function CartFab({
  itemCount,
  onClick,
}: CartFabProps) {
  return (
    <Button
      onClick={onClick}
      position="relative"
      variant="solid"
      bg="rgba(2, 4, 20, 0.85)"
      border="2px solid"
      borderColor="brand.cyan"
      color="brand.light"
      backdropFilter="blur(8px)"
      _hover={{ bg: "rgba(0, 229, 255, 0.15)", transform: "translateY(-2px)" }}
      _active={{ transform: "translateY(0)" }}
      transition="all 0.2s"
      px={3}
      py={2}
      minW="auto"
      h="auto"
    >
      <IconShoppingCart size={20} />
      {itemCount > 0 && (
        <Box
          position="absolute"
          top="-6px"
          right="-6px"
          bg="brand.pink"
          color="white"
          fontSize="xs"
          fontWeight="bold"
          minW="20px"
          h="20px"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          lineHeight="1"
          boxShadow="0 0 6px rgba(255, 15, 123, 0.5)"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </Box>
      )}
    </Button>
  );
});
