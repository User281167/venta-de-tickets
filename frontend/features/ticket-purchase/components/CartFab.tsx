"use client";

import { memo } from "react";
import { Box } from "@chakra-ui/react";
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
    <button
      type="button"
      onClick={onClick}
      aria-label="Carrito"
      className="!relative !inline-flex !items-center !justify-center !rounded-full !border !border-white/10 !bg-white/[0.04] !p-2 !text-white/85 !transition hover:!bg-white/10 hover:!text-white"
    >
      <IconShoppingCart size={18} />

      <Box
        position="absolute"
        top="-4px"
        right="-4px"
        bg="brand.pink"
        color="white"
        fontSize="10px"
        fontWeight="bold"
        minW="18px"
        h="18px"
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        lineHeight="1"
        px="4px"
        boxShadow={
          itemCount > 0 ? "0 0 6px rgba(255, 15, 123, 0.5)" : undefined
        }
        visibility={itemCount > 0 ? "visible" : "hidden"}
      >
        {itemCount > 99 ? "99+" : itemCount}
      </Box>
    </button>
  );
});
