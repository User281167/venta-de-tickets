import NextImage from "next/image";
import NextLink from "next/link";
import { IconArrowDown, IconCalendar, IconMapPin } from "@tabler/icons-react";
import { AuroraBackground } from "@/shared/components/AuroraBackground";
import { Particles } from "@/shared/components/Particles";
import { DefaultWaves } from "@/shared/components/Waves";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="!relative !isolate !flex !items-center !overflow-hidden !bg-[#030817] !px-4 !pb-20 !pt-32 text-white sm:!px-6 sm:!pt-36 lg:!min-h-[780px] lg:!pt-28"
    >
      <AuroraBackground imageOpacity={38} particleCount={0} />
      <div className="!pointer-events-none !absolute !inset-0 !z-[1] !bg-[radial-gradient(ellipse_at_18%_30%,rgba(20,111,255,0.25),transparent_40%),radial-gradient(ellipse_at_88%_40%,rgba(149,28,128,0.2),transparent_38%),linear-gradient(180deg,rgba(2,8,23,0.14),#030817_95%)]" />
      <div className="!pointer-events-none !absolute !inset-0 !z-[2]">
        <Particles count={40} />
      </div>
      <DefaultWaves />

      <div className="!relative !z-10 !mx-auto !grid !w-full !max-w-7xl !items-center !gap-10 lg:!grid-cols-[1.1fr_0.9fr] lg:!gap-16">
        <div className="!flex !flex-col !items-start !gap-6">
          <span className="!inline-flex !items-center !gap-2 !rounded-full !border !border-white/15 !bg-white/[0.06] !px-4 !py-2 !text-[10px] !font-semibold !uppercase !tracking-[0.2em] !text-white/75 backdrop-blur-xl sm:!text-xs">
            <span className="!h-2 !w-2 !rounded-full !bg-[#f5bd35] !shadow-[0_0_14px_#f5bd35]" />
            XXIV Convención de Egresados UTP · 2026
          </span>

          <h1 className="!max-w-3xl !text-5xl !font-semibold !leading-[0.98] !tracking-[-0.045em] sm:!text-6xl lg:!text-[5.2rem]">
            <span className="!bg-gradient-to-r !from-[#8ac9ff] !via-[#c2a4ff] !to-[#ffcc75] !bg-clip-text !text-transparent">
              La U del Futuro
            </span>
            <br />
            conecta talento,
            <br />
            impulsa el mañana.
          </h1>

          <p className="!max-w-2xl !text-base !leading-8 !text-[#c5cee0] sm:!text-lg">
            Encuentro, reactivación y solidaridad. Una jornada para pensar el
            futuro, generar oportunidades, reencontrarnos y ayudar a
            reconstruir.
          </p>

          <div className="!flex !flex-wrap !gap-3 !pt-1">
            <NextLink
              href="#donaciones"
              className="!inline-flex !items-center !gap-2 !rounded-full !bg-[#f5bd35] !px-6 !py-3.5 !text-sm !font-bold !text-[#08142b] !shadow-[0_8px_32px_rgba(245,189,53,.22)] !transition hover:!bg-[#ffd46d]"
            >
              Apoyar a la comunidad <IconArrowDown size={18} />
            </NextLink>
            <NextLink
              href="/agenda"
              className="!inline-flex !items-center !rounded-full !border !border-white/20 !bg-white/[0.06] !px-6 !py-3.5 !text-sm !font-semibold !text-white !backdrop-blur-xl !transition hover:!bg-white/10"
            >
              Ver programación
            </NextLink>
          </div>

          <div className="!mt-2 !flex !flex-wrap !gap-x-8 !gap-y-3 !text-sm !text-white/75">
            <span className="!inline-flex !items-center !gap-2">
              <IconCalendar size={19} color="#f5bd35" /> Sábado 24 de octubre de
              2026
            </span>
            <span className="!inline-flex !items-center !gap-2">
              <IconMapPin size={19} color="#6bc7ff" /> ExpoFuturo · Pereira
            </span>
          </div>
        </div>

        <div className="!relative !mx-auto !w-full !max-w-[330px] lg:!mr-6">
          <div className="animate-float-large !absolute !-inset-6 !rounded-[2.5rem] !bg-gradient-to-br !from-[#1687ff]/30 !via-[#6c58ff]/15 !to-[#f5bd35]/20 !blur-2xl" />
          <div className="!relative !overflow-hidden !rounded-[1.5rem] !border !border-white/20 !bg-white/[0.07] !p-2 !shadow-[0_30px_100px_rgba(0,0,0,.45)] !backdrop-blur-xl">
            <NextImage
              src="/assets/utpton/UTPton Portada Reel-.png"
              alt="La Convención se transforma: UTPtón, XXIV Convención de Egresados UTP 2026"
              width={720}
              height={1280}
              priority
              className="!h-auto !w-full !rounded-[1rem]"
            />
          </div>
          <p className="!relative !mt-4 !text-center !text-[10px] !font-semibold !uppercase !tracking-[0.24em] !text-white/55">
            Encuentro · Reactivación · Solidaridad
          </p>
        </div>
      </div>
    </section>
  );
}
