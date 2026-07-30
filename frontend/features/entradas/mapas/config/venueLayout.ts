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
  confirmed: boolean;
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

const PLACEHOLDER = "00000000-0000-0000-0000-000000000000";

// Horizontal layout (rotated 90° CW from original): seating flows from
// back-of-room (left) to stage (right). Bronce is the largest block, then
// Plata, then VIP immediately in front of the stage.
export const venueLayout: VenueLayout = {
  viewBox: { width: 720, height: 620 },
  stage: { x: 620, y: 220, width: 80, height: 180, label: "ESCENARIO" },
  zones: [
    {
      key: "bronce",
      label: "Bronce",
      description:
        "Zona principal con vista al escenario, acceso general.",
      accent: "#9ca3af",
      shape: { x: 60, y: 70, width: 170, height: 480 },
      grid: { rows: 20, cols: 8 },
      entrances: [
        { x: 60, y: 200, side: "left" },
        { x: 60, y: 420, side: "left" },
      ],
      ticketTypeIds: ["4ca65855-ef7c-47d7-886c-287f0b0e1b12", "5cbbc707-669b-4192-a417-b30dfc92b55a"],
      confirmed: true,
    },
    {
      key: "plata",
      label: "Plata",
      description:
        "Fila intermedia con vista completa del escenario. Conexión directa con VIP.",
      accent: "#7c3cff",
      shape: { x: 260, y: 110, width: 150, height: 400 },
      grid: { rows: 18, cols: 7 },
      entrances: [
        { x: 260, y: 200, side: "left" },
        { x: 260, y: 420, side: "left" },
      ],
      ticketTypeIds: ["7a1ca2b7-57ae-4e1f-bc92-06b5defdba13"],
      confirmed: true,
    },
    {
      key: "vip",
      label: "VIP",
      description:
        "Fila preferencial directamente frente al escenario, acceso a zona lounge.",
      accent: "#d4af37",
      shape: { x: 440, y: 160, width: 140, height: 300 },
      grid: { rows: 14, cols: 6 },
      entrances: [
        { x: 440, y: 240, side: "left" },
        { x: 440, y: 380, side: "left" },
      ],
      ticketTypeIds: ["6915c724-b4e8-4e06-ad20-2ac6df08b600"],
      confirmed: true,
    },
    {
      key: "azul",
      label: "Zona azul",
      description: "Zona auxiliar sin asientos confirmados por el momento.",
      accent: "#3b82f6",
      shape: { x: 0, y: 0, width: 0, height: 0 },
      grid: { rows: 1, cols: 1 },
      entrances: [],
      ticketTypeIds: [],
      confirmed: false,
    },
  ],
};
