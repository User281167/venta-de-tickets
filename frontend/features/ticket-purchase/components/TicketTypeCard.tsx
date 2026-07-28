"use client";

import { memo } from "react";
import { motion, type Variants } from "framer-motion";
import { IconPlus, IconTicket } from "@tabler/icons-react";
import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";
import { formatCurrency } from "@/shared/utils/formats";
import { QuantitySpinner } from "@/shared/components/QuantitySpinner";

interface TicketTypeCardProps {
  ticketType: TicketType;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  canDecrement: boolean;
}

const VIEWPORT = { once: true, margin: "-10% 0px -10% 0px" } as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

const LOW_STOCK_THRESHOLD = 10;

const PRIMARY_BORDER = "linear-gradient(100deg, #ff0f7b, #a78bfa, #00e5ff)";
const GLOW_LOW = "oklch(0.78 0.18 45)";
const GLOW_OK = "oklch(0.7 0.22 280)";
const GLOW_OFF = "oklch(0.6 0 0)";

export const TicketTypeCard = memo(function TicketTypeCard({
  ticketType,
  quantity,
  onIncrement,
  onDecrement,
  canIncrement,
  canDecrement,
}: TicketTypeCardProps) {
  const isSoldOut = ticketType.availableCount <= 0;
  const isLowStock =
    !isSoldOut && ticketType.availableCount <= LOW_STOCK_THRESHOLD;
  const isDisabled = ticketType.status !== "enabled";
  const isInactive = isSoldOut || isDisabled;

  const glow = isInactive ? GLOW_OFF : isLowStock ? GLOW_LOW : GLOW_OK;

  return (
    <motion.article
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={fadeUp}
      custom={0}
      whileHover={isInactive ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={`!relative !flex !h-full !flex-col !overflow-hidden !rounded-3xl glass !p-6 !transition !duration-300 sm:!p-7 ${
        isInactive ? "!opacity-75" : ""
      }`}
      style={{
        background: "rgba(15, 18, 38, 0.45)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        backdropFilter: "blur(14px) saturate(140%)",
      }}
    >
      <div
        className="!absolute !inset-x-0 !top-0 !h-1"
        style={{
          background: isInactive
            ? "linear-gradient(90deg, #6b7280, #374151)"
            : isLowStock
              ? "linear-gradient(90deg, #ff9f1c, #ff0f7b)"
              : PRIMARY_BORDER,
        }}
      />

      <div
        className="!pointer-events-none !absolute !-right-16 !-top-16 !h-40 !w-40 !rounded-full !opacity-40 !blur-3xl"
        style={{ background: glow }}
        aria-hidden="true"
      />

      {isInactive && (
        <div
          className="!absolute !inset-0 !z-10 !flex !items-center !justify-center !backdrop-blur-sm"
          style={{ background: "rgba(2, 4, 20, 0.55)" }}
        >
          <span
            className="!inline-flex !items-center !gap-1.5 !rounded-full !px-4 !py-1.5 !text-xs !font-bold !uppercase !tracking-[0.12em]"
            style={
              isSoldOut
                ? {
                    background: "rgba(239, 68, 68, 0.18)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    color: "#fca5a5",
                  }
                : {
                    background: "rgba(255, 159, 28, 0.18)",
                    border: "1px solid rgba(255, 159, 28, 0.4)",
                    color: "#fdba74",
                  }
            }
          >
            {isSoldOut ? "Agotado" : "No disponible"}
          </span>
        </div>
      )}

      <div className="!relative !flex !flex-1 !flex-col !gap-4 !pt-2">
        <div className="!flex !flex-wrap !items-start !justify-between !gap-4">
          <div className="!flex !flex-1 !flex-col !gap-2">
            <div className="!flex !items-center !gap-2">
              <div
                className="!flex !h-10 !w-10 !items-center !justify-center !rounded-xl"
                style={{
                  background: "rgba(0, 229, 255, 0.1)",
                  border: "1px solid rgba(0, 229, 255, 0.3)",
                }}
              >
                <IconTicket size={20} color="#00e5ff" />
              </div>

              <h3 className="!text-lg !font-black !uppercase !tracking-wide !text-white sm:!text-xl">
                {ticketType.name}
              </h3>
            </div>

            {isLowStock ? (
              <span
                className="!inline-flex !w-fit !items-center !gap-1.5 !rounded-full !px-2.5 !py-1 !text-xs !font-semibold"
                style={{
                  background: "rgba(255, 159, 28, 0.15)",
                  border: "1px solid rgba(255, 159, 28, 0.3)",
                  color: "#fdba74",
                }}
              >
                ¡Solo quedan {ticketType.availableCount}!
              </span>
            ) : !isInactive ? (
              <span
                className="!inline-flex !w-fit !items-center !gap-1.5 !rounded-full !px-2.5 !py-1 !text-xs !font-semibold"
                style={{
                  background: "rgba(34, 197, 94, 0.12)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  color: "#86efac",
                }}
              >
                Disponible
              </span>
            ) : null}
          </div>

          <div className="!text-right">
            <div className="!text-[10px] !font-medium !uppercase !tracking-[0.18em] !text-white/40">
              Por persona
            </div>

            <div
              className="!text-2xl !font-black sm:!text-3xl"
              style={{
                background: PRIMARY_BORDER,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {formatCurrency(Number(ticketType.price) * 100)}
            </div>
          </div>
        </div>

        {ticketType.description && (
          <p className="!text-sm !leading-relaxed !text-white/65">
            {ticketType.description}
          </p>
        )}

        <div
          className="!mt-auto !flex !items-center !justify-between !gap-4 !border-t !pt-4"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <span className="!text-xs !text-white/55">
            {isSoldOut
              ? "No hay unidades disponibles"
              : isDisabled
                ? "No disponible"
                : `${ticketType.availableCount} disponibles`}
          </span>

          {isInactive ? (
            <span className="!inline-flex !items-center !gap-1.5 !rounded-xl !border !border-white/10 !bg-white/5 !px-3 !py-2 !text-xs !font-bold !text-white/40">
              {isSoldOut ? "Agotado" : "No disponible"}
            </span>
          ) : quantity === 0 ? (
            <button
              type="button"
              disabled={!canIncrement}
              onClick={onIncrement}
              className="!inline-flex !items-center !justify-center !gap-1.5 !rounded-xl !border !px-4 !py-2 !text-sm !font-bold !text-[#00e5ff] !transition hover:!bg-[rgba(0,229,255,0.12)] disabled:!cursor-not-allowed disabled:!opacity-40"
              style={{ borderColor: "rgba(0, 229, 255, 0.4)" }}
            >
              <IconPlus size={16} />
              Agregar
            </button>
          ) : (
            <QuantitySpinner
              quantity={quantity}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              canIncrement={canIncrement}
              canDecrement={canDecrement}
            />
          )}
        </div>
      </div>
    </motion.article>
  );
});
