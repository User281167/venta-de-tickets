export const brandGradient =
  "linear-gradient(90deg, #00C2FF 0%, #A01060 45%, #E94E1B 70%, #39FF63 100%)";

export const brandGradientText = {
  backgroundImage: brandGradient,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
} as const;

export const brandGradientBg = {
  backgroundImage: brandGradient,
} as const;
