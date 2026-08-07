"use client";

import NextImage from "next/image";
import { useMemo } from "react";
import { generateParticles } from "@/features/sponsor/hooks/particles";

const HERO_BG = "/assets/hero-aurora.jpg";

const AURORA_BLOBS = [
  {
    style: {
      width: "60vw",
      height: "60vw",
      top: "-10vw",
      left: "-10vw",
      background:
        "radial-gradient(circle, oklch(0.6 0.24 260 / 0.55), transparent 60%)",
      animationDelay: "0s",
    },
  },
  {
    style: {
      width: "55vw",
      height: "55vw",
      top: "10vh",
      right: "-15vw",
      background:
        "radial-gradient(circle, oklch(0.65 0.26 330 / 0.5), transparent 60%)",
      animationDelay: "-4s",
    },
  },
  {
    style: {
      width: "50vw",
      height: "50vw",
      bottom: "-20vw",
      left: "20vw",
      background:
        "radial-gradient(circle, oklch(0.7 0.22 200 / 0.5), transparent 60%)",
      animationDelay: "-8s",
    },
  },
] as const;

type AuroraBackgroundProps = {
  imageSrc?: string;
  imageOpacity?: number;
  particleCount?: number;
  zIndex?: string;
};

export function AuroraBackground({
  imageSrc = HERO_BG,
  imageOpacity = 70,
  particleCount = 40,
  zIndex = "!z-0",
}: AuroraBackgroundProps) {
  const particles = useMemo(() => generateParticles(particleCount), [particleCount]);

  return (
    <>
      <div className={`${zIndex} !absolute !inset-0`}>
        <NextImage
          src={imageSrc}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="!object-cover"
          style={{ opacity: imageOpacity / 100 }}
        />
      </div>

      <div
        className={`${zIndex} !absolute !inset-0 !bg-gradient-to-b !from-black/40 !via-black/30 !to-black`}
      />

      <div
        className={`${zIndex} !pointer-events-none !absolute !inset-0 !overflow-hidden`}
      >
        {AURORA_BLOBS.map((blob) => (
          <div
            key={blob.style.background}
            className="aurora-blob"
            style={blob.style}
          />
        ))}
      </div>

      <div
        className={`${zIndex} !pointer-events-none !absolute !inset-0 !overflow-hidden`}
      >
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
    </>
  );
}
