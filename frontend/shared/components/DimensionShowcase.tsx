"use client";

import { useState, type ReactNode } from "react";
import { GradientText } from "@/shared/components/GradientText";
import { useRevealAll } from "@/features/sponsor/hooks/useRevealAll";

export type DimensionItem = {
  key: string;
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
  image?: string;
};

type DimensionShowcaseProps = {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  items: DimensionItem[];
  defaultImage: string;
  accentColor?: "cyan" | "violet" | "blue" | "magenta" | "orange" | "verde";
  backgroundBlob?: boolean;
  className?: string;
};

const ACCENT_TEXT: Record<NonNullable<DimensionShowcaseProps["accentColor"]>, string> = {
  cyan: "text-cyan-neon",
  violet: "text-violet-neon",
  blue: "text-[var(--color-utp-azul)]",
  magenta: "text-[var(--color-utp-magenta)]",
  orange: "text-[var(--color-utp-naranja)]",
  verde: "text-[var(--color-utp-verde)]",
};

function pad(n: string, width = 2): string {
  return n.padStart(width, "0");
}

export function DimensionShowcase({
  id,
  eyebrow = "Visión",
  title,
  subtitle,
  items,
  defaultImage,
  accentColor = "cyan",
  backgroundBlob = true,
  className = "",
}: DimensionShowcaseProps) {
  useRevealAll();
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] ?? items[0];

  const image = active?.image ?? defaultImage;
  const number = pad(active?.number ?? "1", 2);
  const accent = ACCENT_TEXT[accentColor];

  return (
    <section
      id={id}
      className={`!relative !overflow-hidden !py-12 sm:!py-16 ${className}`}
    >
      {backgroundBlob && (
        <div className="!pointer-events-none !absolute !inset-0">
          <div
            className="aurora-blob"
            style={{
              width: "50vw",
              height: "50vw",
              top: "20%",
              left: "-10vw",
              background:
                "radial-gradient(circle, oklch(0.6 0.25 280 / 0.4), transparent 60%)",
            }}
          />
        </div>
      )}

      <div className="!relative !mx-auto !max-w-7xl !px-4 sm:!px-6">
        <div className="reveal !mb-12 !max-w-3xl" data-reveal-index="0">
          <span className="!inline-flex !items-center !gap-2 !rounded-2xl glass !px-4 !py-1.5 !text-xs !font-medium !uppercase !tracking-[0.2em] !text-white/80">
            <span
              className={`!h-1.5 !w-1.5 !rounded-full !bg-cyan-neon !shadow-[0_0_10px_var(--color-cyan-neon)]`}
            />
            {eyebrow}
          </span>
          <h2 className="!mt-6 !text-4xl !font-semibold !tracking-tight !text-white sm:!text-5xl md:!text-6xl">
            {title}
          </h2>
          {subtitle && (
            <p className="!mt-6 !text-lg !text-white/60">{subtitle}</p>
          )}
        </div>

        <div className="!grid !gap-8 lg:!grid-cols-[1fr_1.2fr]">
          <div className="!relative">
            <div className="!absolute !left-6 !top-0 !bottom-0 !w-px !bg-gradient-to-b !from-transparent !via-white/15 !to-transparent" />

            <ul className="!space-y-3">
              {items.map((item, i) => {
                const isActive = i === activeIndex;
                const itemNumber = pad(item.number, 2);
                return (
                  <li
                    key={item.key}
                    className="reveal !relative !pl-16"
                    data-reveal-index={String(i + 1)}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      onFocus={() => setActiveIndex(i)}
                      className={`!relative !w-full !rounded-2xl !border !px-5 !py-4 !text-left !transition-all !duration-500 ${
                        isActive
                          ? "glass-strong !border-white/10 !text-white"
                          : "!border-transparent !text-white/60 hover:!text-white"
                      }`}
                    >
                      <div
                        className={`!absolute !-left-12 !top-1/2 !flex !h-12 !w-12 !-translate-y-1/2 !items-center !justify-center !rounded-full !transition-all !duration-500 ${
                          isActive
                            ? "!text-black"
                            : "glass !text-white/70"
                        }`}
                        style={
                          isActive
                            ? {
                                background:
                                  "linear-gradient(135deg, #7dd3fc, #a78bfa, #f0abfc)",
                                boxShadow:
                                  "0 0 30px oklch(0.65 0.22 300 / 0.5)",
                              }
                            : undefined
                        }
                      >
                        {item.icon}
                      </div>
                      <div className="!text-[11px] !font-mono !uppercase !tracking-[0.2em] !text-white/40">
                        {itemNumber}
                      </div>
                      <div className="!mt-1 !text-lg !font-semibold">
                        {item.title}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div
            className="reveal !relative !overflow-hidden !rounded-[2rem] glass-strong"
            data-reveal-index="6"
          >
            <div
              className="!absolute !inset-0 !opacity-40"
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transition: "background-image 0.5s ease",
              }}
            />
            <div className="!absolute !inset-0 !bg-gradient-to-t !from-black !via-black/70 !to-transparent" />

            <div className="!relative !flex !h-full !min-h-[420px] !flex-col !justify-end !p-8 sm:!p-12">
              <div
                className={`!text-[11px] !font-mono !uppercase !tracking-[0.25em] ${accent}`}
              >
                Dimensión {number}
              </div>
              <h3 className="!mt-3 !text-3xl !font-semibold !tracking-tight !text-white sm:!text-4xl">
                {active.title}
              </h3>
              <p className="!mt-4 !max-w-lg !text-white/70">
                {active.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
