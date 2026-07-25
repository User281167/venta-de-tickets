import type { ReactNode } from "react";

type FooterColumnProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function FooterColumn({
  title,
  children,
  className = "",
}: FooterColumnProps) {
  return (
    <div className={className}>
      {title && (
        <div className="!text-xs !uppercase !tracking-[0.25em] !text-white/40">
          {title}
        </div>
      )}
      <div className="!mt-6">{children}</div>
    </div>
  );
}
