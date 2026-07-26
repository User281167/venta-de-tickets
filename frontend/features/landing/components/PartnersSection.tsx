"use client";

import {
  IconBuildingBank,
  IconChartBar,
  IconCpu,
  IconDeviceLaptop,
  IconLeaf,
  IconRocket,
  IconSchool,
  IconTruck,
} from "@tabler/icons-react";
import Wave from "react-wavify";

const ICON = { size: 22, stroke: 2 } as const;

const PARTNERS = [
  { name: "UTP Innova", icon: <IconRocket {...ICON} /> },
  { name: "TechEje", icon: <IconCpu {...ICON} /> },
  { name: "Banco del Futuro", icon: <IconBuildingBank {...ICON} /> },
  { name: "Ecosistema Verde", icon: <IconLeaf {...ICON} /> },
  { name: "Logística Plus", icon: <IconTruck {...ICON} /> },
  { name: "EdTech Colombia", icon: <IconDeviceLaptop {...ICON} /> },
  { name: "DataLab", icon: <IconChartBar {...ICON} /> },
  { name: "Egresados UTP", icon: <IconSchool {...ICON} /> },
];

const GRADIENT_TEXT = {
  backgroundImage:
    "linear-gradient(100deg, #7dd3fc 0%, #a78bfa 35%, #f0abfc 65%, #fdba74 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

export function PartnersSection() {
  const track = [...PARTNERS, ...PARTNERS];

  return (
    <section
      id="aliados"
      className="!relative !overflow-hidden !py-16 sm:!py-24"
      style={{ background: "#000000" }}
    >
      <div
        className="!pointer-events-none !absolute !-top-40 !left-[-10%] !h-[600px] !w-[600px] !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(124,60,255,0.32) 0%, rgba(124,60,255,0.14) 30%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="!pointer-events-none !absolute !-bottom-40 !right-[-10%] !h-[600px] !w-[600px] !rounded-full !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,194,255,0.3) 0%, rgba(160,16,96,0.14) 30%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div
        className="!pointer-events-none !absolute !inset-x-0 !bottom-0 !z-[1] !h-[140px] sm:!h-[180px]"
        aria-hidden="true"
      >
        <Wave
          fill="url(#partnersWaveFront)"
          paused={false}
          style={{ width: "100%", height: "100%", display: "flex" }}
          options={{ height: 20, amplitude: 14, speed: 0.14, points: 4 }}
        >
          <defs>
            <linearGradient id="partnersWaveFront" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.18" />
              <stop offset="35%" stopColor="#a78bfa" stopOpacity="0.16" />
              <stop offset="65%" stopColor="#f0abfc" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#fdba74" stopOpacity="0.18" />
            </linearGradient>
          </defs>
        </Wave>
      </div>

      <div
        className="!pointer-events-none !absolute !inset-x-0 !bottom-0 !z-[1] !h-[100px] sm:!h-[140px]"
        aria-hidden="true"
      >
        <Wave
          fill="url(#partnersWaveBack)"
          paused={false}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            opacity: 0.5,
          }}
          options={{ height: 18, amplitude: 20, speed: 0.1, points: 3 }}
        >
          <defs>
            <linearGradient id="partnersWaveBack" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff0f7b" stopOpacity="0.14" />
              <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.14" />
            </linearGradient>
          </defs>
        </Wave>
      </div>

      <div className="!relative !z-10 !mx-auto !w-full !max-w-7xl !px-4 sm:!px-6">
        <div className="!mb-12 !flex !flex-col !items-center !gap-4 !text-center">
          <span
            className="!text-xs !font-black !uppercase !tracking-[0.22em]"
            style={GRADIENT_TEXT}
          >
            Aliados estratégicos
          </span>

          <h2 className="!max-w-3xl !text-4xl !font-black !uppercase !leading-[1.05] !tracking-tight !text-white sm:!text-5xl md:!text-6xl">
            Quienes hacen posible este{" "}
            <span style={GRADIENT_TEXT}>encuentro</span>
          </h2>
        </div>
      </div>

      <div className="!relative !z-10 !w-full">
        <div
          className="!pointer-events-none !absolute !left-0 !top-0 !z-10 !h-full !w-[80px] sm:!w-[160px]"
          style={{
            background:
              "linear-gradient(90deg, #000000 0%, rgba(0,0,0,0) 100%)",
          }}
          aria-hidden="true"
        />
        <div
          className="!pointer-events-none !absolute !right-0 !top-0 !z-10 !h-full !w-[80px] sm:!w-[160px]"
          style={{
            background:
              "linear-gradient(270deg, #000000 0%, rgba(0,0,0,0) 100%)",
          }}
          aria-hidden="true"
        />

        <div className="animate-marquee !flex !w-max">
          {track.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="!mx-2 !flex !min-w-[240px] !items-center !gap-3 !rounded-2xl glass !px-6 !py-4 !transition !duration-300 hover:!scale-[1.03] sm:!min-w-[280px] sm:!gap-4 sm:!px-8 sm:!py-5"
              style={{
                background: "rgba(15, 18, 38, 0.5)",
                WebkitBackdropFilter: "blur(14px) saturate(140%)",
                backdropFilter: "blur(14px) saturate(140%)",
              }}
            >
              <div
                className="!flex !h-11 !w-11 !shrink-0 !items-center !justify-center !rounded-xl"
                style={{
                  background: "rgba(0, 229, 255, 0.12)",
                  border: "1px solid rgba(0, 229, 255, 0.3)",
                  boxShadow: "0 0 18px rgba(0, 229, 255, 0.25)",
                }}
              >
                <span style={{ color: "#7dd3fc" }}>{partner.icon}</span>
              </div>
              <span className="!whitespace-nowrap !text-base !font-semibold !text-white sm:!text-lg">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
