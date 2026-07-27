"use client";

import { memo } from "react";
import { IconMinus, IconPlus } from "@tabler/icons-react";

interface QuantitySpinnerProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  canDecrement: boolean;
}

export const QuantitySpinner = memo(function CartQuantitySpinner({
  quantity,
  onIncrement,
  onDecrement,
  canIncrement,
  canDecrement,
}: QuantitySpinnerProps) {
  return (
    <div
      className="!inline-flex !items-center !overflow-hidden !rounded-xl !border"
      style={{ borderColor: "rgba(255,255,255,0.16)" }}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={!canDecrement}
        className="!flex !h-10 !w-10 !items-center !justify-center !text-white !transition hover:!bg-white/10 disabled:!cursor-not-allowed disabled:!opacity-40"
        style={{ background: "rgba(255,255,255,0.03)" }}
      >
        <IconMinus size={16} />
      </button>

      <span
        className="!flex !h-10 !w-12 !items-center !justify-center !text-base !font-black !text-white"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderLeft: "1px solid rgba(255,255,255,0.16)",
          borderRight: "1px solid rgba(255,255,255,0.16)",
        }}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        disabled={!canIncrement}
        className="!flex !h-10 !w-10 !items-center !justify-center !text-white !transition hover:!bg-white/10 disabled:!cursor-not-allowed disabled:!opacity-40"
        style={{ background: "rgba(255,255,255,0.03)" }}
      >
        <IconPlus size={16} />
      </button>
    </div>
  );
});
