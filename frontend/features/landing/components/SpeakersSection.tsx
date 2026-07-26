"use client";

import { motion, type Variants } from "framer-motion";
import NextImage from "next/image";

const VIEWPORT = { once: true, margin: "-10% 0px -10% 0px" } as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

type Speaker = {
  name: string;
  role: string;
  image: string;
};

const SPEAKERS: Speaker[] = [
  {
    name: "Santiago Bilinkis",
    role: "Futurista e investigador en inteligencia artificial.",
    image: "/carlos.jpg",
  },
  {
    name: "Carolina Cruz",
    role: "Líder en innovación y transformación organizacional.",
    image: "/laura.jpg",
  },
  {
    name: "Daniel Gomez",
    role: "Emprendedor serial y mentor de startups tecnológicas.",
    image: "/andres.jpg",
  },
  {
    name: "Maria Camila Díaz",
    role: "Experta en liderazgo consciente y desarrollo humano.",
    image: "/elena.jpg",
  },
  {
    name: "Invitado Internacional",
    role: "Próximamente más información",
    image: "/conferencia-2.jpg",
  },
];

const GRADIENT_TEXT = {
  backgroundImage:
    "linear-gradient(100deg, #7dd3fc 0%, #a78bfa 35%, #f0abfc 65%, #fdba74 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

export function SpeakersSection() {
  return (
    <section
      id="speakers"
      className="!relative !overflow-hidden !py-16 sm:!py-24"
      style={{ background: "#000000" }}
    >
      <div
        className="!pointer-events-none !absolute !-top-40 !left-[-10%] !h-[600px] !w-[600px] !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(124,60,255,0.4) 0%, rgba(124,60,255,0.16) 30%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="!pointer-events-none !absolute !-bottom-40 !right-[-10%] !h-[600px] !w-[600px] !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,15,123,0.32) 0%, rgba(160,16,96,0.16) 30%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="!pointer-events-none !absolute !left-1/2 !top-1/2 !h-[400px] !w-[400px] !-translate-x-1/2 !-translate-y-1/2 !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,194,255,0.22) 0%, transparent 70%)",
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
            Ponentes confirmados
          </span>

          <h2 className="!text-4xl !font-black !uppercase !leading-[1.05] !tracking-tight !text-white sm:!text-5xl md:!text-6xl">
            Mentes que construyen el{" "}
            <span style={GRADIENT_TEXT}>futuro</span>
          </h2>
        </motion.div>

        <div className="!grid !grid-cols-2 !gap-5 md:!grid-cols-3 lg:!grid-cols-5">
          {SPEAKERS.map((speaker, i) => (
            <motion.article
              key={speaker.name}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT}
              variants={fadeUp}
              custom={i + 1}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="!relative !flex !h-full !flex-col !items-center !gap-4 !overflow-hidden !rounded-3xl glass !p-5 !text-center sm:!p-6"
              style={{
                background: "rgba(15, 18, 38, 0.45)",
                WebkitBackdropFilter: "blur(14px) saturate(140%)",
                backdropFilter: "blur(14px) saturate(140%)",
              }}
            >
              <div
                className="!pointer-events-none !absolute !-right-12 !-top-12 !h-32 !w-32 !rounded-full !opacity-50 !blur-2xl"
                style={{ background: "oklch(0.55 0.24 320)" }}
                aria-hidden="true"
              />

              <div className="!relative !flex !h-[120px] !w-[120px] !items-center !justify-center !overflow-hidden !rounded-full !border-2 sm:!h-[140px] sm:!w-[140px]"
                style={{
                  borderColor: "rgba(255, 15, 123, 0.6)",
                  boxShadow: "0 0 28px rgba(255, 15, 123, 0.45)",
                }}
              >
                <NextImage
                  src={speaker.image}
                  alt={speaker.name}
                  fill
                  sizes="140px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div className="!relative !mt-auto !flex !w-full !flex-col !gap-1 !text-center">
                <h3 className="!text-base !font-black !text-white">
                  {speaker.name}
                </h3>
                <p className="!text-xs !leading-snug !text-white/55">
                  {speaker.role}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
