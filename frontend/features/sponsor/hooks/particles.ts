type Particle = {
  left: number;
  size: number;
  hue: number;
  glow: number;
  duration: number;
  delay: number;
};

const HUES = [200, 280, 320, 45];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    left: rand(0, 100),
    size: rand(0.6, 3.2),
    hue: pick(HUES),
    glow: rand(3, 12),
    duration: rand(19, 40),
    delay: rand(0, 20),
  }));
}
