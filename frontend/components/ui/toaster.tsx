"use client";

import {
  createToaster,
  Toaster as ChakraToaster,
  ToastCloseTrigger,
  ToastDescription,
  ToastRoot,
  ToastTitle,
} from "@chakra-ui/react";

export const toaster = createToaster({
  placement: "top-end",
  overlap: true,
  gap: 16,
});

export function Toaster() {
  return (
    <ChakraToaster toaster={toaster}>
      {(toast) => (
        <ToastRoot>
          <ToastTitle>{toast.title}</ToastTitle>
          <ToastDescription>{toast.description}</ToastDescription>
          <ToastCloseTrigger />
        </ToastRoot>
      )}
    </ChakraToaster>
  );
}
