import type { ReactNode, HTMLAttributes } from "react";

export type FeatureColor = "cyan" | "violet" | "blue" | "magenta" | "orange" | "verde";
export type FeaturePadding = "sm" | "md" | "lg";

const PADDING = {
  "sm": "!p-2",
  "md": "!p-4 !sm:p-2",
  "lg": "!p-6 !sm:p-8",
}

type FeatureCardProps = HTMLAttributes<HTMLDivElement> & {
  icon: ReactNode;
  title: string;
  description: string;
  color?: FeatureColor;
  badge?: ReactNode;
  shadow?: boolean;
  topBorder?: boolean;
  space?: FeaturePadding;
};

const COLOR_VARS: Record<FeatureColor, { token: string; rgb: string }> = {
  cyan: { token: "var(--color-cyan-neon)", rgb: "oklch(0.7 0.22 260)" },
  violet: { token: "var(--color-violet-neon)", rgb: "oklch(0.7 0.24 320)" },
  blue: { token: "var(--color-utp-azul)", rgb: "oklch(0.75 0.2 200)" },
  magenta: { token: "var(--color-utp-magenta)", rgb: "oklch(0.7 0.24 330)" },
  orange: { token: "var(--color-utp-naranja)", rgb: "oklch(0.78 0.18 45)" },
  verde: { token: "var(--color-utp-verde)", rgb: "oklch(0.85 0.2 145)" },
};

const TW_BG: Record<FeatureColor, string> = {
  cyan: "from-cyan-neon/[0.08] to-cyan-neon/[0.02]",
  violet: "from-violet-neon/[0.08] to-violet-neon/[0.02]",
  blue: "from-[var(--color-utp-azul)]/[0.08] to-[var(--color-utp-azul)]/[0.02]",
  magenta: "from-[var(--color-utp-magenta)]/[0.08] to-[var(--color-utp-magenta)]/[0.02]",
  orange: "from-[var(--color-utp-naranja)]/[0.08] to-[var(--color-utp-naranja)]/[0.02]",
  verde: "from-[var(--color-utp-verde)]/[0.08] to-[var(--color-utp-verde)]/[0.02]",
};

const TW_BORDER: Record<FeatureColor, string> = {
  cyan: "border-cyan-neon/40",
  violet: "border-violet-neon/40",
  blue: "border-[var(--color-utp-azul)]/40",
  magenta: "border-[var(--color-utp-magenta)]/40",
  orange: "border-[var(--color-utp-naranja)]/40",
  verde: "border-[var(--color-utp-verde)]/40",
};

const TW_TEXT: Record<FeatureColor, string> = {
  cyan: "text-cyan-neon",
  violet: "text-violet-neon",
  blue: "text-[var(--color-utp-azul)]",
  magenta: "text-[var(--color-utp-magenta)]",
  orange: "text-[var(--color-utp-naranja)]",
  verde: "text-[var(--color-utp-verde)]",
};

const TW_BG_FILL: Record<FeatureColor, string> = {
  cyan: "bg-cyan-neon/15 ring-cyan-neon/30",
  violet: "bg-violet-neon/15 ring-violet-neon/30",
  blue: "bg-[var(--color-utp-azul)]/15 ring-[var(--color-utp-azul)]/30",
  magenta: "bg-[var(--color-utp-magenta)]/15 ring-[var(--color-utp-magenta)]/30",
  orange: "bg-[var(--color-utp-naranja)]/15 ring-[var(--color-utp-naranja)]/30",
  verde: "bg-[var(--color-utp-verde)]/15 ring-[var(--color-utp-verde)]/30",
};

export function FeatureCard({
  icon,
  title,
  description,
  color = "cyan",
  badge,
  shadow = false,
  topBorder = false,
  className = "",
  space = "lg",
  ...rest
}: FeatureCardProps) {
  const c = COLOR_VARS[color];
  const padding = PADDING[space]

  return (
    <div
      {...rest}
      className={`group reveal !relative !flex !h-full !flex-col !overflow-hidden !rounded-3xl glass !transition !duration-500 hover:!-translate-y-1 ${padding} ${TW_BORDER[color]} ${TW_BG[color]} ${
        shadow
          ? "!border !bg-gradient-to-b"
          : "!border !border-white/10 !bg-gradient-to-b from-white/[0.03] to-transparent"
      } ${className}`}
      style={
        shadow
          ? { boxShadow: `0 0 40px -12px ${c.token}` }
          : undefined
      }
    >
      {topBorder && (
        <div
          className="!absolute !inset-x-0 !top-0 !h-1"
          style={{
            background:
              color === "cyan"
                ? "linear-gradient(90deg, var(--color-cyan-neon), var(--color-violet-neon), var(--color-cyan-neon))"
                : `linear-gradient(90deg, ${c.token}, var(--color-violet-neon), ${c.token})`,
          }}
        />
      )}

      <div
        className="!pointer-events-none !absolute !-right-16 !-top-16 !h-40 !w-40 !rounded-full !opacity-40 !blur-3xl !transition-opacity !duration-500 group-hover:!opacity-80"
        style={{ background: c.rgb }}
        aria-hidden="true"
      />

      {badge && (
        <div
          className={`!absolute !right-4 !top-4 !inline-flex !items-center !gap-1.5 !rounded-full !px-3 !py-1 !text-xs !font-semibold !ring-1 ${TW_BG_FILL[color]} ${TW_TEXT[color]}`}
        >
          {badge}
        </div>
      )}

      <div className="!relative !flex !h-full !flex-col">
        <div
          className={`!inline-flex !h-12 !w-12 !items-center !justify-center !rounded-2xl !text-white ${
            shadow ? `${TW_BG_FILL[color]} ${TW_TEXT[color]}` : "glass-strong"
          }`}
          style={
            shadow
              ? { boxShadow: `0 0 20px -4px ${c.token}` }
              : undefined
          }
        >
          {icon}
        </div>
        <h3 className="!mt-6 !text-xl !font-semibold !text-white">{title}</h3>
        <p className="!mt-3 !text-sm !leading-relaxed !text-white/60">
          {description}
        </p>
      </div>
    </div>
  );
}
