"use client";

import {
  IconTicket,
  IconUser,
  IconCircleCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import NextLink from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { TicketType } from "../schemas/ticket-types.schema";
import { formatCurrency } from "@/shared/utils/formats";

interface TicketTypeCardProps {
  ticketType: TicketType;
}

type Status = "inactive" | "soldout" | "low" | "available";

const STATUS_BG: Record<Status, string> = {
  inactive: "rgba(107, 114, 128, 0.18)",
  soldout: "rgba(239, 68, 68, 0.18)",
  low: "rgba(255, 159, 28, 0.18)",
  available: "rgba(57, 255, 99, 0.18)",
};

const STATUS_BORDER: Record<Status, string> = {
  inactive: "rgba(255,255,255,0.12)",
  soldout: "rgba(239, 68, 68, 0.4)",
  low: "rgba(255, 159, 28, 0.4)",
  available: "rgba(57, 255, 99, 0.4)",
};

const STATUS_TEXT: Record<Status, string> = {
  inactive: "rgba(255,255,255,0.6)",
  soldout: "#fca5a5",
  low: "#fdba74",
  available: "#86efac",
};

const TOP_BORDER: Record<Status, string> = {
  inactive: "linear-gradient(90deg, #6b7280, #374151)",
  low: "linear-gradient(90deg, #ff9f1c, #ff0f7b)",
  available: "linear-gradient(90deg, #ff0f7b, #00e5ff)",
  soldout: "linear-gradient(90deg, #ef4444, #6b7280)",
};

const GLOW_BG: Record<Status, string> = {
  inactive: "oklch(0.6 0 0)",
  soldout: "oklch(0.6 0.22 25)",
  low: "oklch(0.78 0.18 45)",
  available: "oklch(0.7 0.22 280)",
};

const PRIMARY_BTN =
  "linear-gradient(100deg, #ff0f7b 0%, #a78bfa 35%, #00e5ff 65%, #fdba74 100%)";

export function TicketTypeCard({ ticketType }: TicketTypeCardProps) {
  const { user } = useAuth();

  const status: Status = !ticketType.isActive
    ? "inactive"
    : ticketType.isSoldOut
      ? "soldout"
      : ticketType.availableCount <= 10
        ? "low"
        : "available";

  const badgeConfig: Record<
    Status,
    { label: string; icon: typeof IconCircleCheck }
  > = {
    inactive: { label: "No disponible", icon: IconAlertCircle },
    soldout: { label: "Agotado", icon: IconAlertCircle },
    low: {
      label: `${ticketType.availableCount} disponibles`,
      icon: IconAlertCircle,
    },
    available: {
      label: `${ticketType.availableCount} disponibles`,
      icon: IconCircleCheck,
    },
  };

  const badge = badgeConfig[status];
  const StatusIcon = badge.icon;
  const priceLabel = formatCurrency(Number(ticketType.price * 100));
  const canBuy = status === "available" || status === "low";

  return (
    <div
      className="!relative !flex !h-full !flex-col !overflow-hidden !rounded-3xl glass !p-6 !transition !duration-300 hover:!-translate-y-1 sm:!p-7"
      style={{
        background: "rgba(15, 18, 38, 0.45)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        backdropFilter: "blur(14px) saturate(140%)",
      }}
    >
      <div
        className="!absolute !inset-x-0 !top-0 !h-1"
        style={{ background: TOP_BORDER[status] }}
      />

      <div
        className="!absolute !left-0 !top-0 !overflow-hidden !z-20"
        style={{ width: 120, height: 120 }}
      >
        <span
          className="!absolute !-left-10 !top-7 !w-44"
          style={{
            transform: "rotate(-40deg)",
            background: "linear-gradient(90deg,#ff0f7b,#a78bfa)",
            padding: "5px 0",
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "#fff",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,.25)",
          }}
        >
          Precio de salida
        </span>
      </div>

      <div
        className="!pointer-events-none !absolute !-right-16 !-top-16 !h-40 !w-40 !rounded-full !opacity-40 !blur-3xl"
        style={{ background: GLOW_BG[status] }}
        aria-hidden="true"
      />

      <div className="!relative !flex !flex-1 !flex-col !gap-5 !pt-2">
        <div className="!flex !items-start !justify-between !gap-3">
          <div
            className="!flex !h-12 !w-12 !items-center !justify-center !rounded-2xl"
            style={{
              background: "rgba(255, 15, 123, 0.12)",
              border: "1px solid rgba(255, 15, 123, 0.3)",
            }}
          >
            <IconTicket size={26} color="#ff0f7b" />
          </div>

          <span
            className="!inline-flex !items-center !gap-1.5 !rounded-full !px-3 !py-1 !text-xs !font-semibold"
            style={{
              background: STATUS_BG[status],
              border: `1px solid ${STATUS_BORDER[status]}`,
              color: STATUS_TEXT[status],
            }}
          >
            <StatusIcon size={14} />
            {badge.label}
          </span>
        </div>

        <div>
          <h3 className="!text-2xl !font-black !uppercase !tracking-wide !text-white">
            {ticketType.name}
          </h3>
          <div
            className="!mt-1 !text-3xl !font-black"
            style={{
              background:
                "linear-gradient(90deg, #ff0f7b 0%, #a78bfa 50%, #00e5ff 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {priceLabel}
          </div>
        </div>

        {ticketType.description && (
          <p className="!text-sm !leading-relaxed !text-white/60">
            {ticketType.description}
          </p>
        )}

        {ticketType.maxPerUser && (
          <div className="!mt-auto !flex !items-center !gap-2 !text-xs !text-white/55">
            <IconUser size={14} />
            <span>Máx. {ticketType.maxPerUser} por persona</span>
          </div>
        )}
      </div>

      <div className="!mt-6">
        {!ticketType.isActive || status === "soldout" || status === "inactive" ? (
          <button
            type="button"
            disabled
            className="!flex !w-full !items-center !justify-center !gap-2 !rounded-xl !border !border-white/10 !bg-white/5 !px-5 !py-3 !text-sm !font-bold !text-white/45"
          >
            <IconTicket size={18} />
            {status === "soldout" ? "Agotado" : "No disponible"}
          </button>
        ) : user ? (
          <NextLink
            href="/entradas"
            className="group !relative !flex !w-full !items-center !justify-center !gap-2 !overflow-hidden !rounded-xl !px-5 !py-3 !text-sm !font-bold !text-black !transition-transform !duration-300 hover:!scale-[1.02]"
            style={{
              background: PRIMARY_BTN,
              boxShadow:
                "0 0 24px oklch(0.65 0.22 300 / 0.35), 0 0 48px oklch(0.7 0.22 200 / 0.2)",
            }}
          >
            <span className="!relative !z-10">Ver ubicación y comprar</span>
            <IconTicket
              size={18}
              className="!relative !z-10 !transition-transform group-hover:!translate-x-0.5 group-hover:!-translate-y-0.5"
            />
            <span
              className="!absolute !inset-0 !-translate-x-full !bg-gradient-to-r !from-transparent !via-white/40 !to-transparent !transition-transform !duration-700 group-hover:!translate-x-full"
              aria-hidden="true"
            />
          </NextLink>
        ) : (
          <NextLink
            href="/login?redirect=/"
            className="!flex !w-full !items-center !justify-center !gap-2 !rounded-xl !border !border-white/15 !bg-white/5 !px-5 !py-3 !text-sm !font-bold !text-white !transition hover:!bg-white/10"
          >
            <IconTicket size={18} />
            Inicia sesión para comprar
          </NextLink>
        )}
        {!user && canBuy && (
          <p className="!mt-2 !text-center !text-[10px] !uppercase !tracking-[0.2em] !text-white/40">
            {ticketType.availableCount} cupos disponibles
          </p>
        )}
      </div>
    </div>
  );
}
