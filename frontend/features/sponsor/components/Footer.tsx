"use client";

import { FooterColumn } from "@/shared/components/FooterColumn";
import { IconMail, IconMessageCircle, IconBrandInstagram } from "@tabler/icons-react";

const ICON = { size: 16, stroke: 2 } as const;

const LOGO = "/logos-la-u/Vertical - letras blancas.png";

const LINKS = [
  {
    href: "mailto:egresados@utp.edu.co",
    label: "egresados@utp.edu.co",
    icon: <IconMail {...ICON} />,
  },
  {
    href: "https://wa.me/3113167816",
    label: "WhatsApp · 311 316 7816",
    icon: <IconMessageCircle {...ICON} />,
    external: true,
  },
  {
    href: "https://instagram.com/aseutp",
    label: "@aseutp",
    icon: <IconBrandInstagram {...ICON} />,
    external: true,
  },
];

const LINKS_CLASS =
  "!inline-flex !items-center !gap-2 !text-white/80 hover:!text-white";

const ENTITIES = [
  "Universidad Tecnológica de Pereira",
  "Asociación de Egresados UTP",
  "XXIV Convención de Egresados · 2026",
];

export function SponsorFooter() {
  return (
    <footer className="!relative !border-t !border-white/10 !py-12">
      <div className="!mx-auto !max-w-7xl !px-4 sm:!px-6">
        <div className="!grid !gap-12 md:!grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <img
              src={LOGO}
              alt="La U del Futuro"
              className="!h-24 !w-auto"
              loading="lazy"
            />
            <div className="!mt-4 !text-xs !uppercase !tracking-[0.25em] !text-white/50">
              XXIV Convención de Egresados · UTP 2026
            </div>
          </div>

          <FooterColumn title="Contacto">
            <ul className="!space-y-3 !text-sm">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target={l.external ? "_blank" : undefined}
                    rel={l.external ? "noopener noreferrer" : undefined}
                    className={LINKS_CLASS}
                  >
                    {l.icon}
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn>
            <ul className="!space-y-3 !text-sm !text-white/70">
              {ENTITIES.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </FooterColumn>
        </div>

        <div className="!mt-12 !flex !flex-col !items-start !justify-between !gap-4 !border-t !border-white/10 !pt-8 !text-xs !text-white/40 sm:!flex-row sm:!items-center">
          <div>© 2026 Asociación de Egresados UTP. Todos los derechos reservados.</div>
          <div>Pereira · Colombia</div>
        </div>
      </div>
    </footer>
  );
}
