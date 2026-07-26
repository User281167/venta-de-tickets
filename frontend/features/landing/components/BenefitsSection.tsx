"use client";

import { motion, type Variants } from "framer-motion";
import NextLink from "next/link";
import {
  IconArrowRight,
  IconBriefcase,
  IconHeart,
  IconMicrophone,
  IconSchool,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import Wave from "react-wavify";
import { FeatureCard } from "@/shared/components/FeatureCard";
import { GradientText } from "@/shared/components/GradientText";

const VIEWPORT = { once: true, margin: "-10% 0px -10% 0px" } as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

const ICON = { size: 22, stroke: 2 } as const;

type Activity = {
  title: string;
  description: string;
  color: "cyan" | "violet" | "magenta" | "blue" | "orange" | "verde";
  icon: React.ReactNode;
};

const ACTIVITIES: Activity[] = [
  {
    title: "Conferencias",
    description:
      "Líderes nacionales e internacionales en IA, innovación y transformación digital.",
    color: "cyan",
    icon: <IconMicrophone {...ICON} />,
  },
  {
    title: "Talleres",
    description:
      "Aprende, actualiza y potencia tus habilidades del futuro con expertos.",
    color: "blue",
    icon: <IconSchool {...ICON} />,
  },
  {
    title: "Networking",
    description:
      "Conecta con egresados, empresas e instituciones que transforman el mundo.",
    color: "magenta",
    icon: <IconUsers {...ICON} />,
  },
  {
    title: "Feria de Empleo",
    description:
      "Oportunidades laborales, ruedas de negocio y vitrina de emprendimientos.",
    color: "orange",
    icon: <IconBriefcase {...ICON} />,
  },
  {
    title: "Cultura",
    description:
      "Conciertos, arte, deportes y actividades para disfrutar y reconectar.",
    color: "violet",
    icon: <IconSparkles {...ICON} />,
  },
  {
    title: "Reencuentro",
    description:
      "Revive momentos, comparte historias y fortalece el sentido de pertenencia.",
    color: "verde",
    icon: <IconHeart {...ICON} />,
  },
];

export function BenefitsSection() {
  return (
    <section
      id="actividades"
      className="!relative !overflow-hidden !py-16 sm:!py-24"
      style={{ background: "#000000" }}
    >
      <div
        className="!pointer-events-none !absolute !-top-40 !left-[-10%] !h-[600px] !w-[600px] !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,15,123,0.32) 0%, rgba(255,15,123,0.12) 30%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="!pointer-events-none !absolute !-bottom-40 !right-[-10%] !h-[600px] !w-[600px] !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,194,255,0.32) 0%, rgba(160,16,96,0.16) 30%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="!pointer-events-none !absolute !left-1/2 !top-1/2 !h-[400px] !w-[400px] !-translate-x-1/2 !-translate-y-1/2 !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(124,60,255,0.22) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div
        className="!pointer-events-none !absolute !inset-x-0 !bottom-0 !z-[2] !h-[160px] sm:!h-[200px]"
        aria-hidden="true"
      >
        <Wave
          fill="url(#benefitsWaveFront)"
          paused={false}
          style={{ width: "100%", height: "100%", display: "flex" }}
          options={{ height: 22, amplitude: 16, speed: 0.16, points: 4 }}
        >
          <defs>
            <linearGradient id="benefitsWaveFront" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.08" />
              <stop offset="35%" stopColor="#a78bfa" stopOpacity="0.06" />
              <stop offset="65%" stopColor="#f0abfc" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#fdba74" stopOpacity="0.08" />
            </linearGradient>
          </defs>
        </Wave>
      </div>

      <div
        className="!pointer-events-none !absolute !inset-x-0 !bottom-0 !z-[2] !h-[120px] sm:!h-[160px]"
        aria-hidden="true"
      >
        <Wave
          fill="url(#benefitsWaveBack)"
          paused={false}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            opacity: 0.45,
          }}
          options={{ height: 18, amplitude: 22, speed: 0.1, points: 3 }}
        >
          <defs>
            <linearGradient id="benefitsWaveBack" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff0f7b" stopOpacity="0.04" />
              <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.04" />
            </linearGradient>
          </defs>
        </Wave>
      </div>

      <div className="!relative !z-10 !mx-auto !w-full !max-w-7xl !px-4 sm:!px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          variants={fadeUp}
          custom={0}
          className="!mb-12 !flex !flex-col !items-center !gap-4 !text-center"
        >
          <span
            className="!text-xs !font-black !uppercase !tracking-[0.22em]"
            style={{
              background:
                "linear-gradient(100deg, #7dd3fc 0%, #a78bfa 35%, #f0abfc 65%, #fdba74 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            ¿Qué vas a vivir?
          </span>

          <h2 className="!text-4xl !font-black !uppercase !leading-[1.05] !tracking-tight !text-white sm:!text-5xl md:!text-6xl">
            Una agenda para <GradientText>inspirarte</GradientText>
          </h2>

          <p className="!max-w-2xl !text-base !leading-relaxed !text-white/70 sm:!text-lg">
            Seis experiencias diseñadas para conectar el talento UTP con las
            oportunidades del futuro.
          </p>
        </motion.div>

        <div className="!grid !grid-cols-1 !gap-5 sm:!grid-cols-2 lg:!grid-cols-3">
          {ACTIVITIES.map((activity, i) => (
            <FeatureCard
              key={activity.title}
              icon={activity.icon}
              title={activity.title}
              description={activity.description}
              color={activity.color}
              data-reveal-index={String(i + 1)}
            />
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          variants={fadeUp}
          custom={8}
          className="!mt-12 !flex !justify-center"
        >
          <NextLink
            href="/agenda"
            className="group !inline-flex !items-center !justify-center !gap-2 !rounded-full !border !px-7 !py-3.5 !text-sm !font-semibold !text-white !transition !duration-300 hover:!translate-y-[-2px]"
            style={{
              background:
                "linear-gradient(#020414, #020414) padding-box, linear-gradient(90deg, #ff0f7b, #00e5ff) border-box",
              border: "1px solid transparent",
              boxShadow: "0 0 24px rgba(0,229,255,0.18)",
            }}
          >
            <span>VER AGENDA COMPLETA</span>
            <IconArrowRight
              size={18}
              className="!transition-transform group-hover:!translate-x-0.5"
            />
          </NextLink>
        </motion.div>
      </div>
    </section>
  );
}
