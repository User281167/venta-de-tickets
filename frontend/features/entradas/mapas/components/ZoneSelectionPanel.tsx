"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconX, IconPlus, IconUsers } from "@tabler/icons-react";
import { useCart } from "@/features/ticket-purchase/hooks/useCart";
import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";
import { formatCurrency } from "@/shared/utils/formats";
import { QuantitySpinner } from "@/shared/components/QuantitySpinner";
import { useMyEgresado } from "@/features/ticket-purchase/hooks/useMyEgresado";
import { useAuth } from "@/providers/AuthProvider";
import type { VenueZone } from "../config/venueLayout";
import type { VenueTicketType } from "../schemas/venue.schema";

interface ZoneSelectionPanelProps {
  zone: VenueZone | null;
  ticketTypes: VenueTicketType[];
  onClose: () => void;
}

function toClientTicketType(v: VenueTicketType): TicketType {
  return {
    id: v.id,
    name: v.name,
    description: v.description,
    price: v.price,
    availableCount: Math.max(0, v.quantityTotal - v.quantitySold),
    maxPerUser: null,
    saleEndsAt: null,
    isSoldOut: v.quantitySold >= v.quantityTotal,
    isActive: v.status === "enabled",
    onlyEgresados: v.onlyEgresados,
    status: v.status,
  };
}

