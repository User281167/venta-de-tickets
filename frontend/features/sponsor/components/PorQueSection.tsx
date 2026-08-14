"use client";

import { FeatureCard } from "@/shared/components/FeatureCard";
import { GradientText } from "@/shared/components/GradientText";
import { useRevealAll } from "@/features/sponsor/hooks/useRevealAll";
import {
  IconFileCheck,
  IconTarget,
  IconUsers,
  IconNetwork,
  IconBrain,
  IconHeartHandshake,
  IconRadar,
  IconSparkles,
  type IconProps,
} from "@tabler/icons-react";

const ICON_SIZE: IconProps = { size: 18, stroke: 2 };

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "cyan" | "violet" | "blue";
  shadow?: boolean;
  topBorder?: boolean;
  badge?: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    icon: <IconFileCheck {...ICON_SIZE} />,
    title: "Certificado de Donación",
    description:
      "Recibe certificado de donación para aplicar beneficios tributarios por tu aporte a una institución de educación superior.",
    color: "cyan",
    shadow: true,
    topBorder: true,
    badge: (
      <>
        <IconSparkles size={12} stroke={2} />
        Beneficio tributario
      </>
    ),
  },
  {
    icon: <IconTarget {...ICON_SIZE} />,
    title: "Posicionamiento de Marca",
    description:
      "Asocia tu empresa con uno de los eventos universitarios más importantes del país.",
    color: "violet",
  },
  {
    icon: <IconUsers {...ICON_SIZE} />,
    title: "Atracción de Talento",
    description:
      "Conecta directamente con más de 52.000 egresados y miles de futuros profesionales.",
    color: "blue",
  },
  {
    icon: <IconNetwork {...ICON_SIZE} />,
    title: "Networking Estratégico",
    description:
      "Relaciónate con empresarios, directivos, gobierno, gremios, investigadores y líderes regionales.",
    color: "violet",
  },
  {
    icon: <IconBrain {...ICON_SIZE} />,
    title: "Innovación",
    description:
      "Participa en conversaciones sobre IA, Smart Campus, transformación digital y educación del futuro.",
    color: "blue",
  },
  {
    icon: <IconHeartHandshake {...ICON_SIZE} />,
    title: "Responsabilidad Social",
    description:
      "Apoya una iniciativa que impulsa el desarrollo regional y la formación del talento colombiano.",
    color: "violet",
  },
  {
    icon: <IconRadar {...ICON_SIZE} />,
    title: "Visibilidad",
    description:
      "Tu marca estará presente durante toda la experiencia de la Asociación de Egresados UTP.",
    color: "blue",
  },
];

export function PorQueSection() {
  useRevealAll();

  return (
    <section id="por-que" className="!relative !py-12 sm:!py-16">
      <div className="!pointer-events-none !absolute !inset-0 aurora-bg !opacity-40" />

      <div className="!relative !mx-auto !max-w-7xl !px-4 sm:!px-6">
        <div className="reveal !mb-10 !max-w-3xl" data-reveal-index="0">
          <h2 className="!mt-6 !text-4xl !font-semibold !tracking-tight !text-white sm:!text-5xl md:!text-6xl">
            ¿Por qué tu empresa <GradientText>va a estar aquí</GradientText>?
          </h2>
        </div>

        <div className="!grid !gap-5 md:!grid-cols-2 lg:!grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={f.title}
              icon={f.icon}
              title={f.title}
              description={f.description}
              color={f.color}
              shadow={f.shadow}
              topBorder={f.topBorder}
              badge={f.badge}
              className="!h-full"
              data-reveal-index={String(i + 1)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
