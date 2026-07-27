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

export type TestimonialColor = "cyan" | "violet" | "magenta" | "blue" | "orange" | "verde";

const ICON_BG: Record<TestimonialColor, { bg: string; border: string; rgb: string }> = {
  cyan: { bg: "rgba(0, 229, 255, 0.18)", border: "rgba(0, 229, 255, 0.45)", rgb: "oklch(0.55 0.24 200)" },
  violet: { bg: "rgba(124, 60, 255, 0.18)", border: "rgba(124, 60, 255, 0.45)", rgb: "oklch(0.55 0.24 320)" },
  magenta: { bg: "rgba(255, 15, 123, 0.18)", border: "rgba(255, 15, 123, 0.45)", rgb: "oklch(0.55 0.24 340)" },
  blue: { bg: "rgba(0, 194, 255, 0.18)", border: "rgba(0, 194, 255, 0.45)", rgb: "oklch(0.55 0.24 230)" },
  orange: { bg: "rgba(255, 159, 28, 0.18)", border: "rgba(255, 159, 28, 0.45)", rgb: "oklch(0.55 0.24 45)" },
  verde: { bg: "rgba(57, 255, 99, 0.18)", border: "rgba(57, 255, 99, 0.45)", rgb: "oklch(0.55 0.24 160)" },
};

const BORDER_COLOR: Record<TestimonialColor, string> = {
  cyan: "rgba(0, 229, 255, 0.4)",
  violet: "rgba(124, 60, 255, 0.4)",
  magenta: "rgba(255, 15, 123, 0.4)",
  blue: "rgba(0, 194, 255, 0.4)",
  orange: "rgba(255, 159, 28, 0.4)",
  verde: "rgba(57, 255, 99, 0.4)",
};

type TestimonialCardProps = {
  icon: ReactNode;
  quote: string;
  author: string;
  color?: TestimonialColor;
  className?: string;
};

export function TestimonialCard({
  icon,
  quote,
  author,
  color = "cyan",
  className = "",
}: TestimonialCardProps) {
  const c = ICON_BG[color];

  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={`!relative !flex !h-full !flex-col !gap-5 !overflow-hidden !rounded-3xl !border glass !p-6 sm:!p-7 ${className}`}
      style={{
        background: "rgba(15, 18, 38, 0.45)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        backdropFilter: "blur(14px) saturate(140%)",
        borderColor: BORDER_COLOR[color],
      }}
    >
      <div
        className="!pointer-events-none !absolute !-right-16 !-top-16 !h-44 !w-44 !rounded-full !opacity-50 !blur-3xl"
        style={{ background: c.rgb }}
        aria-hidden="true"
      />

      <div
        className="!relative !flex !h-12 !w-12 !items-center !justify-center !rounded-2xl !text-white"
        style={{ background: c.bg, border: `1px solid ${c.border}` }}
      >
        {icon}
      </div>

      <p className="!relative !flex-1 !text-base !leading-relaxed !text-white/90 sm:!text-lg">
        &ldquo;{quote}&rdquo;
      </p>

      <p className="!relative !text-sm !font-semibold !text-white/70">
        — <span style={{ color: "rgba(255,255,255,0.95)" }}>{author}</span>
      </p>
    </motion.article>
  );
}