const VIEWPORT = { once: true, margin: "-10% 0px -10% 0px" } as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function ZoneSelectionPanel({
  zone,
  ticketTypes,
  onClose,
}: ZoneSelectionPanelProps) {
  const { items, addItem, increment, decrement, canIncrement, canDecrement } =
    useCart();
  const { user } = useAuth();
  const userEgresado = useMyEgresado();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const zoneTicketTypes = useMemo(() => {
    if (!zone) return [];
    return ticketTypes.filter((t) => zone.ticketTypeIds.includes(t.id));
  }, [zone, ticketTypes]);

  if (!zone) {
    return (
      <motion.aside
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        variants={fadeUp}
        className="!flex !h-full !min-h-[260px] !items-center !justify-center !rounded-3xl !border !border-dashed !p-6 !text-center !text-sm !text-white/55"
        style={{
          background: "rgba(15, 18, 38, 0.45)",
          borderColor: "rgba(255,255,255,0.12)",
        }}
      >
        Haz clic en una zona del mapa para ver los tipos de entrada y la
        disponibilidad.
      </motion.aside>
    );
  }

  const accent = zone.accent;

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key={zone.key}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 12 }}
        transition={{ duration: 0.25 }}
        className="!relative !flex !flex-col !gap-4 !overflow-hidden !rounded-3xl glass !p-5 sm:!p-6"
        style={{
          background: "rgba(15, 18, 38, 0.55)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          backdropFilter: "blur(14px) saturate(140%)",
        }}
      >
        <div
          className="!pointer-events-none !absolute !-right-20 !-top-20 !h-44 !w-44 !rounded-full !opacity-30 !blur-3xl"
          style={{ background: accent }}
          aria-hidden="true"
        />

        <div
          className="!absolute !inset-x-0 !top-0 !h-1"
          style={{
            background: `linear-gradient(90deg, ${accent}, ${accent}55)`,
          }}
        />

        <div className="!relative !flex !items-start !justify-between !gap-3">
          <div>
            <div className="!text-[10px] !font-semibold !uppercase !tracking-[0.18em] !text-white/45">
              Zona
            </div>
            <h3
              className="!text-2xl !font-black !uppercase !tracking-wide"
              style={{ color: accent }}
            >
              {zone.label}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="!rounded-lg !p-1.5 !text-white/55 !transition hover:!bg-white/5 hover:!text-white"
            aria-label="Cerrar panel"
          >
            <IconX size={18} />
          </button>
        </div>

        <p className="!relative !text-sm !leading-relaxed !text-white/65">
          {zone.description}
        </p>

        {zoneTicketTypes.length === 0 ? (
          <div className="!rounded-xl !border !border-white/8 !bg-white/5 !p-4 !text-center !text-xs !text-white/55">
            Aún no hay tipos de entrada asociados a esta zona.
          </div>
        ) : (
          <ul className="!relative !flex !flex-col !gap-3">
            {zoneTicketTypes.map((tt) => {
              const client = toClientTicketType(tt);
              const inCart = items.find((i) => i.ticketTypeId === tt.id);
              const qty = inCart?.quantity ?? 0;
              const isSoldOut = client.isSoldOut;
              const isDisabled = client.status !== "enabled";
              const isEgresadoBlocked =
                client.onlyEgresados &&
                (!user || userEgresado === null || userEgresado === false);
              const blocked = isSoldOut || isDisabled || isEgresadoBlocked;

              return (
                <li
                  key={tt.id}
                  className="!flex !flex-col !gap-3 !rounded-2xl !border !p-4"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: pendingId === tt.id
                      ? `${accent}66`
                      : "rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="!flex !flex-wrap !items-start !justify-between !gap-3">
                    <div className="!min-w-0 !flex-1">
                      <div className="!flex !flex-wrap !items-center !gap-2">
                        <span className="!text-base !font-bold !text-white">
                          {tt.name}
                        </span>
                        {tt.onlyEgresados && (
                          <span
                            className="!inline-flex !items-center !rounded-full !px-2 !py-0.5 !text-[10px] !font-semibold !uppercase !tracking-wider"
                            style={{
                              background: "rgba(167, 139, 250, 0.12)",
                              color: "#c4b5fd",
                              border: "1px solid rgba(167, 139, 250, 0.3)",
                            }}
                          >
                            Solo egresados
                          </span>
                        )}
                      </div>
                      {tt.description && (
                        <p className="!mt-1 !text-xs !text-white/55">
                          {tt.description}
                        </p>
                      )}
                    </div>

                    <div
                      className="!text-right !text-lg !font-black"
                      style={{
                        background: `linear-gradient(90deg, ${accent}, #fff)`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {formatCurrency(tt.price * 100)}
                    </div>
                  </div>

                  <div className="!flex flex-wrap !items-center !justify-between !gap-3">
                    <span className="!inline-flex flex-wrap !items-center !gap-1.5 !text-xs !text-white/55">
                      <IconUsers size={14} />
                      {client.availableCount} disponibles de {tt.quantityTotal}
                    </span>

                    {blocked ? (
                      <span className="!inline-flex !items-center !rounded-lg !border !border-white/10 !bg-white/5 !px-3 !py-1.5 !text-xs !font-bold !text-white/40">
                        {isSoldOut
                          ? "Agotado"
                          : isDisabled
                            ? "No disponible"
                            : "Solo egresados"}
                      </span>
                    ) : qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPendingId(tt.id);
                          addItem(client);
                          setTimeout(() => setPendingId(null), 350);
                        }}
                        className="!inline-flex !items-center !gap-1.5 !rounded-lg !border !px-3 !py-1.5 !text-xs !font-bold !transition hover:!scale-[1.02]"
                        style={{
                          background: `${accent}22`,
                          borderColor: `${accent}66`,
                          color: accent,
                        }}
                      >
                        <IconPlus size={14} />
                        Agregar
                      </button>
                    ) : (
                      <QuantitySpinner
                        quantity={qty}
                        onIncrement={() => increment(tt.id)}
                        onDecrement={() => decrement(tt.id)}
                        canIncrement={canIncrement(tt.id)}
                        canDecrement={canDecrement(tt.id)}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {zoneTicketTypes.length > 1 && (
          <p className="!relative !text-[11px] !text-white/45">
            Esta zona tiene varios tipos de entrada. Selecciona el que prefieras
            antes de continuar al pago.
          </p>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}
