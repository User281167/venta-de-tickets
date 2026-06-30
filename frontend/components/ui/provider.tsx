"use client";
import { ChakraProvider } from "@chakra-ui/react";
import EmotionRegistry from "./emotion-registry";
import { system } from "./theme";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </EmotionRegistry>
  );
}
