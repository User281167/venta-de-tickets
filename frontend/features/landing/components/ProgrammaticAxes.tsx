import { IconBrain, IconHeartHandshake, IconNetwork, IconTrendingUp } from "@tabler/icons-react";

const AXES = [
  { number: "01", title: "Futuro e inteligencia artificial", text: "Conocimiento para comprender la transformación tecnológica y construir la Universidad del Futuro.", icon: IconBrain, color: "#55c8ff" },
  { number: "02", title: "Empleo y reactivación", text: "Conexiones entre egresados, empresas, emprendimientos y nuevas oportunidades.", icon: IconTrendingUp, color: "#f5bd35" },
  { number: "03", title: "Encuentro de egresados", text: "Un espacio para reencontrarnos, compartir experiencias y fortalecer la comunidad UTP.", icon: IconNetwork, color: "#b39aff" },
  { number: "04", title: "Solidaridad y memoria", text: "Aportes voluntarios para apoyar a la comunidad UTP afectada y honrar su memoria.", icon: IconHeartHandshake, color: "#ff8292" },
];

export function ProgrammaticAxes() {
  return (
    <section className="!relative !overflow-hidden !bg-[#061126] !px-4 !py-20 text-white sm:!px-6 md:!py-28">
      <div className="!pointer-events-none !absolute !inset-0 !bg-[radial-gradient(ellipse_at_50%_0%,rgba(35,104,195,.18),transparent_55%)]" />
      <div className="!relative !mx-auto !max-w-7xl">
        <p className="!mb-4 !text-center !text-xs !font-bold !uppercase !tracking-[.24em] !text-[#f5bd35]">Una jornada, cuatro propósitos</p>
        <h2 className="!mx-auto !mb-12 !max-w-3xl !text-center !text-3xl !font-semibold !leading-tight !tracking-tight sm:!text-5xl">Pensar el futuro también es <span className="!text-[#8fcaff]">estar juntos</span></h2>
        <div className="!grid !gap-4 sm:!grid-cols-2 lg:!grid-cols-4">
          {AXES.map(({ number, title, text, icon: Icon, color }) => (
            <article key={number} className="!rounded-2xl !border !border-white/10 !bg-white/[.045] !p-6 !backdrop-blur-sm">
              <div className="!mb-8 !flex !items-center !justify-between">
                <span className="!text-xs !font-semibold !tracking-[.2em] !text-white/40">{number}</span>
                <Icon size={23} color={color} />
              </div>
              <h3 className="!mb-3 !text-lg !font-semibold !leading-snug">{title}</h3>
              <p className="!text-sm !leading-6 !text-[#b9c4d8]">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
