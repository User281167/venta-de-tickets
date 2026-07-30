import type { VenueZone } from "../config/venueLayout";

function hashString(str: string): number {
  let h = 0;

  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }

  return h;
}

function mulberry32(seed: number): () => number {
  let a = seed;

  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateOccupiedSet(
  seedKey: string,
  totalPoints: number,
  occupancyRatio: number,
): Set<number> {
  const ratio = Math.max(0, Math.min(1, occupancyRatio));
  const occupiedCount = Math.round(totalPoints * ratio);

  if (occupiedCount === 0) return new Set();
  if (occupiedCount >= totalPoints) {
    return new Set(Array.from({ length: totalPoints }, (_, i) => i));
  }

  const rng = mulberry32(hashString(seedKey));
  const indices = Array.from({ length: totalPoints }, (_, i) => i);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return new Set(indices.slice(0, occupiedCount));
}

export type ZonePoint = {
  idx: number;
  cx: number;
  cy: number;
  occupied: boolean;
};

export function buildZonePoints(
  zone: VenueZone,
  occupiedSet: Set<number>,
  padding = 14,
): ZonePoint[] {
  const { shape, grid } = zone;
  const { rows, cols } = grid;
  const total = rows * cols;
  const usableW = shape.width - padding * 2;
  const usableH = shape.height - padding * 2;
  const stepX = cols > 1 ? usableW / (cols - 1) : 0;
  const stepY = rows > 1 ? usableH / (rows - 1) : 0;
  const pts: ZonePoint[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      pts.push({
        idx,
        cx: shape.x + padding + c * stepX,
        cy: shape.y + padding + r * stepY,
        occupied: occupiedSet.has(idx),
      });
    }
  }

  // touch unused param to keep signature stable for future variants
  void total;
  return pts;
}
