"use client";

import { useMemo } from "react";
import type { VenueZone } from "../config/venueLayout";
import type { VenueTicketType } from "../schemas/venue.schema";
import {
  buildSegmentPoints,
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

function ZoneSegmentView({
  zone,
  segment,
  segmentIndex,
  occupancyRatio,
  highlighted,
  disabled,
  onHover,
  onMove,
  onLeave,
  onSelect,
}: {
  zone: VenueZone;
  segment: VenueZone["segments"][number];
  segmentIndex: number;
  occupancyRatio: number;
  highlighted: boolean;
  disabled: boolean;
  onHover: (zoneKey: string, e: React.MouseEvent) => void;
  onMove: (zoneKey: string, e: React.MouseEvent) => void;
  onLeave: () => void;
  onSelect: (zoneKey: string) => void;
}) {
  const total = segment.rows * segment.cols;

  const occupiedSet = useMemo(
    () =>
      generateOccupiedSet(
        `${zone.key}::seg${segmentIndex}`,
        total,
        occupancyRatio,
      ),
    [zone.key, segmentIndex, total, occupancyRatio],
  );

  const points = useMemo(
    () => buildSegmentPoints(segment, occupiedSet),
    [segment, occupiedSet],
  );

  return (
    <g>
      {points.map((p) => (
        <circle
          key={p.idx}
          cx={p.cx}
          cy={p.cy}
          r={2.4}
          fill={p.occupied ? COLOR_OCCUPIED : COLOR_AVAILABLE}
          opacity={p.occupied ? 0.55 : disabled ? 0.5 : 0.9}
        />
      ))}

      <rect
        x={segment.x}
        y={segment.y}
        width={segment.width}
        height={segment.height}
        rx={6}
        fill="transparent"
        stroke={
          highlighted
            ? zone.accent
            : disabled
              ? "rgba(255,255,255,0.1)"
              : "rgba(255,255,255,0.18)"
        }
        strokeWidth={highlighted ? 2.5 : 1}
      />

      {highlighted && (
        <rect
          x={segment.x}
          y={segment.y}
          width={segment.width}
          height={segment.height}
          rx={6}
          fill={zone.accent}
          opacity={0.08}
          style={{ pointerEvents: "none" }}
        />
      )}

      <rect
        x={segment.x}
        y={segment.y}
        width={segment.width}
        height={segment.height}
        rx={6}
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
  const { label, accent, segments } = zone;

  const occupancyRatio = useMemo(() => {
    const capTotal = ticketTypes.reduce((s, t) => s + t.quantityTotal, 0);
    if (capTotal === 0) return 0;
    const sold = ticketTypes.reduce((s, t) => s + t.quantitySold, 0);
    return sold / capTotal;
  }, [ticketTypes]);

  const highlighted = isHovered || isSelected;
  const isPending = !zone.confirmed;
  const segmentsToRender = isPending ? [] : segments;

  if (segments.length === 0) {
    return null;
  }

  const firstSegment = segments[0];

  return (
    <g>
      {segmentsToRender.map((segment, i) => (
        <ZoneSegmentView
          key={i}
          zone={zone}
          segment={segment}
          segmentIndex={i}
          occupancyRatio={occupancyRatio}
          highlighted={highlighted}
          disabled={disabled}
          onHover={onHover}
          onMove={onMove}
          onLeave={onLeave}
          onSelect={onSelect}
        />
      ))}

      <text
        x={firstSegment.x + 8}
        y={firstSegment.y - 8}
        fill={highlighted ? accent : "rgba(255,255,255,0.65)"}
        fontSize={13}
        fontWeight={600}
        style={{ pointerEvents: "none" }}
      >
        {label}
        {isPending && " (próximamente)"}
      </text>
    </g>
  );
}
