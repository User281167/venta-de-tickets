"use client";

import NextLink from "next/link";
import { IconMap2 } from "@tabler/icons-react";
import { motion, type Variants } from "framer-motion";
import { useActiveTicketTypes } from "@/features/ticket-purchase/api/ticket-purchase.queries";
import { TicketTypeCard } from "@/features/ticket-types/components/TicketTypeCard";

const VIEWPORT = { once: true, margin: "-10% 0px -10% 0px" } as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

export function TicketSection() {
  const { data: ticketTypes, isLoading } = useActiveTicketTypes();

  return (
    <section
      id="entradas"
      className="!relative !overflow-hidden !py-16 sm:!py-24"
      style={{ background: "#000000" }}
    >
      <div
        className="!pointer-events-none !absolute !-top-40 !left-1/2 !h-[720px] !w-[720px] !-translate-x-1/2 !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,15,123,0.55) 0%, rgba(255,15,123,0.22) 30%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="!pointer-events-none !absolute !-bottom-40 !right-[-10%] !h-[560px] !w-[560px] !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,194,255,0.5) 0%, rgba(160,16,96,0.25) 30%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="!pointer-events-none !absolute !left-[-8%] !top-1/3 !h-[420px] !w-[420px] !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(124,60,255,0.42) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="!relative !z-10 !mx-auto !w-full !max-w-7xl !px-4 sm:!px-6">
        <motion.div
          className="!mb-12 !flex !flex-col !items-center !gap-4 !text-center"
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          variants={fadeUp}
          custom={0}
        >
          <span className="!inline-flex !items-center !gap-2 !rounded-2xl glass !px-4 !py-1.5 !text-xs !font-medium !uppercase !tracking-[0.2em] !text-[#ff0f7b]">
            <span
              className="!h-1.5 !w-1.5 !rounded-full"
              style={{ background: "#ff0f7b", boxShadow: "0 0 10px #ff0f7b" }}
            />
            Inscripción abierta
          </span>

          <h2 className="!max-w-3xl !text-4xl !font-semibold !leading-[1.05] !tracking-tight !text-white sm:!text-5xl md:!text-6xl">
            Asegura tu cupo{" "}
            <span
              style={{
                background:
                  "linear-gradient(100deg, #7dd3fc 0%, #a78bfa 35%, #f0abfc 65%, #fdba74 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              para la Convención
            </span>
          </h2>

          <p className="!max-w-2xl !text-base !leading-relaxed !text-white/70 sm:!text-lg">
            Cupos limitados para actividades académicas, culturales y de
            networking. Elige la entrada que mejor se ajuste a ti.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="!grid !grid-cols-1 !gap-6 md:!grid-cols-2 lg:!grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="!h-[360px] !rounded-3xl"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
            ))}
          </div>
        ) : !ticketTypes || ticketTypes.length === 0 ? (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            variants={fadeUp}
            custom={1}
            className="!rounded-3xl !p-10 !text-center glass"
          >
            <h3 className="!text-xl !font-bold !text-white">
              No hay entradas disponibles en este momento
            </h3>
            <p className="!mt-2 !text-white/60">
              Vuelve pronto o contáctanos para más información sobre próximas
              actividades.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="!grid !grid-cols-1 !gap-6 md:!grid-cols-2 lg:!grid-cols-3">
              {ticketTypes.map((tt, i) => (
                <motion.div
                  key={tt.id}
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT}
                  variants={fadeUp}
                  custom={i + 1}
                >
                  <TicketTypeCard ticketType={tt} />
                </motion.div>
              ))}
            </div>

            <div className="!mt-8 !flex !justify-center">
              <NextLink
                href="/entradas"
                className="!inline-flex !items-center !gap-2 !rounded-2xl glass !px-5 !py-3 !text-sm !font-bold !text-white !transition hover:!bg-white/10"
              >
                <IconMap2 size={16} className="text-utp-azul" />
                Ver mapa del evento y disponibilidad en vivo
              </NextLink>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </section>
  );
}
