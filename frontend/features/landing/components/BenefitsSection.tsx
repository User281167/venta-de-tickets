"use client";

import { motion, type Variants } from "framer-motion";
import NextLink from "next/link";
import {
  IconArrowRight,
  IconBallFootball,
  IconHeartHandshake,
  IconSchool,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import { FeatureCard } from "@/shared/components/FeatureCard";
import { GradientText } from "@/shared/components/GradientText";
import { Image } from "@chakra-ui/react";

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
    title: "Academia",
    description: "Ideas que abren posibilidades",
    color: "violet",
    icon: <IconSchool {...ICON} />,
  },
  {
    title: "Networking",
    description: "Conexiones que crean oportunidades",
    color: "magenta",
    icon: <IconUsers {...ICON} />,
  },
  {
    title: "Social",
    description: "Cultura, celebración y pertenencia",
    color: "cyan",
    icon: <IconSparkles {...ICON} />,
  },
  {
    title: "Deportivo",
    description: "Movimiento que une generaciones",
    color: "blue",
    icon: <IconBallFootball {...ICON} />,
  },
  {
    title: "Bienestar",
    description: "Cuidar también es conectar con nosotros y la naturaleza",
    color: "verde",
    icon: <IconHeartHandshake {...ICON} />,
  },
  {
    title: "Barranqueros UTP",
    description: "El Ecosistema de Emprendimiento Barranqueros UTP",
    color: "verde",
    icon: (
      <Image
        src="/assets/barranqueros-logo.png"
        m="auto"
        w="auto"
        h="full"
        style={{ objectFit: "cover" }}
      />
    ),
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
            className="!text-xl !font-black !uppercase !tracking-[0.22em]"
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
            6 dimensiones para{" "}
            <GradientText>vivir la Asociación de Egresados UTP</GradientText>
          </h2>

          <p className="!max-w-2xl !text-base !leading-relaxed !text-white/70 sm:!text-lg">
            Seis experiencias que conectan el talento UTP con las oportunidades
            del futuro.
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
