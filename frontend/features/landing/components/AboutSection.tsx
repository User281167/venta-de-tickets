"use client";

import { motion, type Variants } from "framer-motion";
import NextImage from "next/image";
import {
  IconUsersGroup,
  IconCalendarEvent,
  IconSparkles,
  IconWorld,
} from "@tabler/icons-react";
import {
  HighlightStatCard,
  type HighlightStatColor,
} from "@/shared/components/HighlightStatCard";

const VIEWPORT = { once: true, margin: "-10% 0px -10% 0px" } as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

const HERO_IMAGE = "/ase-oficial/1.jpg";

type Stat = {
  value: string;
  label: string;
  color: HighlightStatColor;
  icon: React.ReactNode;
};

const STATS: Stat[] = [
  {
    value: "+4.000",
    label: "Egresados reunidos correspondientes a egresados entre 2001-2026",
    color: "magenta",
    icon: <IconUsersGroup size={20} stroke={2} />,
  },
  {
    value: "6 Dimensiones",
    label: "Academia, Networking, Social, Deportivo, Bienestar y Barranqueros.",
    color: "blue",
    icon: <IconCalendarEvent size={20} stroke={2} />,
  },
  {
    value: "Inteligencia Artificial (IA)",
    label: "Evento que conecta todas las disciplinas en nuestro Campus Inteligente.",
    color: "cyan",
    icon: <IconSparkles size={20} stroke={2} />,
  },
  {
    value: "La U del Futuro",
    label: "Liderando la conversación del mañana con enfoque en liderazgo regional y sostenibilidad.",
    color: "orange",
    icon: <IconWorld size={20} stroke={2} />,
  },
];

export function AboutSection() {
  return (
    <section
      id="encuentro"
      className="!relative !overflow-hidden !py-16 sm:!py-24"
      style={{ background: "#000000" }}
    >
      <div
        className="!pointer-events-none !absolute !-top-40 !left-[-10%] !h-[640px] !w-[640px] !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,15,123,0.4) 0%, rgba(255,15,123,0.18) 30%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="!pointer-events-none !absolute !-bottom-40 !right-[-10%] !h-[600px] !w-[600px] !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,194,255,0.42) 0%, rgba(160,16,96,0.2) 30%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="!relative !z-10 !mx-auto !w-full !max-w-7xl !px-4 sm:!px-6">
        <div className="!grid !grid-cols-1 !items-center !gap-10 lg:!grid-cols-[1.1fr_1fr] lg:!gap-14">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            variants={fadeUp}
            custom={0}
            className="!relative !overflow-hidden !rounded-3xl glass"
            style={{
              background: "rgba(15, 18, 38, 0.45)",
              WebkitBackdropFilter: "blur(14px) saturate(140%)",
              backdropFilter: "blur(14px) saturate(140%)",
            }}
          >
            <div className="!relative !aspect-[4/3] !w-full">
              <NextImage
                src={HERO_IMAGE}
                alt="Asistentes en una conferencia de la Convención"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                style={{ objectFit: "cover" }}
              />
              <div className="!absolute !inset-0 !bg-gradient-to-t !from-black !via-black/40 !to-transparent" />
            </div>

            <div className="!absolute !inset-x-0 !bottom-0 !z-10 !p-6 sm:!p-8">
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
                variants={fadeUp}
                custom={1}
                className="!inline-flex !w-fit !flex-col !gap-1 !rounded-2xl !border !p-5 sm:!p-6"
                style={{
                  background: "rgba(15, 18, 38, 0.55)",
                  WebkitBackdropFilter: "blur(14px) saturate(140%)",
                  backdropFilter: "blur(14px) saturate(140%)",
                  borderColor: "rgba(255, 15, 123, 0.4)",
                }}
              >
                <span className="!text-lg !font-black !text-white sm:!text-xl">
                  Tres días de inspiración
                </span>
                <span className="!text-sm !text-white/65">
                  Pereira, Colombia
                </span>
              </motion.div>
            </div>
          </motion.div>

          <div className="!flex !flex-col !gap-8">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT}
              variants={fadeUp}
              custom={0}
              className="!flex !flex-col !gap-5"
            >
              <span
                className="!w-fit !text-xl !font-black !uppercase !tracking-[0.22em]"
                style={{
                  background:
                    "linear-gradient(100deg, #7dd3fc 0%, #a78bfa 35%, #f0abfc 65%, #fdba74 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                La Convención
              </span>

              <h2 className="!text-4xl !font-black !uppercase !leading-[1.02] !tracking-tight !text-white sm:!text-5xl">
                Un encuentro que transforma{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(100deg, #7dd3fc 0%, #a78bfa 35%, #f0abfc 65%, #fdba74 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  generaciones
                </span>
              </h2>

              <p className="!text-base !leading-relaxed !text-white/70 sm:!text-lg">
                Esta convención es academia + networking, alianzas, bienestar, cultura y entretenimiento, articulados alrededor de una conversación transversal durante los días 22, 23 y 24 de octubre.
              </p>
            </motion.div>

            <div className="!grid !grid-cols-1 !gap-4 sm:!grid-cols-2">
              {STATS.map((stat, i) => (
                <HighlightStatCard
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                  color={stat.color}
                  icon={stat.icon}
                  data-reveal-index={String(i + 1)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
