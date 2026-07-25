import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    body: {
      bg: "#000000",
      color: "brand.light",
      fontFamily: "body",
    },
    "h1, h2, h3, h4, h5, h6": {
      fontFamily: "heading",
      letterSpacing: "tight",
    },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          light: { value: "#f7f8ff" },
          muted: { value: "#aeb8d8" },
          "blue-dark": { value: "#020414" },
          "blue-panel": { value: "#070a22" },
          dark: { value: "#000000" },
          panel: { value: "#0a0a0a" },
          pink: { value: "#ff0f7b" },
          violet: { value: "#7c3cff" },
          blue: { value: "#0969ff" },
          cyan: { value: "#00e5ff" },
          teal: { value: "#00d5b8" },
          orange: { value: "#ff9f1c" },
        },
        utp: {
          noche: { value: "#000000" },
          artico: { value: "#F0F4F5" },
          azul: { value: "#00C2FF" },
          naranja: { value: "#E94E1B" },
          magenta: { value: "#A01060" },
          verde: { value: "#39FF63" },
        },
      },
      fonts: {
        heading: {
          value: `var(--font-good-times), "Good Times", "Montserrat Alternates", "Bebas Neue", system-ui, sans-serif`,
        },
        body: {
          value: `var(--font-montserrat-alternates), "Montserrat Alternates", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`,
        },
      },
    },
    semanticTokens: {
      colors: {
        "brand.light": { value: "{colors.brand.light}" },
        "brand.muted": { value: "{colors.brand.muted}" },
        "brand.dark": { value: "{colors.brand.dark}" },
        "brand.panel": { value: "{colors.brand.panel}" },
        "brand.blue-dark": {value: "{colors.brand.blue-dark}"},
        "brand.blue-panel": {value: "{colors.brand.blue-panel}"},
        "brand.pink": { value: "{colors.brand.pink}" },
        "brand.violet": { value: "{colors.brand.violet}" },
        "brand.blue": { value: "{colors.brand.blue}" },
        "brand.cyan": { value: "{colors.brand.cyan}" },
        "brand.teal": { value: "{colors.brand.teal}" },
        "brand.orange": { value: "{colors.brand.orange}" },
        "utp.noche": { value: "{colors.utp.noche}" },
        "utp.artico": { value: "{colors.utp.artico}" },
        "utp.azul": { value: "{colors.utp.azul}" },
        "utp.naranja": { value: "{colors.utp.naranja}" },
        "utp.magenta": { value: "{colors.utp.magenta}" },
        "utp.verde": { value: "{colors.utp.verde}" },
      },
    },
    textStyles: {
      hero: {
        value: {
          fontFamily: "heading",
          fontWeight: "700",
          fontSize: { base: "3rem", md: "5rem", lg: "6.5rem" },
          lineHeight: "0.95",
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
        },
      },
      sectionTitle: {
        value: {
          fontFamily: "heading",
          fontWeight: "700",
          fontSize: { base: "2rem", md: "3rem", lg: "3.75rem" },
          lineHeight: "1.05",
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
        },
      },
      eyebrow: {
        value: {
          fontFamily: "body",
          fontWeight: "600",
          fontSize: "sm",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        },
      },
      body: {
        value: {
          fontFamily: "body",
          fontWeight: "400",
          fontSize: "md",
          lineHeight: "1.65",
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
