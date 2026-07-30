"use client";

import { useRef, useState, useCallback } from "react";
import type { VenueLayout } from "../config/venueLayout";
import type { VenueTicketType } from "../schemas/venue.schema";
import { ZoneShape } from "./ZoneShape";
import { ZoneTooltip } from "./ZoneTooltip";

interface VenueMapProps {
  layout: VenueLayout;
  ticketTypes: VenueTicketType[];
  selectedKey: string | null;
  onSelect: (zoneKey: string) => void;
  disabledKeys?: Set<string>;
  readOnly?: boolean;
}

type HoverState = { key: string; x: number; y: number } | null;

export function VenueMap({
  layout,
  ticketTypes,
  selectedKey,
  onSelect,
  disabledKeys,
  readOnly = false,
}: VenueMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<HoverState>(null);
  const rafRef = useRef<number | null>(null);

  const ticketTypesByZone = new Map<string, VenueTicketType[]>();
  for (const zone of layout.zones) {
    ticketTypesByZone.set(
      zone.key,
      ticketTypes.filter((t) => zone.ticketTypeIds.includes(t.id)),
    );
  }

  const updateHover = useCallback(
    (zoneKey: string, e: React.MouseEvent) => {
      const container = containerRef.current;

      if (!container) return;

      const bounds = container.getBoundingClientRect();

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setHover({
          key: zoneKey,
          x: e.clientX - bounds.left,
          y: e.clientY - bounds.top,
        });
      });
    },
    [],
  );

  const handleHover = useCallback(
    (zoneKey: string, e: React.MouseEvent) => updateHover(zoneKey, e),
    [updateHover],
  );

  const handleMove = useCallback(
    (zoneKey: string, e: React.MouseEvent) => updateHover(zoneKey, e),
    [updateHover],
  );

  const handleLeave = useCallback(() => setHover(null), []);

  const handleSelect = useCallback(
    (zoneKey: string) => onSelect(zoneKey),
    [onSelect],
  );

  const hoveredZone = hover
    ? layout.zones.find((z) => z.key === hover.key) ?? null
    : null;
  const hoveredTypes = hover
    ? ticketTypesByZone.get(hover.key) ?? []
    : [];
  const hoveredTotal = hoveredTypes.reduce((s, t) => s + t.quantityTotal, 0);
  const hoveredAvailable = hoveredTypes.reduce(
    (s, t) => s + Math.max(0, t.quantityTotal - t.quantitySold),
    0,
  );

  return (
    <div ref={containerRef} className="!relative !w-full">
      <svg
        viewBox={`0 0 ${layout.viewBox.width} ${layout.viewBox.height}`}
        className="!w-full !h-auto !select-none"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Mapa del evento"
        role="img"
      >
        {layout.structures.map((s, i) => (
          <g key={`struct-${i}`}>
            <rect
              x={s.x}
              y={s.y}
              width={s.width}
              height={s.height}
              rx={4}
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.18)"
              strokeDasharray="4 4"
            />
            <text
              x={s.x + s.width / 2}
              y={s.y + s.height / 2}
              fill="rgba(255,255,255,0.4)"
              fontSize={11}
              textAnchor="middle"
              style={{ pointerEvents: "none" }}
            >
              {s.label}
            </text>
          </g>
        ))}

        <rect
          x={layout.stage.x}
          y={layout.stage.y}
          width={layout.stage.width}
          height={layout.stage.height}
          rx={6}
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.25)"
        />
        <text
          x={layout.stage.x + layout.stage.width / 2}
          y={layout.stage.y + layout.stage.height / 2 + 4}
          fill="rgba(255,255,255,0.7)"
          fontSize={12}
          letterSpacing={2}
          textAnchor="middle"
          style={{ pointerEvents: "none" }}
        >
          {layout.stage.label}
        </text>

        {layout.zones
          .filter((zone) => zone.confirmed)
          .map((zone) => (
            <ZoneShape
              key={zone.key}
              zone={zone}
              ticketTypes={ticketTypesByZone.get(zone.key) ?? []}
              isHovered={!readOnly && hover?.key === zone.key}
              isSelected={!readOnly && selectedKey === zone.key}
              disabled={readOnly || (disabledKeys?.has(zone.key) ?? false)}
              onHover={handleHover}
              onMove={handleMove}
              onLeave={handleLeave}
              onSelect={handleSelect}
            />
          ))}
      </svg>

      {!readOnly && hover && hoveredZone && (
        <ZoneTooltip
          title={hoveredZone.label}
          available={hoveredTotal > 0 ? hoveredAvailable : 0}
          total={hoveredTotal}
          x={hover.x}
          y={hover.y}
          accent={hoveredZone.accent}
        />
      )}
    </div>
  );
}
