"use client";

import { AuroraBackground } from "@/shared/components/AuroraBackground";
import { GradientText } from "@/shared/components/GradientText";
import { useRevealAll } from "@/features/sponsor/hooks/useRevealAll";

const WHATSAPP = "https://wa.me/3113167816";

export function CierreSection() {
  useRevealAll();

  return (
    <section className="!relative !overflow-hidden !py-16 sm:!py-20">
      <AuroraBackground imageOpacity={50} particleCount={30} />

      <div className="!relative !z-10 !mx-auto !max-w-5xl !px-4 !text-center sm:!px-6">
        <h2
          className="reveal !mt-8 !text-balance !text-4xl !font-semibold !leading-[1.05] !tracking-tight !text-white sm:!text-6xl md:!text-7xl"
          data-reveal-index="0"
        >
          El futuro de la Universidad
          <br className="!hidden sm:!block" />{" "}
          <GradientText>no se construirá solo</GradientText>.
        </h2>

        <p
          className="reveal !mx-auto !mt-8 !max-w-2xl !text-lg !text-white/70"
          data-reveal-index="1"
        >
          Tu empresa puede convertirse en una de las organizaciones que
          impulsarán la transformación de la Universidad Tecnológica de Pereira
          y el desarrollo del talento que liderará el futuro del país.
        </p>

        <div className="reveal !mt-12" data-reveal-index="2">
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
    </section>
  );
}
