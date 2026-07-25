"use client";

import { BenefitChip } from "@/shared/components/BenefitChip";
import { GradientText } from "@/shared/components/GradientText";
import { useRevealAll } from "@/features/sponsor/hooks/useRevealAll";

const PROGRAMS: { label: string; hue: number }[] = [
  { label: "Programas de bienestar", hue: 0 },
  { label: "Convenios empresariales", hue: 45 },
  { label: "Bolsa de empleo", hue: 90 },
  { label: "Capacitación", hue: 135 },
  { label: "Networking", hue: 180 },
  { label: "Beneficios para egresados", hue: 225 },
  {
    label: "Beneficios para empleados egresados de empresas aliadas",
    hue: 270,
  },
  { label: "Desarrollo profesional", hue: 315 },
  { label: "Comunidad empresarial", hue: 0 },
];

export function AsociacionSection() {
  useRevealAll();

  return (
    <section id="asociacion" className="!relative !py-12 sm:!py-16">
      <div className="!mx-auto !max-w-7xl !px-4 sm:!px-6">
        <div className="reveal !overflow-hidden !rounded-[2.5rem] glass-strong">
          <div className="!grid !gap-0 lg:!grid-cols-[1fr_1.1fr]">
            <div className="!relative !p-8 sm:!p-12 lg:!p-16">
              <span className="!inline-flex !items-center !gap-2 !rounded-2xl glass !px-4 !py-1.5 !text-xs !font-medium !uppercase !tracking-[0.2em] !text-white/80">
                <span className="!h-1.5 !w-1.5 !rounded-full !bg-cyan-neon !shadow-[0_0_10px_var(--color-cyan-neon)]" />
                Asociación de Egresados
              </span>

              <div className="!mt-6 !w-fit !rounded-2xl !bg-white !p-4 !shadow-lg">
                <img
                  src="/aseutp-logo.png"
                  alt="Logo ASE UTP - Asociación de Egresados Universidad Tecnológica de Pereira"
                  className="!h-16 !w-auto sm:!h-20"
                  loading="lazy"
                />
              </div>

              <h2
                className="!mt-6 !text-3xl !font-semibold !tracking-tight !text-white sm:!text-4xl md:!text-5xl"
                data-reveal-index="1"
              >
                Una comunidad activa que{" "}
                <GradientText>trabaja todos los días</GradientText> por sus
                egresados.
              </h2>

              <p
                className="!mt-6 !text-white/60"
                data-reveal-index="2"
              >
                La Asociación desarrolla programas y servicios que fortalecen
                la relación entre egresados, empresas y la Universidad.
              </p>
            </div>

            <div className="!relative !border-t !border-white/10 !p-8 sm:!p-12 lg:!border-l lg:!border-t-0 lg:!p-16">
              <ul className="!grid !gap-3 sm:!grid-cols-2">
                {PROGRAMS.map((p, i) => (
                  <li
                    key={p.label}
                    data-reveal-index={String(i + 3)}
                    className="reveal"
                  >
                    <BenefitChip label={p.label} hue={p.hue} className="!w-full" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
