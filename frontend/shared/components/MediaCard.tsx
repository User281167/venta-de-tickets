import type { ReactNode, HTMLAttributes } from "react";

type MediaCardProps = HTMLAttributes<HTMLDivElement> & {
  image: string;
  title: string;
  description: string;
  number: string | number;
  badge?: ReactNode;
  imageHeight?: string;
};

function pad(n: string | number, width = 2): string {
  return String(n).padStart(width, "0");
}

export function MediaCard({
  image,
  title,
  description,
  number,
  badge,
  imageHeight = "aspect-[4/3]",
  className = "",
  ...rest
}: MediaCardProps) {
  return (
    <div
      {...rest}
      className={`group reveal !relative !flex !h-full !flex-col !overflow-hidden !rounded-2xl glass !transition !duration-500 hover:!-translate-y-1 sm:!rounded-3xl ${className}`}
    >
      <div className={`!relative !w-full !overflow-hidden ${imageHeight}`}>
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="!absolute !inset-0 !h-full !w-full !object-cover !transition-transform !duration-1000 group-hover:!scale-105"
        />

        <div className="!pointer-events-none !absolute !inset-0 !bg-gradient-to-t !from-black/80 !via-black/20 !to-transparent" />

        <div className="!absolute !left-4 !top-4 !right-4 !flex !items-start !justify-between !gap-3">
          {badge ? <div>{badge}</div> : <span />}
          <span className="!text-[11px] !font-mono !uppercase !tracking-[0.25em] !text-white/60">
            {pad(number)}
          </span>
        </div>
      </div>

      <div className="!flex !flex-1 !flex-col !gap-2 !p-6 sm:!p-7">
        <h3 className="!text-xl !font-semibold !text-white">{title}</h3>
        <p className="!mt-2 !text-sm !text-white/60">{description}</p>
      </div>
    </div>
  );
}
