"use client";

import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

const VIEWPORT = { once: true, margin: "-10% 0px -10% 0px" } as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

export type HighlightStatColor =
  | "cyan"
  | "violet"
  | "blue"
  | "magenta"
  | "orange"
  | "verde";

const ICON_BG: Record<HighlightStatColor, { bg: string; border: string; rgb: string }> = {
  cyan: { bg: "rgba(124, 60, 255, 0.18)", border: "rgba(124, 60, 255, 0.4)", rgb: "oklch(0.55 0.24 260)" },
  violet: { bg: "rgba(124, 60, 255, 0.18)", border: "rgba(124, 60, 255, 0.4)", rgb: "oklch(0.55 0.24 320)" },
  blue: { bg: "rgba(0, 229, 255, 0.18)", border: "rgba(0, 229, 255, 0.4)", rgb: "oklch(0.55 0.24 200)" },
  magenta: { bg: "rgba(160, 16, 96, 0.22)", border: "rgba(160, 16, 96, 0.4)", rgb: "oklch(0.55 0.24 340)" },
  orange: { bg: "rgba(255, 159, 28, 0.18)", border: "rgba(255, 159, 28, 0.4)", rgb: "oklch(0.55 0.24 45)" },
  verde: { bg: "rgba(57, 255, 99, 0.18)", border: "rgba(57, 255, 99, 0.4)", rgb: "oklch(0.55 0.24 160)" },
};

type HighlightStatCardProps = {
  icon: ReactNode;
  value: string;
  label: string;
  color?: HighlightStatColor;
};

export function HighlightStatCard({
  icon,
  value,
  label,
  color = "cyan",
}: HighlightStatCardProps) {
  const c = ICON_BG[color];

  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className="!relative !flex !flex-col !items-center !gap-3 !overflow-hidden !rounded-2xl glass !p-5 !text-center sm:!rounded-3xl sm:!p-6"
      style={{
        background: "rgba(15, 18, 38, 0.45)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        backdropFilter: "blur(14px) saturate(140%)",
      }}
    >
      <div
        className="!pointer-events-none !absolute !-right-12 !-top-12 !h-28 !w-28 !rounded-full !opacity-50 !blur-2xl"
        style={{ background: c.rgb }}
        aria-hidden="true"
      />

      <div
        className="!relative !flex !h-10 !w-10 !items-center !justify-center !rounded-2xl sm:!h-12 sm:!w-12"
        style={{ background: c.bg, border: `1px solid ${c.border}` }}
      >
        {icon}
      </div>

      <div className="!relative">
        <p
          className="!text-2xl !font-black sm:!text-3xl"
          style={{
            background:
              "linear-gradient(100deg, #7dd3fc 0%, #a78bfa 50%, #f0abfc 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {value}
        </p>
        <p className="!mt-1 !text-sm !text-white/60">{label}</p>
      </div>
    </motion.article>
  );
}
