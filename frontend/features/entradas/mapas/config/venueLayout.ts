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

export type ZoneSegment = {
  x: number;
  y: number;
  width: number;
  height: number;
  rows: number;
  cols: number;
};

export type ZoneEntrance = {
  x: number;
  y: number;
  side: "top" | "bottom" | "left" | "right";
  label?: string;
};

export type VenueStructure = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

export type VenueZone = {
  key: string;
  label: string;
  description: string;
  accent: string;
  shape: ZoneShape;
  grid: ZoneGrid;
  segments: ZoneSegment[];
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
  structures: VenueStructure[];
  zones: VenueZone[];
};

const PLACEHOLDER = "00000000-0000-0000-0000-000000000000";

// Two-row layout matching the venue plan: each zone (Bronce/Plata/VIP) is
// drawn as TWO physical blocks — a primary block in the main hall and a
// secondary narrower block below — connected visually as one zone.
export const venueLayout: VenueLayout = {
  viewBox: { width: 720, height: 800 },
  stage: { x: 543, y: 305, width: 162, height: 180, label: "ESCENARIO" },
  structures: [
    {
      x: 350,
      y: 40,
      width: 144,
      height: 210,
      label: "Zona técnica / acceso",
    },
  ],
  zones: [
    {
      key: "bronce",
      label: "Bronce",
      description:
        "Zona principal con vista al escenario, acceso general.",
      accent: "#c07a3e",
      shape: { x: 40, y: 280, width: 252, height: 230 },
      grid: { rows: 9, cols: 20 },
      segments: [
        { x: 40, y: 280, width: 252, height: 230, rows: 9, cols: 20 },
        { x: 112, y: 540, width: 171, height: 150, rows: 5, cols: 16 },
      ],
      entrances: [],
      ticketTypeIds: ["4ca65855-ef7c-47d7-886c-287f0b0e1b12", "5cbbc707-669b-4192-a417-b30dfc92b55a"],
      confirmed: true,
    },
    {
      key: "plata",
      label: "Plata",
      description:
        "Fila intermedia con vista completa del escenario. Conexión directa con VIP.",
      accent: "#9ca3af",
      shape: { x: 301, y: 280, width: 144, height: 230 },
      grid: { rows: 9, cols: 12 },
      segments: [
        { x: 301, y: 280, width: 144, height: 230, rows: 9, cols: 12 },
        { x: 292, y: 540, width: 144, height: 150, rows: 5, cols: 12 },
      ],
      entrances: [],
      ticketTypeIds: ["7a1ca2b7-57ae-4e1f-bc92-06b5defdba13"],
      confirmed: true,
    },
    {
      key: "vip",
      label: "VIP",
      description:
        "Fila preferencial directamente frente al escenario, acceso a zona lounge.",
      accent: "#d4af37",
      shape: { x: 454, y: 280, width: 36, height: 230 },
      grid: { rows: 9, cols: 3 },
      segments: [
        { x: 454, y: 280, width: 36, height: 230, rows: 9, cols: 3 },
        { x: 445, y: 540, width: 36, height: 150, rows: 5, cols: 3 },
      ],
      entrances: [],
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
      segments: [],
      entrances: [],
      ticketTypeIds: [],
      confirmed: false,
    },
  ],
};
