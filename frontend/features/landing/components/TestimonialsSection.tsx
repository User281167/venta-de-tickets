"use client";

import { motion, type Variants } from "framer-motion";
import { IconQuote, IconUsers, IconWorld } from "@tabler/icons-react";
import {
  TestimonialCard,
  type TestimonialColor,
} from "@/shared/components/TestimonialCard";

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

type Testimonial = {
  quote: string;
  author: string;
  color: TestimonialColor;
  icon: React.ReactNode;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Volver a la U con esta energía cambia la forma de imaginar el futuro.",
    author: "Egresada UTP",
    color: "magenta",
    icon: <IconQuote {...ICON} />,
  },
  {
    quote: "El networking conectó generaciones, empresas y proyectos reales.",
    author: "Participante 2025",
    color: "cyan",
    icon: <IconUsers {...ICON} />,
  },
  {
    quote:
      "Una Asociación de Egresados con mirada global y raíz universitaria.",
    author: "Aliado institucional",
    color: "violet",
    icon: <IconWorld {...ICON} />,
  },
];

const GRADIENT_TEXT = {
  backgroundImage:
    "linear-gradient(100deg, #7dd3fc 0%, #a78bfa 35%, #f0abfc 65%, #fdba74 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

export function TestimonialsSection() {
  return (
    <section
      id="testimonios"
      className="!relative !overflow-hidden !py-16 sm:!py-24"
      style={{ background: "#000000" }}
    >
      <div
        className="!pointer-events-none !absolute !-top-40 !right-[-10%] !h-[600px] !w-[600px] !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,15,123,0.32) 0%, rgba(255,15,123,0.14) 30%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="!pointer-events-none !absolute !-bottom-40 !left-[-10%] !h-[600px] !w-[600px] !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,194,255,0.3) 0%, rgba(124,60,255,0.14) 30%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="!pointer-events-none !absolute !left-1/2 !top-1/2 !h-[400px] !w-[400px] !-translate-x-1/2 !-translate-y-1/2 !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(160,16,96,0.22) 0%, transparent 70%)",
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
            className="!text-xs !font-black !uppercase !tracking-[0.22em]"
            style={GRADIENT_TEXT}
          >
            Voces de la comunidad
          </span>

          <h2 className="!max-w-3xl !text-4xl !font-black !uppercase !leading-[1.05] !tracking-tight !text-white sm:!text-5xl md:!text-6xl">
            Historias que vuelven a{" "}
            <span style={GRADIENT_TEXT}>encontrarse</span>
          </h2>
        </motion.div>

        <div className="!grid !grid-cols-1 !items-stretch !gap-5 md:!grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard
              key={t.author}
              icon={t.icon}
              quote={t.quote}
              author={t.author}
              color={t.color}
              data-reveal-index={String(i + 1)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
