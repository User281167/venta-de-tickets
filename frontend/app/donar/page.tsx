"use client";

import { useState } from "react";
import NextImage from "next/image";
import NextLink from "next/link";
import { IconArrowLeft, IconHeart, IconHome } from "@tabler/icons-react";
import { DonationButton } from "@/features/donaciones/components/DonationButton";
import { DonationCounter } from "@/features/donaciones/components/DonationCounter";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AuroraBackground } from "@/shared/components/AuroraBackground";
import { DefaultWaves } from "@/shared/components/Waves";
import { Particles } from "@/shared/components/Particles";

export default function DonationPage() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Navbar />
      <main className="!min-h-screen !bg-[#030817] !text-white">
        <section className="!relative !isolate !flex !min-h-[min(820px,100svh)] !items-center !overflow-hidden !bg-[#030817] !px-4 !pb-16 !pt-28 sm:!px-6 sm:!pt-32">
          <AuroraBackground imageOpacity={28} particleCount={0} />

          <div className="!pointer-events-none !absolute !inset-0 !z-[1] !bg-[radial-gradient(ellipse_at_20%_30%,rgba(20,111,255,0.23),transparent_42%),radial-gradient(ellipse_at_85%_70%,rgba(149,28,128,0.2),transparent_42%),linear-gradient(180deg,rgba(2,8,23,0.2),#030817_96%)]" />

          <div className="!pointer-events-none !absolute !inset-0 !z-[2]">
            <Particles count={32} />
          </div>

          <DefaultWaves />

          <div className="!relative !z-10 !mx-auto !grid !w-full !max-w-6xl !items-center !gap-10 lg:!grid-cols-[1.1fr_0.9fr] lg:!gap-16">
            <div className="!flex !flex-col !items-start !gap-6">
              <NextLink
                href="/"
                className="!inline-flex !items-center !gap-2 !rounded-full !border !border-white/15 !bg-white/[0.06] !px-4 !py-2 !text-sm !text-white/80 !transition-colors hover:!bg-white/10 hover:!text-white focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-4 focus-visible:!outline-[#7dd3fc]"
              >
                <IconArrowLeft size={17} aria-hidden="true" />
                <IconHome size={16} aria-hidden="true" />
                Volver al inicio
              </NextLink>

              <div className="!flex !items-center !gap-3 !rounded-full !border !border-[#f5bd35]/25 !bg-[#f5bd35]/10 !px-4 !py-2 !text-xs !font-bold !uppercase !tracking-[0.18em] !text-[#ffdc83]">
                <IconHeart size={16} aria-hidden="true" />
                Solidaridad UTP
              </div>

              <h1 className="!max-w-2xl !text-5xl !font-semibold !leading-[0.98] !tracking-[-0.045em] sm:!text-6xl lg:!text-7xl">
                Un aporte que{" "}
                <span className="!bg-gradient-to-r !from-[#8ac9ff] !via-[#c2a4ff] !to-[#ffcc75] !bg-clip-text !text-transparent">
                  nos une.
                </span>
              </h1>

              <p className="!max-w-xl !text-base !leading-8 !text-[#c5cee0] sm:!text-lg">
                Súmate a UTPtón. Tu aporte voluntario fortalece el fondo de
                solidaridad que acompaña a la comunidad UTP afectada por el
                sismo.
              </p>

              <p className="!text-sm !text-white/55">
                La participación en la Convención no requiere una donación.
              </p>
            </div>

            <div className="!relative !mx-auto !w-full !max-w-md">
              <div className="!absolute !-inset-5 !rounded-[2rem] !bg-gradient-to-br !from-[#1687ff]/25 !via-[#6c58ff]/15 !to-[#f5bd35]/20 !blur-2xl" />
              <div className="glass-card !relative !flex !flex-col !items-center !gap-6 !rounded-3xl !border-white/15 !bg-[#07152b]/75 !p-6 !shadow-[0_28px_100px_rgba(0,0,0,.42)] !backdrop-blur-2xl sm:!p-8">
                <NextImage
                  src="/assets/utpton/Logos/Horizontal blanco.png"
                  alt="UTPtón, XXIV Convención de Egresados UTP"
                  width={320}
                  height={110}
                  className="!h-14 !w-auto"
                  priority
                />
                <div className="!text-center">
                  <h2 className="!text-2xl !font-bold !text-white">
                    Apoya a nuestra comunidad
                  </h2>

                  <p className="!mt-2 !text-sm !leading-6 !text-white/60">
                    Cada aporte suma y ayuda a mantener viva la solidaridad
                    universitaria.
                  </p>
                </div>

                <DonationCounter />

                <DonationButton
                  account="VICTIMAS"
                  label="Donar a UTPtón"
                  open={open}
                  onOpenChange={setOpen}
                />

                <p className="!text-center !text-xs !leading-5 !text-white/45">
                  Aporte voluntario y seguro mediante los medios habilitados.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
