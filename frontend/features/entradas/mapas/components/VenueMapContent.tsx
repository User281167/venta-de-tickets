"use client";

import { useMemo, useState } from "react";
import { IconMap2 } from "@tabler/icons-react";
import { OrderSummary } from "@/features/ticket-purchase/components/OrderSummary";
import { venueLayout, type VenueLayout } from "../config/venueLayout";
import { useVenueTicketTypes } from "../api/venue.queries";
import { VenueMap } from "./VenueMap";
import { ZoneSelectionPanel } from "./ZoneSelectionPanel";
import { ZoneLegend } from "./ZoneLegend";
import { Text } from "@chakra-ui/react";

interface VenueMapContentProps {
  hideOrderSummary?: boolean;
}

export function VenueMapContent({
  hideOrderSummary = false,
}: VenueMapContentProps = {}) {
  const { data: ticketTypes, isLoading, error } = useVenueTicketTypes();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const safeTicketTypes = ticketTypes ?? [];

  const layout: VenueLayout = useMemo(() => {
    const idsByZona: Record<string, string[]> = {
      bronce: [],
      plata: [],
      vip: [],
    };

    for (const tt of safeTicketTypes) {
      if (tt.zona && idsByZona[tt.zona]) {
        idsByZona[tt.zona].push(tt.id);
      }
    }

    return {
      ...venueLayout,
      zones: venueLayout.zones.map((z) =>
        z.key in idsByZona ? { ...z, ticketTypeIds: idsByZona[z.key] } : z,
      ),
    };
  }, [safeTicketTypes]);

  const selectedZone = useMemo(
    () => layout.zones.find((z) => z.key === selectedKey) ?? null,
    [layout, selectedKey],
  );

  if (isLoading) {
    return (
      <div
        className="!h-[420px] !w-full !rounded-3xl"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}
      />
    );
  }

  if (error) {
    return (
      <p className="!text-center !text-white/60">
        {error instanceof Error ? error.message : "Error al cargar las zonas"}
      </p>
    );
  }

  return (
    <div className="!flex !w-full !flex-col !gap-6 lg:!flex-row lg:!items-start">
      <div
        className="!flex-1 !rounded-3xl glass !p-4 sm:!p-6"
        style={{
          background: "rgba(15, 18, 38, 0.45)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          backdropFilter: "blur(14px) saturate(140%)",
        }}
      >
        <div className="!mb-4 !flex !items-center !gap-2 !text-white/85">
          <span
            className="!flex !h-9 !w-9 !items-center !justify-center !rounded-xl"
            style={{
              background: "rgba(0, 229, 255, 0.1)",
              border: "1px solid rgba(0, 229, 255, 0.3)",
            }}
          >
            <IconMap2 size={18} color="#00e5ff" />
          </span>
          <h2 className="!text-sm !font-semibold !uppercase !tracking-[0.18em] !text-white/85">
            Mapa del evento
          </h2>
        </div>

        <Text className="!text-sm !text-white/40">
           Todas las entradas tienen acceso completo a todos los espacios de la convención, la variación es en la ubicación.
        </Text>

        <VenueMap
          layout={layout}
          ticketTypes={safeTicketTypes}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
        />

        <div className="!mt-4 !flex !flex-wrap !items-center !justify-between !gap-3">
          <ZoneLegend />
          <span className="!text-[11px] !text-white/40">
            Los puntos representan la disponibilidad proporcional de la zona.
          </span>
        </div>
      </div>

      <div className="!flex !w-full !flex-col !gap-4 lg:!w-[360px] lg:!shrink-0">
        <ZoneSelectionPanel
          zone={selectedZone}
          ticketTypes={safeTicketTypes}
          onClose={() => setSelectedKey(null)}
        />
        {!hideOrderSummary && <OrderSummary hideComprar={false} />}
      </div>
    </div>
  );
}
