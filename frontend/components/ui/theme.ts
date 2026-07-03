import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    body: {
      bg: "brand.dark",
      color: "brand.light",
    },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          light: { value: "#f7f8ff" },
          muted: { value: "#aeb8d8" },
          dark: { value: "#020414" },
          panel: { value: "#070a22" },
          pink: { value: "#ff0f7b" },
          violet: { value: "#7c3cff" },
          blue: { value: "#0969ff" },
          cyan: { value: "#00e5ff" },
          teal: { value: "#00d5b8" },
          orange: { value: "#ff9f1c" },
        },
      },
    },
    semanticTokens: {
      colors: {
        "brand.light": { value: "{colors.brand.light}" },
        "brand.muted": { value: "{colors.brand.muted}" },
        "brand.dark": { value: "{colors.brand.dark}" },
        "brand.panel": { value: "{colors.brand.panel}" },
        "brand.pink": { value: "{colors.brand.pink}" },
        "brand.violet": { value: "{colors.brand.violet}" },
        "brand.blue": { value: "{colors.brand.blue}" },
        "brand.cyan": { value: "{colors.brand.cyan}" },
        "brand.teal": { value: "{colors.brand.teal}" },
        "brand.orange": { value: "{colors.brand.orange}" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
