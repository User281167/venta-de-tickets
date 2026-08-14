"use client";

import { GradientText } from "@/shared/components/GradientText";
import { StatCard } from "@/shared/components/StatCard";
import { useRevealAll } from "@/features/sponsor/hooks/useRevealAll";

type Metric = {
  value: string;
  label: string;
  accent?: "cyan" | "violet";
};

const REACH: Metric[] = [
  { value: "52.000+", label: "Egresados", accent: "cyan" },
  { value: "18.000+", label: "Estudiantes", accent: "cyan" },
  { value: "4.000+", label: "Docentes y administrativos", accent: "cyan" },
  { value: "23", label: "Convenciones realizadas", accent: "cyan" },
];

const IMPACT: Metric[] = [
  {
    value: "+5.000",
    label: "Personas impactadas Asociación de Egresados UTP 2024",
    accent: "violet",
  },
  {
    value: "+55",
    label: "Años de la Asociación de Egresados",
    accent: "violet",
  },
  {
    value: "+30.000",
    label: "Personas impactadas en las convenciones",
    accent: "violet",
  },
  {
    value: "+1200",
    label:
      "Asistentes al encuentro de semilleros de investigación del Eje Cafetero y Valle del Cauca en la UTP",
    accent: "violet",
  },
];

export function ImpactSection() {
  useRevealAll();

  return (
    <section id="impacto" className="!relative !py-12 sm:!py-16">
      <div className="!mx-auto !max-w-7xl !px-4 sm:!px-6">
        <div
          className="reveal !mb-10 !flex !flex-col !items-start !gap-4 sm:!flex-row sm:!items-end sm:!justify-between"
          data-reveal-index="0"
        >
          <div>
            <span className="!inline-flex !items-center !gap-2 !rounded-2xl glass !px-4 !py-1.5 !text-xs !font-medium !uppercase !tracking-[0.2em] !text-white/80">
              <span className="!h-1.5 !w-1.5 !rounded-full !bg-cyan-neon !shadow-[0_0_10px_var(--color-cyan-neon)]" />
              Impacto
            </span>
            <h2 className="!mt-6 !max-w-2xl !text-4xl !font-semibold !tracking-tight !text-white sm:!text-5xl">
              Alcance e impacto de la{" "}
              <GradientText>Asociación de Egresados UTP</GradientText>.
            </h2>
          </div>
          <p className="!max-w-sm !text-white/60">
            Cifras que muestran la magnitud de la comunidad UTP y el impacto
            real de la XXIV Asociación de Egresados UTP.
          </p>
        </div>

        <div className="!grid !grid-cols-2 !gap-px !overflow-hidden !rounded-3xl !bg-white/10 md:!grid-cols-4">
          {REACH.map((m, i) => (
            <div
              key={m.label}
              className="reveal !flex"
              data-reveal-index={String(i + 1)}
            >
              <StatCard
                value={m.value}
                label={m.label}
                accent={m.accent}
                className="!w-full !rounded-none"
              />
            </div>
          ))}
        </div>

        <div className="reveal !mt-12" data-reveal-index="6">
          <h3 className="!mb-6 !text-lg !font-medium !text-white/90">
            Impactos de la{" "}
            <GradientText>Asociación de Egresados UTP</GradientText>
          </h3>
          <div className="!grid !grid-cols-2 !gap-px !overflow-hidden !rounded-3xl !bg-white/10 md:!grid-cols-4">
            {IMPACT.map((m) => (
              <StatCard
                key={m.label}
                value={m.value}
                label={m.label}
                accent={m.accent}
                className="!rounded-none"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
