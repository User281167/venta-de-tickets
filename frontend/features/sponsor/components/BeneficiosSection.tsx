"use client";

import { BenefitChip } from "@/shared/components/BenefitChip";
import { GradientText } from "@/shared/components/GradientText";
import { useRevealAll } from "@/features/sponsor/hooks/useRevealAll";

const WHATSAPP = "https://wa.me/3113167816";

const BENEFITS: { label: string; hue: number }[] = [
  { label: "Visibilidad", hue: 0 },
  { label: "Posicionamiento", hue: 40 },
  { label: "Relación con egresados", hue: 80 },
  { label: "Relación con estudiantes", hue: 120 },
  { label: "Atracción de talento", hue: 160 },
  { label: "Fortalecimiento de marca", hue: 200 },
  { label: "Networking", hue: 240 },
  { label: "Innovación", hue: 280 },
  { label: "Reconocimiento institucional", hue: 320 },
  { label: "Participación en un evento de ciudad", hue: 0 },
];

export function BeneficiosSection() {
  useRevealAll();

  return (
    <section className="!relative !py-12 sm:!py-16">
      <div className="!mx-auto !max-w-7xl !px-4 sm:!px-6">
        <div className="!grid !gap-16 lg:!grid-cols-[1fr_1fr] lg:!items-center">
          <div className="reveal" data-reveal-index="0">
            <span className="!inline-flex !items-center !gap-2 !rounded-2xl glass !px-4 !py-1.5 !text-xs !font-medium !uppercase !tracking-[0.2em] !text-white/80">
              <span className="!h-1.5 !w-1.5 !rounded-full !bg-cyan-neon !shadow-[0_0_10px_var(--color-cyan-neon)]" />
              Beneficios
            </span>
            <h2 className="!mt-6 !text-4xl !font-semibold !tracking-tight !text-white sm:!text-5xl md:!text-6xl lg:!text-[4.5rem] lg:!leading-[1.02]">
              No serás un patrocinador.
              <br />
              Serás uno de los <GradientText>constructores</GradientText> de la
              Universidad del Futuro.
            </h2>

            <div className="!mt-10">
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
                <span className="!relative !z-10">Quiero construir la U del Futuro</span>
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

          <div className="reveal !grid !grid-cols-1 md:!grid-cols-2 !gap-3" data-reveal-index="1">
            {BENEFITS.map((b, i) => (
              <BenefitChip
                key={b.label}
                label={b.label}
                hue={b.hue}
                data-reveal-index={String(i + 2)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
