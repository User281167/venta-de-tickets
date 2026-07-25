"use client";

import {
  ExperienceCard,
  type ExperienceColor,
} from "@/shared/components/ExperienceCard";
import { GradientText } from "@/shared/components/GradientText";
import { useRevealAll } from "@/features/sponsor/hooks/useRevealAll";
import {
  IconMusic,
  IconAffiliate,
  IconMicrophone2,
  IconHeartHandshake,
  IconRocket,
  IconBuildingStore,
  IconHeartbeat,
  IconConfetti,
} from "@tabler/icons-react";

const ICON = { size: 22, stroke: 2 } as const;

type Experience = {
  title: string;
  icon: React.ReactNode;
  color: ExperienceColor;
};

const EXPERIENCES: Experience[] = [
  { title: "Conciertos", icon: <IconMusic {...ICON} />, color: "cyan" },
  {
    title: "Networking Empresarial",
    icon: <IconAffiliate {...ICON} />,
    color: "blue",
  },
  { title: "Conferencias", icon: <IconMicrophone2 {...ICON} />, color: "violet" },
  {
    title: "Reencuentros",
    icon: <IconHeartHandshake {...ICON} />,
    color: "orange",
  },
  {
    title: "Experiencias Tecnológicas",
    icon: <IconRocket {...ICON} />,
    color: "cyan",
  },
  {
    title: "Muestras Empresariales",
    icon: <IconBuildingStore {...ICON} />,
    color: "verde",
  },
  {
    title: "Espacios de Bienestar",
    icon: <IconHeartbeat {...ICON} />,
    color: "magenta",
  },
  { title: "Fiestas", icon: <IconConfetti {...ICON} />, color: "magenta" },
];

export function ExperienciasSection() {
  useRevealAll();

  return (
    <section id="experiencias" className="!relative !py-12 sm:!py-16">
      <div className="!mx-auto !max-w-7xl !px-4 sm:!px-6">
        <div
          className="reveal !mb-10 !flex !flex-col !items-start !gap-6 md:!flex-row md:!items-end md:!justify-between"
          data-reveal-index="0"
        >
          <div className="!max-w-2xl">
            <span className="!inline-flex !items-center !gap-2 !rounded-2xl glass !px-4 !py-1.5 !text-xs !font-medium !uppercase !tracking-[0.2em] !text-white/80">
              <span className="!h-1.5 !w-1.5 !rounded-full !bg-cyan-neon !shadow-[0_0_10px_var(--color-cyan-neon)]" />
              Experiencias
            </span>
            <h2 className="!mt-6 !text-4xl !font-semibold !tracking-tight !text-white sm:!text-5xl md:!text-6xl">
              No es una agenda. Es una <GradientText>experiencia</GradientText>.
            </h2>
          </div>
        </div>

        <div className="!grid !gap-5 sm:!grid-cols-2 lg:!grid-cols-4">
          {EXPERIENCES.map((e, i) => (
            <ExperienceCard
              key={e.title}
              icon={e.icon}
              number={i + 1}
              title={e.title}
              color={e.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
