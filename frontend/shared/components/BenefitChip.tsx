import type { HTMLAttributes } from "react";

type BenefitChipProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  hue: number;
};

export function BenefitChip({ label, hue, className = "", ...rest }: BenefitChipProps) {
  return (
    <div
      {...rest}
      className={`group !flex !items-center !gap-3 !rounded-2xl glass !px-5 !py-4 !transition hover:!bg-white/10 ${className}`}
    >
      <span
        className="!h-2 !w-2 !shrink-0 !rounded-full"
        style={{
          background: `oklch(0.75 0.22 ${hue})`,
          boxShadow: `0 0 10px oklch(0.75 0.22 ${hue})`,
        }}
      />
      <span className="!text-sm !text-white/85">{label}</span>
    </div>
  );
}
