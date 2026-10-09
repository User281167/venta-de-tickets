type Particle = {
  left: number;
  size: number;
  hue: number;
  glow: number;
  duration: number;
  delay: number;
};

const HUES = [200, 280, 320, 45];

export function generateParticles(count: number): Particle[] {
  let seed = count + 1;
  const rand = (min: number, max: number) => {
    seed = (seed * 48271) % 2147483647;
    return min + ((seed - 1) / 2147483646) * (max - min);
  };

  return Array.from({ length: count }, () => ({
    left: rand(0, 100),
    size: rand(0.6, 3.2),
    hue: HUES[Math.floor(rand(0, HUES.length))],
    glow: rand(3, 12),
    duration: rand(19, 40),
    delay: rand(0, 20),
  }));
}
