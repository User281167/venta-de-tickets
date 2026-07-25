import type { ReactNode } from "react";

export type ExperienceColor =
  | "cyan"
  | "violet"
  | "blue"
  | "magenta"
  | "orange"
  | "verde";

const HUE_RGB: Record<ExperienceColor, string> = {
  cyan: "oklch(0.55 0.24 260 / 0.55)",
  violet: "oklch(0.55 0.24 320 / 0.55)",
  blue: "oklch(0.55 0.24 200 / 0.55)",
  magenta: "oklch(0.55 0.24 340 / 0.55)",
  orange: "oklch(0.55 0.24 45 / 0.55)",
  verde: "oklch(0.55 0.24 160 / 0.55)",
};

const HUE_BOX: Record<ExperienceColor, string> = {
  cyan: "oklch(0.6 0.22 260 / 0.5)",
  violet: "oklch(0.6 0.22 320 / 0.5)",
  blue: "oklch(0.6 0.22 200 / 0.5)",
  magenta: "oklch(0.6 0.22 340 / 0.5)",
  orange: "oklch(0.6 0.22 45 / 0.5)",
  verde: "oklch(0.6 0.22 160 / 0.5)",
};

function pad(n: string | number, width = 2): string {
  return String(n).padStart(width, "0");
}

type ExperienceCardProps = {
  icon: ReactNode;
  number: string | number;
  title: string;
  color?: ExperienceColor;
  badge?: ReactNode;
  className?: string;
};

export function ExperienceCard({
  icon,
  number,
  title,
  color = "cyan",
  badge,
  className = "",
}: ExperienceCardProps) {
  return (
    <div
      className={`group reveal !relative !min-h-[150px] !overflow-hidden !rounded-2xl glass !p-4 !transition !duration-500 hover:!-translate-y-1 sm:!min-h-[170px] sm:!rounded-3xl sm:!p-5 ${className}`}
    >
      <div
        className="!pointer-events-none !absolute !inset-0 !opacity-60 !transition-opacity !duration-500 group-hover:!opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 100%, ${HUE_RGB[color]}, transparent 65%)`,
        }}
        aria-hidden="true"
      />

      <div
        className="!pointer-events-none !absolute !inset-x-0 !top-0 !h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        }}
        aria-hidden="true"
      />

      {badge && (
        <div className="!absolute !right-3 !top-3">{badge}</div>
      )}

      <div className="!relative !flex !h-full !flex-col !justify-between !gap-4">
        <div
          className="!inline-flex !h-10 !w-10 !shrink-0 !items-center !justify-center !rounded-xl glass-strong !text-white sm:!h-11 sm:!w-11 sm:!rounded-2xl"
          style={{ boxShadow: `0 0 20px ${HUE_BOX[color]}` }}
        >
          {icon}
        </div>

        <div>
          <div className="!text-[10px] !font-mono !uppercase !tracking-[0.25em] !text-white/40 sm:!text-[11px]">
            {pad(number)}
          </div>
          <h3 className="!mt-1 !text-lg !font-semibold !leading-tight !text-white sm:!text-xl">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}
