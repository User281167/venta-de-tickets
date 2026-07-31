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
    name: "Alci Acosta acompñado con la Orquesta Sinfónica de la UTP",
    role: "Boleros tradicional colombiano con sello propio para abrir la convención.",
    image: "/invitados/Alci Acosta.png",
  },
  {
    name: "Jean Carlos Centeno",
    role: "Voz líder del vallenato contemporáneo y grandes éxitos.",
    image: "/invitados/Jean Carlos Centeno.webp",
  },
  {
    name: "Frankie Ruiz (Javier Mauricio Valencia Henao)",
    role: "Homenaje al ídolo de la salsa con un show en vivo.",
    image:
      "/invitados/Frankie Ruiz (Javier Mauricio Valencia Henao).jpeg",
  },
  {
    name: "Concierto Electro",
    role: "Inicio a puro ritmo electrónico.",
    image: "/invitados/concierto-electro.jpeg",
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
      id="invitados"
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
            Invitados confirmados
          </span>

          <h2 className="!text-4xl !font-black !uppercase !leading-[1.05] !tracking-tight !text-white sm:!text-5xl md:!text-6xl">
            Eventos de grandes{" "}
            <span style={GRADIENT_TEXT}>artistas</span>
          </h2>
        </motion.div>

        <div className="!grid !grid-cols-1 !gap-5 sm:!grid-cols-2 lg:!grid-cols-4">
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

              <div className="!relative !flex !aspect-square !w-full !items-center !justify-center !overflow-hidden !rounded-2xl"
              >
                <NextImage
                  src={speaker.image}
                  alt={speaker.name}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 768px) 30vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div className="!relative !flex !w-full !flex-col !gap-1 !text-center">
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
