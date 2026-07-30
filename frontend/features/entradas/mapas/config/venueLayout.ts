export type ZoneShape = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ZoneGrid = {
  rows: number;
  cols: number;
};

export type ZoneEntrance = {
  x: number;
  y: number;
  side: "top" | "bottom" | "left" | "right";
  label?: string;
};

export type VenueZone = {
  key: string;
  label: string;
  description: string;
  accent: string;
  shape: ZoneShape;
  grid: ZoneGrid;
  entrances: ZoneEntrance[];
  ticketTypeIds: string[];
};

export type VenueLayout = {
  viewBox: { width: number; height: number };
  stage: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  };
  zones: VenueZone[];
};

// Placeholder uuids — replace after seed.
// Zones render in muted state while ticketTypeIds are empty.
const PLACEHOLDER = "00000000-0000-0000-0000-000000000000";

export const venueLayout: VenueLayout = {
  viewBox: { width: 720, height: 620 },
  stage: { x: 260, y: 24, width: 200, height: 60, label: "ESCENARIO" },
  zones: [
    {
      key: "vip",
      label: "VIP",
      description:
        "Zona más cercana al escenario, acceso a lounge y barra exclusiva.",
      accent: "#d4af37",
      shape: { x: 210, y: 110, width: 300, height: 110 },
      grid: { rows: 6, cols: 16 },
      entrances: [
        { x: 210, y: 175, side: "left" },
        { x: 510, y: 175, side: "right" },
      ],
      ticketTypeIds: ["6915c724-b4e8-4e06-ad20-2ac6df08b600"],
    },
    {
      key: "plata",
      label: "Plata",
      description:
        "Zona media con vista completa del escenario y acceso general ágil.",
      accent: "#9ca3af",
      shape: { x: 140, y: 240, width: 440, height: 150 },
      grid: { rows: 9, cols: 22 },
      entrances: [
        { x: 140, y: 315, side: "left" },
        { x: 580, y: 315, side: "right" },
      ],
      ticketTypeIds: ["4ca65855-ef7c-47d7-886c-287f0b0e1b12", "5cbbc707-669b-4192-a417-b30dfc92b55a"],
    },
    {
      key: "bronce",
      label: "Bronce",
      description:
        "Zona trasera con entrada accesible y acceso a zonas comunes del evento.",
      accent: "#c07a3e",
      shape: { x: 60, y: 410, width: 600, height: 170 },
      grid: { rows: 10, cols: 28 },
      entrances: [
        { x: 60, y: 495, side: "left" },
        { x: 660, y: 495, side: "right" },
      ],
      ticketTypeIds: ["7a1ca2b7-57ae-4e1f-bc92-06b5defdba13"],
    },
  ],
};
