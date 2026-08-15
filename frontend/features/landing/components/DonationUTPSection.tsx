"use client";

import { motion, type Variants } from "framer-motion";
import { Image } from "@chakra-ui/react";
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

export function DonationUTPSection() {
  return (
    <div className="!bg-blue-900 !pt-20">
      <Image
        asChild
        className="!hidden md:!block"
        alt="Donaciones para los afectados del sismo ahorros 127270147292 llave bre-be 8914082399 punto de entrega Cra 26 #12-24 Alamos enseguida de NASE"
      >
        <NextImage
          width={2200}
          height={600}
          src="/assets/banner-donaciones.jpg"
          alt="Donaciones para los afectados del sismo ahorros 127270147292 llave bre-be 8914082399 punto de entrega Cra 26 #12-24 Alamos enseguida de NASE"
        />
      </Image>

      <section className="!relative !overflow-hidden !py-20 sm:!py-28 md:!hidden">
        <div
          className="!pointer-events-none !absolute !inset-0 !opacity-80"
          style={{
            backgroundImage: "url(/assets/bg-donaciones.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />

        <div
          className="!pointer-events-none !absolute !inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(2,4,20,0.45) 0%, rgba(2,4,20,0.1) 60%, rgba(2,4,20,0.35) 100%)",
          }}
          aria-hidden="true"
        />

        <div className="!relative !z-10 !mx-auto !w-full !max-w-7xl !px-4 sm:!px-6">
          <div className="!flex !flex-col !items-center !gap-2">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT}
              variants={fadeUp}
              custom={0}
              className="!flex !max-w-2xl !flex-col !gap-4 !text-center lg:!text-left"
            >
              <img
                src="/assets/title.png"
                alt="Todos Somos UTP"
                className="!w-full"
              />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT}
              variants={fadeUp}
              custom={1}
              className="!flex !flex-col !items-center !gap-4 sm:!w-auto lg:!items-end"
            >
              <div className="!flex !flex-col !items-stretch !gap-2">
                <img
                  src="/assets/info-donaciones.png"
                  alt="Donaciones para los afectados del sismo ahorros 127270147292 llave bre-be 8914082399 punto de entrega Cra 26 #12-24 Alamos enseguida de NASE"
                  className="!w-full"
                />

                <p>
                  ANTES DE DONAR{" "}
                  <span className="!text-yellow-400">REVISA</span> QUE LA CUENTA
                  ESTE A NOMBRE DE:
                </p>

                <p>
                  Asociación de Egresados de la Universidad Tecnológica de
                  Pereira
                </p>

                <small className="!border-2 !border-color-white !p-2">
                  Entrega de Certificado de Donación
                </small>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
