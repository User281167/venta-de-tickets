"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { IconMenu2, IconX } from "@tabler/icons-react";

const NAV_ITEMS = [
  { label: "Por qué", href: "#por-que" },
  { label: "U del Futuro", href: "#futuro" },
  { label: "Experiencias", href: "#experiencias" },
  { label: "Asociación", href: "#asociacion" },
];

const WHATSAPP = "https://wa.me/3113167816";

const POPOVER_STYLE = {
  background: "rgba(15, 18, 38, 0.85)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  backdropFilter: "blur(20px) saturate(140%)",
} as const;

export function SponsorNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const closeMobile = () => setOpen(false);

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
              src="/assets/logos-la-u/Horizontal - letras blancas.png"
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

          <div className="!flex !items-center !gap-2">
            <NextLink
              href="/"
              className="!hidden !rounded-full !border !px-7 !py-3 !text-xs !font-bold !uppercase !tracking-wide !text-white !transition !duration-300 hover:!scale-[1.03] hover:!shadow-[0_0_28px_rgba(255,15,123,0.35)] lg:!inline-flex"
              style={{
                background: "rgba(15, 18, 38, 0.45)",
                WebkitBackdropFilter: "blur(14px) saturate(140%)",
                backdropFilter: "blur(14px) saturate(140%)",
                borderColor: "rgba(255, 255, 255, 0.4)",
              }}
            >
              La Asociación de Egresados UTP
            </NextLink>

            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="!hidden !items-center !justify-center !rounded-full !bg-white !px-5 !py-2 !text-sm !font-semibold !text-black !shrink-0 !transition hover:!bg-white/90 sm:!inline-flex"
            >
              Ser Aliado
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="!inline-flex !items-center !justify-center !rounded-full !border !p-2 !text-white/85 !transition hover:!bg-white/10 hover:!text-white lg:!hidden"
              style={{ borderColor: "rgba(255, 255, 255, 0.4)" }}
              aria-label="Menú"
              aria-expanded={open}
            >
              {open ? <IconX size={18} /> : <IconMenu2 size={18} />}
            </button>
          </div>
        </nav>

        {open && (
          <div
            className="!mt-2 !overflow-hidden !rounded-2xl !border !border-white/10 !p-2 lg:!hidden"
            style={POPOVER_STYLE}
          >
            <div className="!flex !flex-col">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className="!rounded-xl !px-3 !py-2 !text-sm !text-white/80 !transition hover:!bg-white/10 hover:!text-white"
                >
                  {item.label}
                </a>
              ))}

              <div className="!my-1 !h-px !bg-white/10" />

              <NextLink
                href="/"
                onClick={closeMobile}
                className="!rounded-xl !px-3 !py-2 !text-sm !font-semibold !text-white/85 !transition hover:!bg-white/10 hover:!text-white"
              >
                La Asociación de Egresados UTP
              </NextLink>

              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobile}
                className="!rounded-xl !bg-white !px-3 !py-2 !text-center !text-sm !font-semibold !text-black !transition hover:!bg-white/90"
              >
                Ser Aliado
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
