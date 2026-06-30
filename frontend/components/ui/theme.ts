import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    body: {
      bg: "#F5F5F5",
      color: "#303841",
    },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          light: { value: "#F5F5F5" },
          teal: { value: "#76ABAE" },
          dark: { value: "#303841" },
          orange: { value: "#FF5722" },
        },
      },
    },
    semanticTokens: {
      colors: {
        "accent.default": { value: "#76ABAE" },
        "cta.default": { value: "#FF5722" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
