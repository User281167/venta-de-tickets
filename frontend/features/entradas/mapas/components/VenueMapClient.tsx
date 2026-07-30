"use client";

import { PageShell } from "@/shared/components/PageShell";
import { VenueMapContent } from "./VenueMapContent";

export function VenueMapClient() {
  return (
    <PageShell
      eyebrow="Mapa del evento"
      title="Selecciona tu zona"
      subtitle="Pasa el cursor o haz clic en una zona para ver los tipos de entrada y la disponibilidad."
    >
      <VenueMapContent />
    </PageShell>
  );
}
