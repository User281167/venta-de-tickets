"use client";

import { motion, type Variants } from "framer-motion";
import NextLink from "next/link";
import { IconArrowRight, IconUser } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { GradientText } from "@/shared/components/GradientText";
import { DefaultWaves } from "@/shared/components/Waves";

const VIEWPORT = { once: true, margin: "-10% 0px -10% 0px" } as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

const ICON = { size: 18, stroke: 2 } as const;

export function CtaSection() {
  const { user } = useAuth();
  const ctaHref = user ? "/mi-cuenta" : "/registro";
  const ctaLabel = user ? "IR A MI CUENTA" : "INSCRÍBETE AHORA";
  const CtaIcon = user ? IconUser : IconArrowRight;
  const subline = user
    ? "Ya haces parte de la comunidad. Revisa tu cuenta y prepárate para vivir La U del Futuro."
    : "Inscríbete hoy y asegura tu cupo en el evento más inspirador del año. Cupos limitados.";
  const hint = user ? "Nos vemos en octubre" : "Cupos limitados";

  return (
    <section
      id="cta"
      className="!relative !overflow-hidden !py-20 sm:!py-28"
      style={{
        background:
          "linear-gradient(100deg, #ff0f7b 0%, #4116a8 50%, #00d5b8 100%)",
      }}
    >
      <div
        className="!pointer-events-none !absolute !inset-0 !opacity-15"
        style={{
          backgroundImage: "url(/assets/header.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "overlay",
        }}
        aria-hidden="true"
      />

      <div
        className="!pointer-events-none !absolute !inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(2,4,20,0.45) 0%, rgba(2,4,20,0.1) 60%, rgba(2,4,20,0.35) 100%)",
        }}
        aria-hidden="true"
      />

      <DefaultWaves />

      <div className="!relative !z-10 !mx-auto !w-full !max-w-7xl !px-4 sm:!px-6">
        <div className="!flex !flex-col !items-center !gap-10 lg:!flex-row lg:!items-center lg:!justify-between lg:!gap-12 lg:!text-left">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            variants={fadeUp}
            custom={0}
            className="!flex !max-w-2xl !flex-col !gap-4 !text-center lg:!text-left"
          >
            <h2 className="!font-display !text-4xl !font-black !uppercase !leading-[1.02] !tracking-tight !text-white sm:!text-5xl md:!text-6xl">
              Sé parte del{" "}
              <GradientText>futuro</GradientText>,
              <br />
              sé parte de la <GradientText>U</GradientText>.
            </h2>

            <p className="!text-base !leading-relaxed !text-white/85 sm:!text-lg">
              {subline}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            variants={fadeUp}
            custom={1}
            className="!flex !flex-col !items-center !gap-4 sm:!w-auto lg:!items-end"
          >
            <div className="!flex !flex-col !items-stretch !gap-3 sm:!flex-row sm:!items-center sm:!gap-4 lg:!flex-col lg:!items-end lg:!gap-3">
              <NextLink
                href={ctaHref}
                className="group !inline-flex !items-center !justify-center !gap-2 !rounded-full !bg-white !px-8 !py-3.5 !text-sm !font-bold !uppercase !tracking-wide !text-black !transition !duration-300 hover:!scale-[1.03] hover:!shadow-[0_0_42px_rgba(0,229,255,0.42)]"
                style={{
                  boxShadow: "0 0 30px rgba(255,255,255,0.22)",
                }}
              >
                <span>{ctaLabel}</span>
                <CtaIcon
                  {...ICON}
                  className="!transition-transform group-hover:!translate-x-0.5 group-hover:!-translate-y-0.5"
                />
              </NextLink>

              <NextLink
                href="/aliados"
                className="w-full group !inline-flex !items-center !justify-center !gap-2 !rounded-full !border !px-7 !py-3 !text-sm !font-bold !uppercase !tracking-wide !text-white !transition !duration-300 hover:!scale-[1.03] hover:!shadow-[0_0_28px_rgba(255,15,123,0.35)]"
                style={{
                  background: "rgba(15, 18, 38, 0.45)",
                  WebkitBackdropFilter: "blur(14px) saturate(140%)",
                  backdropFilter: "blur(14px) saturate(140%)",
                  borderColor: "rgba(255, 255, 255, 0.4)",
                }}
              >
                <span>Sé un aliado</span>
                <IconArrowRight
                  size={16}
                  stroke={2.5}
                  className="!transition-transform group-hover:!translate-x-0.5 group-hover:!-translate-y-0.5"
                />
              </NextLink>
            </div>

            <p className="!text-xs !uppercase !tracking-[0.2em] !text-white/70">
              {hint}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
