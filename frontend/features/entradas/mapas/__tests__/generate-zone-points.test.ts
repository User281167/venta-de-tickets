import { describe, it, expect } from "vitest";
import {
  generateOccupiedSet,
  buildZonePoints,
} from "../lib/generate-zone-points";
import type { VenueZone } from "../config/venueLayout";

const makeZone = (overrides: Partial<VenueZone> = {}): VenueZone => ({
  key: "test",
  label: "Test",
  description: "",
  accent: "#fff",
  shape: { x: 0, y: 0, width: 100, height: 100 },
  grid: { rows: 4, cols: 4 },
  entrances: [],
  ticketTypeIds: [],
  ...overrides,
});

describe("generateOccupiedSet", () => {
  it("returns empty set when ratio is 0", () => {
    const s = generateOccupiedSet("seed", 100, 0);
    expect(s.size).toBe(0);
  });

  it("returns full set when ratio is 1", () => {
    const s = generateOccupiedSet("seed", 100, 1);
    expect(s.size).toBe(100);
  });

  it("returns ~50% when ratio is 0.5", () => {
    const s = generateOccupiedSet("seed", 1000, 0.5);
    expect(s.size).toBeGreaterThan(450);
    expect(s.size).toBeLessThan(550);
  });

  it("is deterministic for the same seed and ratio", () => {
    const a = generateOccupiedSet("vip-2026", 500, 0.7);
    const b = generateOccupiedSet("vip-2026", 500, 0.7);
    expect([...a].sort()).toEqual([...b].sort());
  });

  it("changes the pattern when seed changes", () => {
    const a = generateOccupiedSet("zone-a", 500, 0.5);
    const b = generateOccupiedSet("zone-b", 500, 0.5);
    expect([...a].sort()).not.toEqual([...b].sort());
  });

  it("clamps ratio below 0", () => {
    expect(generateOccupiedSet("s", 10, -1).size).toBe(0);
  });

  it("clamps ratio above 1", () => {
    expect(generateOccupiedSet("s", 10, 2).size).toBe(10);
  });
});

describe("buildZonePoints", () => {
  it("produces rows*cols points inside the shape", () => {
    const zone = makeZone({
      shape: { x: 10, y: 20, width: 200, height: 100 },
      grid: { rows: 3, cols: 5 },
    });
    const occupied = new Set<number>([0, 5, 14]);
    const pts = buildZonePoints(zone, occupied);
    expect(pts).toHaveLength(15);
    expect(pts[0].occupied).toBe(true);
    expect(pts[5].occupied).toBe(true);
    expect(pts[14].occupied).toBe(true);
    expect(pts[1].occupied).toBe(false);
    for (const p of pts) {
      expect(p.cx).toBeGreaterThanOrEqual(10);
      expect(p.cx).toBeLessThanOrEqual(210);
      expect(p.cy).toBeGreaterThanOrEqual(20);
      expect(p.cy).toBeLessThanOrEqual(120);
    }
  });
});
