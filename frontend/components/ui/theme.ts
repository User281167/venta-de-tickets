import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    body: {
      bg: "brand.light",
      color: "brand.dark",
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
        "brand.light": { value: "{colors.brand.light}" },
        "brand.teal": { value: "{colors.brand.teal}" },
        "brand.dark": { value: "{colors.brand.dark}" },
        "brand.orange": { value: "{colors.brand.orange}" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
