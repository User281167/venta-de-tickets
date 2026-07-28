"use client";

import { useActiveTicketTypes } from "../api/ticket-purchase.queries";
import { TicketTypeGrid } from "./TicketTypeGrid";
import { OrderSummary } from "./OrderSummary";
import { PageShell } from "@/shared/components/PageShell";
import { useMyEgresado } from "../hooks/useMyEgresado";
import { useAuth } from "@/providers/AuthProvider";

export function TicketPurchaseClient() {
  const { data: ticketTypes, isLoading, error } = useActiveTicketTypes();
  const userEgresado = useMyEgresado();
  const { session, isLoading: authLoading } = useAuth();
  const isLoggedIn = !authLoading && !!session;

  if (isLoading) {
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

  if (error) {
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

  if (!ticketTypes || ticketTypes.length === 0) {
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
      <div className="!grid !grid-cols-1 !gap-6 lg:!grid-cols-[2fr_1fr] lg:!items-start">
        <div>
          <TicketTypeGrid
            ticketTypes={ticketTypes}
            userEgresado={userEgresado}
            isLoggedIn={isLoggedIn}
          />
        </div>

        <div className="lg:!sticky lg:!top-28">
          <OrderSummary />
        </div>
      </div>
    </PageShell>
  );
}
