"use client";

import { motion } from "framer-motion";

interface ZoneTooltipProps {
  title: string;
  available: number;
  total: number;
  x: number;
  y: number;
  accent: string;
}

export function ZoneTooltip({
  title,
  available,
  total,
  x,
  y,
  accent,
}: ZoneTooltipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="!pointer-events-none !absolute !z-10 !rounded-md !border !px-3 !py-2 !text-xs !text-white shadow-lg"
      style={{
        left: x + 14,
        top: y + 10,
        background: "rgba(10, 10, 26, 0.95)",
        borderColor: `${accent}55`,
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="!font-semibold" style={{ color: accent }}>
        {title}
      </div>
      <div className="!text-white/65">
        {total === 0 ? "Zona sin entradas" : `${available} disponibles de ${total}`}
      </div>
    </motion.div>
  );
}
