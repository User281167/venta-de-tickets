"use client";

import { useMemo } from "react";
import NextImage from "next/image";
import { useRevealAll } from "@/features/sponsor/hooks/useRevealAll";
import { generateParticles } from "@/features/sponsor/hooks/particles";

const HERO_BG = "/assets/hero-aurora.jpg";
const LOGO = "/assets/logos-la-u/Vertical - letras blancas.png";
const WHATSAPP = "https://wa.me/3113167816";

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

const TAGS = ["Innovación", "Inteligencia Artificial", "Smart Campus"];

export function SponsorHero() {
  useRevealAll();

  const particles = useMemo(() => generateParticles(40), []);

  return (
    <section
      id="top"
      className="!relative !min-h-screen !overflow-hidden !pt-32"
    >
      <NextImage
        src={HERO_BG}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="!z-0 !object-cover !opacity-70"
      />

      <div className="!absolute !inset-0 !z-0 !bg-gradient-to-b !from-black/40 !via-black/30 !to-black" />

      <div className="!pointer-events-none !absolute !inset-0 !z-0 !overflow-hidden">
        {AURORA_BLOBS.map((blob) => (
          <div
            key={blob.style.background}
            className="aurora-blob"
            style={blob.style}
          />
        ))}
      </div>

      <div className="!absolute !inset-0 !z-0 grid-overlay !opacity-60" />

      <div className="!pointer-events-none !absolute !inset-0 !z-0 !overflow-hidden">
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

      <div className="!relative !z-0 !mx-auto !flex !min-h-[calc(100vh-8rem)] !max-w-7xl !flex-col !items-center !justify-center !gap-6 !px-4 !pb-24 !pt-4 !text-center sm:!px-6">
        <div className="reveal" data-reveal-index="0">
          <img
            src={LOGO}
            alt="La U del Futuro"
            className="!mx-auto !h-44 !w-auto sm:!h-52 md:!h-60 animate-float-slow"
            style={{
              filter: "drop-shadow(0 0 60px oklch(0.6 0.24 300 / 0.4))",
            }}
          />
        </div>

        <div className="reveal !max-w-md" data-reveal-index="1">
          <span className="!inline-flex !items-center !gap-2 !rounded-2xl glass !px-4 !py-1.5 !text-xs !font-medium !uppercase !tracking-[0.2em] !text-white/80">
            <span className="!h-1.5 !w-1.5 !rounded-full !bg-cyan-neon !shadow-[0_0_10px_var(--color-cyan-neon)]" />
            XXIV Asociación de Egresados · UTP 2026 · 22, 23 y 24 de octubre
          </span>
        </div>

        <h1
          className="reveal !mt-2 !max-w-5xl !text-balance !text-4xl !font-semibold !leading-[1.05] !tracking-tight !text-white sm:!text-6xl md:!text-7xl "
          data-reveal-index="2"
        >
          La <span className="text-gradient">U del Futuro</span> comienza
          <br className="!hidden sm:!block" /> con quienes deciden construirla.
        </h1>

        <p
          className="reveal !mx-auto !mt-2 !max-w-2xl !text-pretty !text-base !leading-relaxed !text-white/70 sm:!text-lg"
          data-reveal-index="3"
        >
          La XXIV Asociación de Egresados de la Universidad Tecnológica de
          Pereira reunirá a empresarios, líderes, egresados, gobierno, academia
          e innovadores para construir y vivir juntos la Universidad del futuro.
        </p>

        <div
          className="reveal !mt-6 !flex !flex-col !items-center !gap-3 sm:!flex-row"
          data-reveal-index="4"
        >
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="group !relative !inline-flex !items-center !justify-center !gap-2 !overflow-hidden !rounded-full !px-7 !py-3.5 !text-sm !font-semibold !text-black !transition-transform !duration-300 hover:!scale-[1.03]"
            style={{
              background:
                "linear-gradient(100deg, #7dd3fc 0%, #a78bfa 35%, #f0abfc 65%, #fdba74 100%)",
              boxShadow:
                "0 0 40px oklch(0.65 0.22 300 / 0.35), 0 0 80px oklch(0.7 0.22 200 / 0.25)",
            }}
          >
            <span className="!relative !z-10">
              Quiero ser Aliado Estratégico
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="!relative !z-10 !h-4 !w-4 !transition-transform group-hover:!translate-x-0.5 group-hover:!-translate-y-0.5"
              aria-hidden="true"
            >
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
            <span
              className="!absolute !inset-0 !-translate-x-full !bg-gradient-to-r !from-transparent !via-white/40 !to-transparent !transition-transform !duration-700 group-hover:!translate-x-full"
              aria-hidden="true"
            />
          </a>

          <a
            href="#por-que"
            className="!inline-flex !items-center !justify-center !gap-2 !rounded-full glass !px-6 !py-3 !text-sm !font-medium !text-white/90 !transition hover:!bg-white/10"
            aria-label="Ver más"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="!h-4 !w-4"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </a>
        </div>

        <div
          className="reveal !mt-10 !flex !flex-wrap !items-center !justify-center !gap-x-6 !gap-y-2 !text-xs !uppercase !tracking-[0.25em] !text-white/40"
          data-reveal-index="5"
        >
          {TAGS.map((tag, i) => (
            <span key={tag} className="!flex !items-center !gap-6">
              <span>{tag}</span>
              {i < TAGS.length - 1 && (
                <span className="!h-1 !w-1 !rounded-full !bg-white/30" />
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="!pointer-events-none !absolute !inset-x-0 !bottom-0 !z-0 !h-32 !bg-gradient-to-b !from-transparent !to-black" />
    </section>
  );
}
