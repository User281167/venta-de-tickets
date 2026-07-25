"use client";

import { FeatureCard } from "@/shared/components/FeatureCard";
import { GradientText } from "@/shared/components/GradientText";
import { useRevealAll } from "@/features/sponsor/hooks/useRevealAll";
import {
  IconRocket,
  IconUsers,
  IconHeartHandshake,
  IconBulb,
} from "@tabler/icons-react";

const ICON = { size: 22, stroke: 2 } as const;

const WHATSAPP = "https://wa.me/3113167816";

export function ImpactoSocialSection() {
  useRevealAll();

  return (
    <section className="!relative !overflow-hidden !py-12 sm:!py-16">
      <div className="!pointer-events-none !absolute !inset-0">
        <div
          className="aurora-blob"
          style={{
            width: "45vw",
            height: "45vw",
            top: "10%",
            right: "-12vw",
            background:
              "radial-gradient(circle, oklch(0.65 0.22 200 / 0.35), transparent 60%)",
          }}
        />
      </div>

      <div className="!relative !mx-auto !max-w-7xl !px-4 sm:!px-6">
        <div className="reveal !overflow-hidden !rounded-[2.5rem] glass-strong">
          <div className="!grid !gap-0 lg:!grid-cols-[1.1fr_1fr]">
            <div className="!relative !p-8 sm:!p-12 lg:!p-16">
              <span className="!inline-flex !items-center !gap-2 !rounded-2xl glass !px-4 !py-1.5 !text-xs !font-medium !uppercase !tracking-[0.2em] !text-white/80">
                <span className="!h-1.5 !w-1.5 !rounded-full !bg-cyan-neon !shadow-[0_0_10px_var(--color-cyan-neon)]" />
                Impacto social
              </span>

              <h2
                className="!mt-6 !text-3xl !font-semibold !tracking-tight !text-white sm:!text-4xl md:!text-5xl"
                data-reveal-index="1"
              >
                Con tu aporte impulsarás a{" "}
                <GradientText>Barranqueros UTP</GradientText>
              </h2>

              <p
                className="!mt-6 !text-white/60"
                data-reveal-index="2"
              >
                De cada aporte se destinará un apoyo a estudiantes y egresados
                que transforman ideas en negocios, generan empleo y aportan al
                desarrollo de la región.
              </p>

              <div className="!mt-8">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group !relative !inline-flex !items-center !gap-2 !overflow-hidden !rounded-full !px-7 !py-3.5 !text-sm !font-semibold !text-black !transition-transform !duration-300 hover:!scale-[1.03]"
                  style={{
                    background:
                      "linear-gradient(100deg, #7dd3fc 0%, #a78bfa 35%, #f0abfc 65%, #fdba74 100%)",
                    boxShadow:
                      "0 0 40px oklch(0.65 0.22 300 / 0.35), 0 0 80px oklch(0.7 0.22 200 / 0.25)",
                  }}
                >
                  <span className="!relative !z-10">Quiero apoyar a Barranqueros UTP</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="!relative !z-10 !h-4 !w-4 !transition-transform group-hover:!translate-x-0.5 group-hover:!-translate-y-0.5"
                    aria-hidden="true"
                  >
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                  <span
                    className="!absolute !inset-0 !-translate-x-full !bg-gradient-to-r !from-transparent !via-white/40 !to-transparent !transition-transform !duration-700 group-hover:!translate-x-full"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>

            <div className="!relative !border-t !border-white/10 !p-8 sm:!p-12 lg:!border-l lg:!border-t-0 lg:!p-16">
              <div className="!grid !gap-4 sm:!grid-cols-2">
                <FeatureCard
                  icon={<IconRocket {...ICON} />}
                  title="Emprendimiento"
                  description="Acompañamiento a emprendimientos y proyectos de base tecnológica."
                  color="cyan"
                  data-reveal-index="3"
                  space="sm"
                />
                <FeatureCard
                  icon={<IconUsers {...ICON} />}
                  title="Mentorías"
                  description="Conexión con empresarios, inversionistas y aliados estratégicos."
                  color="violet"
                  data-reveal-index="4"
                  space="sm"
                />
                <FeatureCard
                  icon={<IconHeartHandshake {...ICON} />}
                  title="Impacto regional"
                  description="Negocios que generan valor económico y social en el Eje Cafetero."
                  color="cyan"
                  data-reveal-index="5"
                  space="sm"
                />
                <FeatureCard
                  icon={<IconBulb {...ICON} />}
                  title="Innovación"
                  description="Espacios para prototipar, validar y escalar ideas de alto impacto."
                  color="violet"
                  data-reveal-index="6"
                  space="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
