import { IconBrandInstagram } from "@tabler/icons-react";

export function InstagramUpdates() {
  return (
    <section className="!relative !overflow-hidden !bg-[#030615] !px-4 !py-20 text-white sm:!px-6 md:!py-24">
      <div className="!pointer-events-none !absolute !inset-0 !bg-[radial-gradient(ellipse_at_50%_0%,rgba(35,104,195,.16),transparent_60%)]" />
      <div className="!relative !mx-auto !grid !max-w-6xl !items-center !gap-10 md:!grid-cols-[minmax(0,1fr)_minmax(280px,380px)] md:!gap-16">
        <div>
          <p className="!mb-4 !text-xs !font-bold !uppercase !tracking-[.24em] !text-[#f5bd35]">
            La U del Futuro 2026 · UTPtón
          </p>
          <h2 className="!mb-5 !text-3xl !font-semibold !leading-tight !tracking-tight sm:!text-5xl">
            Sigue las <span className="!text-[#8fcaff]">actualizaciones</span>
          </h2>
          <p className="!mb-8 !max-w-xl !text-base !leading-7 !text-[#b9c4d8] sm:!text-lg">
            Conoce las novedades de la jornada y de la campaña solidaria en el
            Instagram de la Asociación de Egresados UTP.
          </p>
          <a
            href="https://www.instagram.com/aseutp/"
            target="_blank"
            rel="noopener noreferrer"
            className="!inline-flex !items-center !gap-3 !rounded-full !border !border-white/15 !bg-white/[.06] !px-6 !py-3 !text-sm !font-semibold !text-white !transition hover:!border-white/30 hover:!bg-white/10"
          >
            <IconBrandInstagram size={19} aria-hidden="true" />
            Sigue a @aseutp
          </a>
        </div>
        <video
          controls
          preload="none"
          playsInline
          poster="/assets/utpton/instagram-reel-poster.jpg"
          className="!mx-auto !max-h-[70vh] !w-full !max-w-[380px] !rounded-2xl !border !border-white/10 !bg-black !shadow-2xl"
          aria-label="Reel de Instagram de la campaña UTPton"
        >
          <source src="/assets/utpton/instagram-reel.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
