import type { ReactNode } from "react";

type Accent = "cyan" | "violet";

const ACCENT_VAR: Record<Accent, string> = {
  cyan: "var(--color-cyan-neon)",
  violet: "var(--color-violet-neon)",
};

type StatCardProps = {
  value: ReactNode;
  label: ReactNode;
  accent?: Accent;
  className?: string;
};

export function StatCard({
  value,
  label,
  accent = "cyan",
  className = "",
}: StatCardProps) {
  const glow = ACCENT_VAR[accent];

  return (
    <div
      className={`group !relative !flex !h-full !flex-col !bg-black !p-6 !transition hover:!bg-white/[0.03] sm:!p-8 ${className}`}
    >
      <div className="!text-3xl !font-semibold !leading-[1.05] !tracking-tight !text-white lg:!text-5xl">
        <span className="text-gradient !whitespace-nowrap">{value}</span>
      </div>

      <div className="!mt-4 !text-sm !leading-snug !text-white/60">{label}</div>

      <div
        className="!pointer-events-none !absolute !inset-0 !opacity-0 !transition-opacity group-hover:!opacity-100"
        aria-hidden="true"
      >
        <div
          className="!absolute !inset-x-0 !top-0 !h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${glow}, transparent)`,
            opacity: 0.6,
          }}
        />
      </div>
    </div>
  );
}
