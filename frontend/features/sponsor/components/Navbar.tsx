"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";

const NAV_ITEMS = [
  { label: "Por qué", href: "#por-que" },
  { label: "U del Futuro", href: "#futuro" },
  { label: "Experiencias", href: "#experiencias" },
  { label: "Asociación", href: "#asociacion" },
];

const WHATSAPP = "https://wa.me/3113167816";

export function SponsorNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`!fixed !inset-x-0 !top-0 !z-[200] !transition-all !duration-500 ${
        scrolled ? "!py-3" : "!py-4"
      }`}
    >
      <div className="!mx-auto !max-w-7xl !px-4 sm:!px-6">
        <nav
          className={`!flex !items-center !justify-between !gap-3 !rounded-full !border !px-3 !py-2 sm:!gap-6 sm:!px-6 ${
            scrolled
              ? "!bg-white/[0.04] !border-white/10 !backdrop-blur-xl"
              : "!bg-white/[0.06] !border-white/10 !backdrop-blur-lg"
          } !transition-all !duration-500`}
          style={{
            WebkitBackdropFilter: scrolled
              ? "blur(20px) saturate(140%)"
              : "blur(14px) saturate(130%)",
            backdropFilter: scrolled
              ? "blur(20px) saturate(140%)"
              : "blur(14px) saturate(130%)",
          }}
        >
          <a
            href="#top"
            className="!flex !items-center !gap-3 !shrink-0"
            aria-label="Inicio aliados"
          >
            <img
              src="/logos-la-u/Horizontal - letras blancas.png"
              alt="La U del Futuro"
              className="!h-8 !w-auto sm:!h-9"
            />
            <span className="!hidden !text-xs !font-medium !tracking-[0.2em] !text-white/50 !uppercase lg:!inline">
              UTP · 22, 23 y 24 de octubre
            </span>
          </a>

          <div className="!hidden !items-center !gap-1 lg:!flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="!rounded-full !px-4 !py-2 !text-sm !text-white/70 !transition hover:!bg-white/5 hover:!text-white"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex gap-2">
            <NextLink
              href="/"
              className="!rounded-full !border !px-7 !py-3 !text-xs !font-bold !uppercase !tracking-wide !text-white !transition !duration-300 hover:!scale-[1.03] hover:!shadow-[0_0_28px_rgba(255,15,123,0.35)]"
              style={{
                background: "rgba(15, 18, 38, 0.45)",
                WebkitBackdropFilter: "blur(14px) saturate(140%)",
                backdropFilter: "blur(14px) saturate(140%)",
                borderColor: "rgba(255, 255, 255, 0.4)",
              }}
            >
              La Convención
            </NextLink>

            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="!inline-flex !items-center !justify-center !rounded-full !bg-white !px-5 !py-2 !text-sm !font-semibold !text-black !shrink-0 !transition hover:!bg-white/90"
            >
              Ser Aliado
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
