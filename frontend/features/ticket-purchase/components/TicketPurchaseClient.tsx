"use client";

import { useState, useMemo } from "react";
import NextLink from "next/link";
import { IconLayoutGrid, IconMap2 } from "@tabler/icons-react";
import { useActiveTicketTypes } from "../api/ticket-purchase.queries";
import { TicketTypeGrid } from "./TicketTypeGrid";
import { OrderSummary } from "./OrderSummary";
import { PageShell } from "@/shared/components/PageShell";
import { useMyEgresado } from "../hooks/useMyEgresado";
import { useAuth } from "@/providers/AuthProvider";
import { VenueMapContent } from "@/features/entradas/mapas/components/VenueMapContent";

type ViewMode = "grid" | "map";

const PRIMARY_BORDER =
  "linear-gradient(100deg, #ff0f7b 0%, #a78bfa 35%, #00e5ff 65%, #fdba74 100%)";

export function TicketPurchaseClient() {
  const { data: ticketTypes, isLoading, error } = useActiveTicketTypes();
  const userEgresado = useMyEgresado();
  const { session, isLoading: authLoading } = useAuth();
  const isLoggedIn = !authLoading && !!session;
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const showSkeleton = isLoading && viewMode === "grid";
  const showError = !!error && viewMode === "grid";

  const isEmpty = useMemo(
    () => !ticketTypes || ticketTypes.length === 0,
    [ticketTypes],
  );

  if (showSkeleton) {
    return (
      <PageShell
        eyebrow="Compra tus entradas"
        title="La Convención"
        subtitle="Selecciona el tipo de entrada que deseas adquirir. Las unidades son limitadas."
        compact
      >
        <div className="!grid !grid-cols-1 !gap-5 md:!grid-cols-2 lg:!grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="!h-[340px] !rounded-3xl"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
          ))}
        </div>
      </PageShell>
    );
  }

  if (showError) {
    return (
      <PageShell title="La Convención">
        <p className="!text-center !text-white/60">
          {error instanceof Error
            ? error.message
            : "Error al cargar las entradas"}
        </p>
      </PageShell>
    );
  }

  if (isEmpty && viewMode === "grid") {
    return (
      <PageShell title="La Convención">
        <p className="!text-center !text-white/60">
          No hay entradas disponibles
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Compra tus entradas"
      title="La Convención"
      subtitle="Selecciona el tipo de entrada que deseas adquirir. Las unidades son limitadas."
    >
      <div className="!mb-6 !flex !flex-wrap !items-center !justify-between !gap-3">
        <div
          className="!inline-flex !rounded-2xl !border !p-1"
          style={{
            background: "rgba(15, 18, 38, 0.6)",
            borderColor: "rgba(255,255,255,0.1)",
          }}
          role="tablist"
          aria-label="Modo de visualización"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "grid"}
            onClick={() => setViewMode("grid")}
            className="!inline-flex !items-center !gap-2 !rounded-xl !px-4 !py-2 !text-sm !font-bold !transition"
            style={
              viewMode === "grid"
                ? {
                    background: PRIMARY_BORDER,
                    color: "#000",
                  }
                : { color: "rgba(255,255,255,0.7)" }
            }
          >
            <IconLayoutGrid size={16} />
            Lista
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "map"}
            onClick={() => setViewMode("map")}
            className="!inline-flex !items-center !gap-2 !rounded-xl !px-4 !py-2 !text-sm !font-bold !transition"
            style={
              viewMode === "map"
                ? {
                    background: PRIMARY_BORDER,
                    color: "#000",
                  }
                : { color: "rgba(255,255,255,0.7)" }
            }
          >
            <IconMap2 size={16} />
            Mapa
          </button>
        </div>
      </div>

      <div className={viewMode === "grid" ? "!grid !grid-cols-1 !gap-6 lg:!grid-cols-[2fr_1fr] lg:!items-start" : undefined}>
        <div>
          {viewMode === "grid" ? (
            <TicketTypeGrid
              ticketTypes={ticketTypes ?? []}
              userEgresado={userEgresado}
              isLoggedIn={isLoggedIn}
            />
          ) : (
            <VenueMapContent />
          )}
        </div>

        {viewMode === "grid" && (
          <div className="lg:!sticky lg:!top-28">
            <OrderSummary />
          </div>
        )}
      </div>
    </PageShell>
  );
}
