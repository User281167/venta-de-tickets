"use client";

import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { AuroraBackground } from "@/shared/components/AuroraBackground";

const VIEWPORT = { once: true, margin: "-10% 0px -10% 0px" } as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

type PageShellProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  imageOpacity?: number;
  particleCount?: number;
  compact?: boolean;
};

export function PageShell({
  eyebrow,
  title,
  subtitle,
  children,
  imageOpacity = 50,
  particleCount = 30,
  compact = false,
}: PageShellProps) {
  return (
    <section
      className={`!relative !overflow-hidden !bg-black min-h-screen ${
        compact ? "!pt-28 !pb-12" : "!pt-32 !pb-20"
      }`}
    >
      <AuroraBackground
        imageOpacity={imageOpacity}
        particleCount={particleCount}
      />

      <div className="!relative !z-10 !mx-auto !w-full !max-w-7xl !px-4 sm:!px-6">
        {(eyebrow || title || subtitle) && (
          <motion.div
            className="!mb-10 !flex !flex-col !items-center !gap-3 !text-center"
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            variants={fadeUp}
            custom={0}
          >
            {eyebrow && (
              <span className="!inline-flex !items-center !gap-2 !rounded-2xl glass !px-4 !py-1.5 !text-xs !font-medium !uppercase !tracking-[0.2em] !text-[#00e5ff]">
                <span
                  className="!h-1.5 !w-1.5 !rounded-full"
                  style={{ background: "#00e5ff", boxShadow: "0 0 10px #00e5ff" }}
                />
                {eyebrow}
              </span>
            )}

            <h1 className="!max-w-3xl !text-4xl !font-semibold !leading-[1.05] !tracking-tight !text-white sm:!text-5xl md:!text-6xl">
              {title}
            </h1>

            {subtitle && (
              <p className="!max-w-2xl !text-base !leading-relaxed !text-white/70 sm:!text-lg">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {children}
      </div>
    </section>
  );
}
