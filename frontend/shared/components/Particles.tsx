"use client";

import { useMemo } from "react";
import { generateParticles } from "@/features/sponsor/hooks/particles";

export function Particles({ count = 30 }: { count?: number }) {
  const particles = useMemo(() => generateParticles(count), []);

  return (
    <div className={`!pointer-events-none !absolute !inset-0 !overflow-hidden`}>
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `oklch(0.85 0.2 ${p.hue})`,
            boxShadow: `0 0 ${p.glow}px oklch(0.75 0.25 ${p.hue})`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
