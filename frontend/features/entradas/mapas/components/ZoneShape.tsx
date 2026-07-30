"use client";

import { useMemo } from "react";
import type { VenueZone } from "../config/venueLayout";
import type { VenueTicketType } from "../schemas/venue.schema";
import {
  buildZonePoints,
  generateOccupiedSet,
} from "../lib/generate-zone-points";

const COLOR_AVAILABLE = "#22c55e";
const COLOR_OCCUPIED = "#e11d48";

interface ZoneShapeProps {
  zone: VenueZone;
  ticketTypes: VenueTicketType[];
  isHovered: boolean;
  isSelected: boolean;
  disabled: boolean;
  onHover: (zoneKey: string, e: React.MouseEvent) => void;
  onMove: (zoneKey: string, e: React.MouseEvent) => void;
  onLeave: () => void;
  onSelect: (zoneKey: string) => void;
}

export function ZoneShape({
  zone,
  ticketTypes,
  isHovered,
  isSelected,
  disabled,
  onHover,
  onMove,
  onLeave,
  onSelect,
}: ZoneShapeProps) {
  const { shape, grid, accent, entrances, label } = zone;
  const total = grid.rows * grid.cols;

  const occupancyRatio = useMemo(() => {
    const capTotal = ticketTypes.reduce((s, t) => s + t.quantityTotal, 0);
    if (capTotal === 0) return 0;

    const sold = ticketTypes.reduce((s, t) => s + t.quantitySold, 0);
    return sold / capTotal;
  }, [ticketTypes]);

  const occupiedSet = useMemo(
    () => generateOccupiedSet(zone.key, total, occupancyRatio),
    [zone.key, total, occupancyRatio],
  );

  const points = useMemo(
    () => buildZonePoints(zone, occupiedSet),
    [zone, occupiedSet],
  );

  const highlighted = isHovered || isSelected;
  const strokeColor = disabled
    ? "rgba(255,255,255,0.1)"
    : highlighted
      ? accent
      : "rgba(255,255,255,0.18)";

  return (
    <g>
      {points.map((p) => (
        <circle
          key={p.idx}
          cx={p.cx}
          cy={p.cy}
          r={2.6}
          fill={p.occupied ? COLOR_OCCUPIED : COLOR_AVAILABLE}
          opacity={p.occupied ? 0.55 : disabled ? 0.5 : 0.92}
        />
      ))}

      <rect
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        rx={10}
        fill="transparent"
        stroke={strokeColor}
        strokeWidth={highlighted ? 2.5 : 1}
      />

      <text
        x={shape.x + 10}
        y={shape.y - 8}
        fill={highlighted ? accent : "rgba(255,255,255,0.65)"}
        fontSize={13}
        fontWeight={600}
        style={{ pointerEvents: "none" }}
      >
        {label}
      </text>

      {entrances.map((entrance, i) => {
        const len = 12;
        const x1 = entrance.x;
        const y1 = entrance.y;
        let x2 = entrance.x;
        let y2 = entrance.y;
        if (entrance.side === "left") x2 = entrance.x + len;
        if (entrance.side === "right") x2 = entrance.x - len;
        if (entrance.side === "top") y2 = entrance.y + len;
        if (entrance.side === "bottom") y2 = entrance.y - len;
        return (
          <g key={i} style={{ pointerEvents: "none" }}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={highlighted ? accent : "rgba(255,255,255,0.4)"}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </g>
        );
      })}

      <rect
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        rx={10}
        fill="transparent"
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        onMouseEnter={(e) => !disabled && onHover(zone.key, e)}
        onMouseMove={(e) => !disabled && onMove(zone.key, e)}
        onMouseLeave={onLeave}
        onClick={() => !disabled && onSelect(zone.key)}
      />
    </g>
  );
}
