"use client";

import NextLink from "next/link";
import {
  IconArrowRight,
  IconCalendar,
  IconMapPin,
  IconUser,
} from "@tabler/icons-react";
import Wave from "react-wavify";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AuroraBackground } from "@/shared/components/AuroraBackground";
import { GradientText } from "@/shared/components/GradientText";
import { useRevealAll } from "@/features/sponsor/hooks/useRevealAll";
import { DefaultWaves } from "@/shared/components/Waves";

const LOGO = "/logos-la-u/Vertical - letras blancas.png";

export function HeroSection() {
  useRevealAll();
  const { user } = useAuth();
  const ctaHref = user ? "/mi-cuenta" : "/registro";
  const ctaLabel = user ? "Ir a mi cuenta" : "Inscríbete ahora";
  const CtaIcon = user ? IconUser : IconArrowRight;

  return (
    <section
      id="hero"
      className="!relative !flex !min-h-screen !items-center !overflow-hidden !bg-black"
    >
      <AuroraBackground imageOpacity={50} particleCount={30} />

      <DefaultWaves />

      <div className="!relative !z-10 !mx-auto !w-full !max-w-7xl !px-4 sm:!px-6 !mt-20 !xl:mt-0">
        <div className="!grid !gap-10 lg:!grid-cols-[1.1fr_1fr] lg:!items-center">
          <div className="!flex !flex-col !gap-6">
            <span
              className="reveal !inline-flex !w-fit !items-center !gap-2 !rounded-2xl glass !px-4 !py-1.5 !text-xs !font-medium !uppercase !tracking-[0.2em] !text-white/80"
              data-reveal-index="0"
            >
              <span className="!h-1.5 !w-1.5 !rounded-full !bg-cyan-neon !shadow-[0_0_10px_var(--color-cyan-neon)]" />
              XXIV Convención de Egresados · UTP 2026
            </span>

            <h1
              className="reveal !text-4xl !font-semibold !leading-[1.02] !tracking-tight !text-white sm:!text-5xl md:!text-6xl lg:!text-[4.5rem]"
              data-reveal-index="1"
            >
              <GradientText>La U</GradientText> del{" "}
              <GradientText>Futuro</GradientText>{" "}
              <span className="!text-white">conecta</span>{" "}
              <span className="!text-white">talento,</span>{" "}
              <span className="!text-white">impulsa</span>{" "}
              <span className="!text-white">el mañana.</span>
            </h1>

            <p
              className="reveal !max-w-xl !text-base !leading-relaxed !text-white/75 sm:!text-lg"
              data-reveal-index="2"
            >
              La XXIV Convención de Egresados de la Universidad Tecnológica
              de Pereira reúne a empresarios, líderes, egresados, gobierno,
              academia e innovadores para construir y vivir juntos la
              Universidad del futuro.
            </p>

            <div
              className="reveal !flex !flex-wrap !items-center !gap-4 !pt-2"
              data-reveal-index="3"
            >
              <NextLink
                href={ctaHref}
                className="!w-full !max-w-52 group !relative !inline-flex !items-center !gap-2 !overflow-hidden !rounded-full !px-7 !py-3.5 !text-sm !font-semibold !text-black !transition-transform !duration-300 hover:!scale-[1.03]"
                style={{
                  background:
                    "linear-gradient(100deg, #7dd3fc 0%, #a78bfa 35%, #f0abfc 65%, #fdba74 100%)",
                  boxShadow:
                    "0 0 40px oklch(0.65 0.22 300 / 0.35), 0 0 80px oklch(0.7 0.22 200 / 0.25)",
                }}
              >
                <span className="!relative !z-10">{ctaLabel}</span>
                <CtaIcon
                  size={18}
                  className="!relative !z-10 !transition-transform group-hover:!translate-x-0.5 group-hover:!-translate-y-0.5"
                />
                <span
                  className="!absolute !inset-0 !-translate-x-full !bg-gradient-to-r !from-transparent !via-white/40 !to-transparent !transition-transform !duration-700 group-hover:!translate-x-full"
                  aria-hidden="true"
                />
              </NextLink>

              <NextLink
                href="/entradas"
                className="!w-full !max-w-52 !inline-flex !items-center !justify-center !rounded-full !border !border-white/15 !bg-white/5 !px-6 !py-3 !text-sm !font-semibold !text-white !transition hover:!bg-white/10"
              >
                Ver entradas
              </NextLink>
            </div>
          </div>

          <div className="!flex !flex-col !gap-4">
            <div
              className="reveal !flex !items-center !justify-center"
              data-reveal-index="4"
            >
              <div
                className="animate-float-large will-change-transform"
                style={{
                  filter:
                    "drop-shadow(0 0 50px oklch(0.6 0.24 300 / 0.45))",
                }}
              >
                <img
                  src={LOGO}
                  alt="La U del Futuro — XXIV Convención de Egresados UTP 2026"
                  className="!h-44 !w-auto sm:!h-52 md:!h-60"
                  loading="eager"
                />
              </div>
            </div>

            <div
              className="reveal !flex !items-center !gap-4 !rounded-2xl glass !px-5 !py-4"
              data-reveal-index="5"
              style={{
                background: "rgba(15, 18, 38, 0.45)",
                WebkitBackdropFilter: "blur(14px) saturate(140%)",
                backdropFilter: "blur(14px) saturate(140%)",
              }}
            >
              <span
                className="!flex !h-11 !w-11 !shrink-0 !items-center !justify-center !rounded-full"
                style={{
                  background: "rgba(255, 15, 123, 0.12)",
                  border: "1px solid rgba(255, 15, 123, 0.3)",
                }}
              >
                <IconCalendar size={22} color="#ff0f7b" />
              </span>
              <div>
                <div className="!text-xl !font-semibold !text-white sm:!text-2xl">
                  22, 23 y 24
                </div>
                <div className="!text-sm !text-white/70">
                  de octubre de <span style={{ color: "#00e5ff" }}>2026</span>
                </div>
              </div>
            </div>

            <div
              className="reveal !flex !items-center !gap-4 !rounded-2xl glass !px-5 !py-4"
              data-reveal-index="6"
              style={{
                background: "rgba(15, 18, 38, 0.45)",
                WebkitBackdropFilter: "blur(14px) saturate(140%)",
                backdropFilter: "blur(14px) saturate(140%)",
              }}
            >
              <span
                className="!flex !h-11 !w-11 !shrink-0 !items-center !justify-center !rounded-full"
                style={{
                  background: "rgba(0, 229, 255, 0.12)",
                  border: "1px solid rgba(0, 229, 255, 0.3)",
                }}
              >
                <IconMapPin size={22} color="#00e5ff" />
              </span>
              <div>
                <div className="!text-sm !font-semibold !text-white">
                  Universidad Tecnológica de Pereira
                </div>
                <div className="!text-xs !text-white/70">
                  Pereira, Risaralda · Colombia
                </div>
              </div>
            </div>

            <div
              className="reveal !flex !flex-wrap !items-center !gap-x-4 !gap-y-1 !rounded-2xl glass !px-5 !py-3 !text-[10px] !font-medium !uppercase !tracking-[0.22em] !text-white/50"
              data-reveal-index="7"
              style={{
                background: "rgba(15, 18, 38, 0.45)",
                WebkitBackdropFilter: "blur(14px) saturate(140%)",
                backdropFilter: "blur(14px) saturate(140%)",
              }}
            >
              <span>Innovación</span>
              <span className="!h-1 !w-1 !rounded-full !bg-white/30" />
              <span>Inteligencia Artificial</span>
              <span className="!h-1 !w-1 !rounded-full !bg-white/30" />
              <span>Smart Campus</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
