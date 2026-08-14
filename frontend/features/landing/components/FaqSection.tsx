"use client";

import { useState } from "react";
import NextLink from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { IconChevronDown } from "@tabler/icons-react";
import { Particles } from "@/shared/components/Particles";

const VIEWPORT = { once: true, margin: "-10% 0px -10% 0px" } as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

type Faq = {
  value: string;
  question: string;
  answer: React.ReactNode;
};

const FAQ_ITEMS: Faq[] = [
  {
    value: "publico",
    question: "¿Quién puede asistir?",
    answer:
      "Egresados, estudiantes, docentes, aliados, empresas y toda la comunidad interesada en innovación, cultura y futuro profesional.",
  },
  {
    value: "fechas",
    question: "¿Cuándo será La U del Futuro?",
    answer:
      "La Asociación de Egresados UTP se realizará el 22, 23 y 24 de octubre de 2026 en la Universidad Tecnológica de Pereira.",
  },
  {
    value: "entradas",
    question: "¿Cómo aseguro mi cupo?",
    answer:
      "Selecciona una entrada disponible, inicia sesión y completa el proceso de compra o inscripción desde la plataforma.",
  },
  {
    value: "aliados",
    question: "¿Puedo ser aliado o patrocinador?",
    answer: (
      <>
        Sí. Conoce los planes y modalidades de alianza en nuestra{" "}
        <NextLink
          href="/aliados"
          className="!font-semibold !text-white !underline !decoration-[#ff0f7b] !underline-offset-4 !transition hover:!decoration-[#00e5ff]"
        >
          página de aliados
        </NextLink>
        , o escríbenos a{" "}
        <a
          href="mailto:egresados@utp.edu.co"
          className="!font-semibold !text-white !underline !decoration-[#ff0f7b] !underline-offset-4 !transition hover:!decoration-[#00e5ff]"
        >
          egresados@utp.edu.co
        </a>
        .
      </>
    ),
  },
];

const GRADIENT_TEXT = {
  backgroundImage:
    "linear-gradient(100deg, #7dd3fc 0%, #a78bfa 35%, #f0abfc 65%, #fdba74 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

export function FaqSection() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section
      id="faq"
      className="!relative !overflow-hidden !py-16 sm:!py-24"
      style={{ background: "#000000" }}
    >
      <div
        className="!pointer-events-none !absolute !left-1/2 !top-1/2 !h-[700px] !w-[700px] !-translate-x-1/2 !-translate-y-1/2 !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(124,60,255,0.18) 0%, rgba(124,60,255,0.08) 40%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="!pointer-events-none !absolute !top-3 !left-[5%] !h-[500px] !w-[500px] !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,194,255,0.22) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="!pointer-events-none !absolute !-bottom-40 !right-[-10%] !h-[500px] !w-[500px] !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,15,123,0.18) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <Particles />

      <div className="!relative !z-10 !mx-auto !w-full !max-w-3xl !px-4 sm:!px-6">
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
            style={GRADIENT_TEXT}
          >
            Información clave
          </span>

          <h2 className="!max-w-3xl !text-4xl !font-black !uppercase !leading-[1.05] !tracking-tight !text-white sm:!text-5xl md:!text-6xl">
            Preguntas <span style={GRADIENT_TEXT}>frecuentes</span>
          </h2>
        </motion.div>

        <div className="!flex !flex-col !gap-4">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === item.value;
            return (
              <motion.div
                key={item.value}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
                variants={fadeUp}
                custom={i + 1}
                className="!relative !overflow-hidden !rounded-2xl glass"
                style={{
                  background: "rgba(15, 18, 38, 0.5)",
                  WebkitBackdropFilter: "blur(14px) saturate(140%)",
                  backdropFilter: "blur(14px) saturate(140%)",
                  borderColor: isOpen
                    ? "rgba(255, 15, 123, 0.5)"
                    : "rgba(255,255,255,0.1)",
                  transition: "border-color 0.3s ease",
                }}
              >
                <div
                  className="!pointer-events-none !absolute !-right-16 !-top-16 !h-32 !w-32 !rounded-full !opacity-40 !blur-3xl"
                  style={{
                    background: "oklch(0.55 0.24 320)",
                  }}
                  aria-hidden="true"
                />

                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : item.value)}
                  aria-expanded={isOpen}
                  className="!relative !flex !w-full !items-center !justify-between !gap-4 !px-5 !py-5 !text-left !transition sm:!px-6"
                >
                  <span className="!text-base !font-bold !text-white sm:!text-lg">
                    {item.question}
                  </span>
                  <span
                    className="!flex !h-9 !w-9 !shrink-0 !items-center !justify-center !rounded-full"
                    style={{
                      background: isOpen
                        ? "rgba(255, 15, 123, 0.15)"
                        : "rgba(255,255,255,0.05)",
                      border: isOpen
                        ? "1px solid rgba(255,15,123,0.4)"
                        : "1px solid rgba(255,255,255,0.1)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <IconChevronDown
                      size={18}
                      stroke={2.5}
                      className={`!text-white !transition-transform !duration-300 ${
                        isOpen ? "!rotate-180" : ""
                      }`}
                    />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="!relative !overflow-hidden"
                    >
                      <div className="!px-5 !pb-5 !pt-1 !text-sm !leading-relaxed !text-white/70 sm:!px-6 sm:!text-base">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
