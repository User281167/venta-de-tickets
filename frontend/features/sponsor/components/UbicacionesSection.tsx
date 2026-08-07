"use client";

import { MediaCard } from "@/shared/components/MediaCard";
import { GradientText } from "@/shared/components/GradientText";
import { useRevealAll } from "@/features/sponsor/hooks/useRevealAll";

type Zone = {
  image: string;
  title: string;
  description: string;
  badge: string;
};

const ZONES: Zone[] = [
  {
    image: "/assets/entradas-sponsort/zona-deportiva-1.png",
    title: "Rumbaterapia y activación",
    description:
      "Tu marca en tarimas, pendones y vallas rodeada de energía, movimiento y comunidad activa.",
    badge: "Zona Deportiva & Bienestar",
  },
  {
    image: "/assets/entradas-sponsort/zona-deportiva-2.png",
    title: "Cancha central y zona familiar",
    description:
      "Presencia visible en el corazón deportivo del evento, con alto tráfico de familias y egresados.",
    badge: "Zona Deportiva & Bienestar",
  },
  {
    image: "/assets/entradas-sponsort/entrada-principal.png",
    title: "Punto de mayor flujo",
    description:
      "El primer impacto visual: tu marca recibe a miles de asistentes en el acceso principal a la UTP.",
    badge: "Entrada Principal",
  },
  {
    image: "/assets/entradas-sponsort/tarima.png",
    title: "Escenario central",
    description:
      "Visibilidad premium durante conferencias, shows y momentos estelares transmitidos y fotografiados.",
    badge: "Tarima Principal",
  },
  {
    image: "/assets/entradas-sponsort/lado-tarima.png",
    title: "Stands al lado de la tarima",
    description:
      "Espacio propio junto al escenario para activaciones, muestras comerciales y relacionamiento directo.",
    badge: "Zona Patrocinadores",
  },
  {
    image: "/assets/entradas-sponsort/sendero-principal.png",
    title: "Zona aledaña y circulación",
    description:
      "Pendones y stands a lo largo del corredor por donde transita permanentemente toda la comunidad.",
    badge: "Sendero Principal",
  },
];

const ZoneBadge = ({ label }: { label: string }) => (
  <span className="!inline-flex !items-center !gap-2 !rounded-full !bg-black/50 !px-3 !py-1 !text-[10px] !font-medium !uppercase !tracking-[0.2em] !text-white/90 !backdrop-blur">
    <span className="!h-1.5 !w-1.5 !rounded-full !bg-cyan-neon !shadow-[0_0_10px_var(--color-cyan-neon)]" />
    {label}
  </span>
);

export function UbicacionesSection() {
  useRevealAll();

  return (
    <section id="ubicaciones" className="!relative !py-12 sm:!py-16">
      <div className="!mx-auto !max-w-7xl !px-4 sm:!px-6">
        <div
          className="reveal !mb-10 !flex !flex-col !items-start !gap-6 md:!flex-row md:!items-end md:!justify-between"
          data-reveal-index="0"
        >
          <div className="!max-w-2xl">
            <span className="!inline-flex !items-center !gap-2 !rounded-2xl glass !px-4 !py-1.5 !text-xs !font-medium !uppercase !tracking-[0.2em] !text-white/80">
              <span className="!h-1.5 !w-1.5 !rounded-full !bg-cyan-neon !shadow-[0_0_10px_var(--color-cyan-neon)]" />
              Ubicaciones estratégicas
            </span>
            <h2 className="!mt-6 !text-4xl !font-semibold !tracking-tight !text-white sm:!text-5xl md:!text-6xl">
              ¿Dónde estará <GradientText>tu marca</GradientText>?
            </h2>
          </div>
        </div>

        <div className="!grid !gap-6 sm:!grid-cols-2 lg:!grid-cols-3">
          {ZONES.map((z, i) => (
            <MediaCard
              key={z.title}
              image={z.image}
              title={z.title}
              description={z.description}
              number={i + 1}
              badge={<ZoneBadge label={z.badge} />}
              imageHeight="aspect-[4/3]"
              data-reveal-index={String(i + 1)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
