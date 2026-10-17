"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

const EVENTS = [
  { src: "/assets/agenda-cultural/0.png", alt: "Agenda cultural, evento 1" },
  { src: "/assets/agenda-cultural/1.png", alt: "Agenda cultural, evento 2" },
  { src: "/assets/agenda-cultural/2.png", alt: "Agenda cultural, evento 3" },
  { src: "/assets/agenda-cultural/3.png", alt: "Agenda cultural, evento 4" },
  { src: "/assets/agenda-cultural/4.png", alt: "Agenda cultural, evento 5" },
  { src: "/assets/agenda-cultural/5.png", alt: "Agenda cultural, evento 6" },
  { src: "/assets/agenda-cultural/6.png", alt: "Agenda cultural, evento 7" },
  { src: "/assets/agenda-cultural/7.png", alt: "Agenda cultural, evento 8" },
  { src: "/assets/agenda-cultural/8.png", alt: "Agenda cultural, evento 9" },
  { src: "/assets/agenda-cultural/9.png", alt: "Agenda cultural, evento 10" },
  { src: "/assets/agenda-cultural/10.png", alt: "Agenda cultural, evento 11" },
  { src: "/assets/agenda-cultural/11.png", alt: "Agenda cultural, evento 12" },
  { src: "/assets/agenda-cultural/12.png", alt: "Agenda cultural, evento 13" },
  { src: "/assets/agenda-cultural/13.png", alt: "Agenda cultural, evento 14" },
];

export function CulturalEventsCarousel() {
  const [active, setActive] = useState(0);
  const pointerStart = useRef<number | null>(null);
  const didSwipe = useRef(false);

  function move(direction: number) {
    setActive(
      (current) => (current + direction + EVENTS.length) % EVENTS.length,
    );
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    pointerStart.current = event.clientX;
    didSwipe.current = false;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (pointerStart.current === null) return;

    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) < 45) return;

    didSwipe.current = true;
    move(distance < 0 ? 1 : -1);
  }

  return (
    <section
      aria-labelledby="cultural-events-title"
      className="!overflow-hidden !bg-[#030407] !px-4 !py-16 text-white sm:!px-6 sm:!py-20"
    >
      <div className="!mx-auto !w-full !max-w-7xl">
        <div className="!mb-9 !text-center sm:!mb-12">
          <p className="!mb-3 !text-xs !font-bold !uppercase !tracking-[0.25em] !text-[#8ac9ff] sm:!text-sm">
            Vive la experiencia
          </p>
          <h2
            id="cultural-events-title"
            className="!text-3xl !font-black !uppercase !tracking-tight sm:!text-4xl md:!text-5xl"
          >
            Agenda cultural
          </h2>
        </div>

        <div
          className="!relative !mx-auto !h-[340px] !max-w-5xl sm:!h-[440px] md:!h-[520px]"
          aria-roledescription="carrusel"
          aria-label="Eventos de la agenda cultural"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => (pointerStart.current = null)}
          style={{ touchAction: "pan-y" }}
        >
          {EVENTS.map((event, index) => {
            const offset = (index - active + EVENTS.length) % EVENTS.length;
            const isActive = offset === 0;
            const isNext = offset === 1;
            const isPrevious = offset === EVENTS.length - 1;
            const isVisible = isActive || isNext || isPrevious;

            return (
              <button
                key={event.src}
                type="button"
                onClick={() => {
                  if (didSwipe.current) {
                    didSwipe.current = false;
                    return;
                  }
                  setActive(index);
                }}
                aria-label={`${event.alt}${isActive ? ", seleccionado" : ", seleccionar"}`}
                aria-current={isActive ? "true" : undefined}
                tabIndex={isVisible ? 0 : -1}
                aria-hidden={!isVisible}
                className={`!absolute !inset-y-0 !left-1/2 !w-[76%] !overflow-hidden !rounded-xl !border-0 !p-0 !transition-all !duration-500 !ease-out focus-visible:!z-20 focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-4 focus-visible:!outline-[#8ac9ff] sm:!w-[62%] ${
                  isActive
                    ? "!z-10 !translate-x-[-50%] !scale-100 !opacity-100 !shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
                    : isVisible
                      ? `!z-0 !scale-[0.78] !opacity-45 ${isNext ? "!translate-x-[18%] sm:!translate-x-[30%]" : "!translate-x-[-118%] sm:!translate-x-[-130%]"}`
                      : "!pointer-events-none !z-0 !translate-x-[-50%] !scale-[0.65] !opacity-0"
                }`}
              >
                <Image
                  src={event.src}
                  alt={event.alt}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 768px) 62vw, 76vw"
                  className="!object-cover"
                />
              </button>
            );
          })}
        </div>

        <div className="!mt-7 !flex !items-center !justify-center !gap-5">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Evento anterior"
            className="!grid !h-11 !w-11 !place-items-center !rounded-full !border !border-white/20 !bg-white/5 !text-white !transition hover:!bg-white/15 focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-[#8ac9ff]"
          >
            <IconArrowLeft size={20} aria-hidden="true" />
          </button>
          <span
            className="!min-w-14 !text-center !text-sm !font-semibold !tabular-nums !text-white/75"
            aria-live="polite"
          >
            {active + 1} / {EVENTS.length}
          </span>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Siguiente evento"
            className="!grid !h-11 !w-11 !place-items-center !rounded-full !border !border-white/20 !bg-white/5 !text-white !transition hover:!bg-white/15 focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-[#8ac9ff]"
          >
            <IconArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
