import NextLink from "next/link";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandYoutube,
  IconMail,
  IconMapPin,
  IconPhone,
  IconWorld,
} from "@tabler/icons-react";

const QUICK_LINKS = [
  { label: "La Convención", href: "/#convencion" },
  { label: "Agenda", href: "/agenda" },
  { label: "Actividades", href: "/#actividades" },
  { label: "Invitados", href: "/#invitados" },
  { label: "Entradas", href: "/#entradas" },
  { label: "Contacto", href: "/#contacto" },
  { label: "Aliados", href: "/aliados" },
];

const GRADIENT_TEXT = {
  backgroundImage:
    "linear-gradient(100deg, #7dd3fc 0%, #a78bfa 35%, #f0abfc 65%, #fdba74 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="!text-[11px] !font-black !uppercase !tracking-[0.22em]"
      style={GRADIENT_TEXT}
    >
      {children}
    </span>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="!inline-flex !h-9 !w-9 !items-center !justify-center !rounded-full !border !border-white/10 !bg-white/[0.04] !text-white/70 !transition !duration-300 hover:!border-white/30 hover:!bg-white/10 hover:!text-white"
    >
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer
      id="contacto"
      className="!relative !overflow-hidden !pt-12 !pb-6 md:!pt-16"
      style={{ background: "#030615" }}
    >
      <div
        className="!pointer-events-none !absolute !-top-40 !left-[-10%] !h-[640px] !w-[640px] !rounded-full !opacity-100 !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,15,123,0.45) 0%, rgba(255,15,123,0.18) 35%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="!pointer-events-none !absolute !-bottom-40 !right-[-10%] !h-[600px] !w-[600px] !rounded-full !opacity-100 !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,194,255,0.4) 0%, rgba(160,16,96,0.2) 35%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="!pointer-events-none !absolute !left-1/2 !top-1/2 !h-[420px] !w-[420px] !-translate-x-1/2 !-translate-y-1/2 !rounded-full !opacity-100 !blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(124,60,255,0.32) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="!relative !z-10 !mx-auto !max-w-7xl !px-4 sm:!px-6">
        <div className="!grid !grid-cols-1 !gap-10 sm:!grid-cols-2 lg:!grid-cols-4">
          <div className="!flex !flex-col !items-start !gap-4">
            <Eyebrow>Organiza</Eyebrow>
            <img
              src="/utp-logo.png"
              alt="Universidad Tecnológica de Pereira"
              className="!h-12 !w-auto"
              loading="lazy"
            />
            <div className="!flex !flex-wrap !gap-2 !pt-1">
              <SocialLink
                href="https://instagram.com/UTPereira"
                label="Instagram"
              >
                <IconBrandInstagram size={18} />
              </SocialLink>
              <SocialLink
                href="https://www.facebook.com/UTPereira"
                label="Facebook"
              >
                <IconBrandFacebook size={18} />
              </SocialLink>
              <SocialLink
                href="https://www.youtube.com/UTPereira"
                label="YouTube"
              >
                <IconBrandYoutube size={18} />
              </SocialLink>
              <SocialLink href="https://x.com/UTPereira" label="X">
                <IconBrandX size={18} />
              </SocialLink>
              <SocialLink
                href="https://www.linkedin.com/school/universidad-tecnol-gica-de-pereira/"
                label="LinkedIn"
              >
                <IconBrandLinkedin size={18} />
              </SocialLink>
            </div>
          </div>

          <div className="!flex !flex-col !items-start !gap-4">
            <Eyebrow>Con el apoyo de</Eyebrow>
            <div className="!flex !items-start !gap-3">
              <img
                src="/ASE-icon.png"
                alt="ASE UTP"
                className="!h-12 !w-12 !object-contain"
                loading="lazy"
              />
              <div className="!flex !flex-col !items-start !gap-1">
                <span className="!text-sm !font-black !text-white">
                  ASE UTP
                </span>
                <span className="!text-xs !leading-snug !text-white/55">
                  Asociación de Egresados Universidad Tecnológica de Pereira
                </span>
                <div className="!flex !gap-2 !pt-1">
                  <SocialLink
                    href="https://egresados.utp.edu.co/"
                    label="Sitio web"
                  >
                    <IconWorld size={16} />
                  </SocialLink>
                  <SocialLink
                    href="https://www.instagram.com/aseutp/"
                    label="Instagram"
                  >
                    <IconBrandInstagram size={16} />
                  </SocialLink>
                  <SocialLink
                    href="https://www.facebook.com/EgresadosUTP"
                    label="Facebook"
                  >
                    <IconBrandFacebook size={16} />
                  </SocialLink>
                </div>
              </div>
            </div>
          </div>

          <div className="!flex !flex-col !items-start !gap-4">
            <Eyebrow>Enlaces rápidos</Eyebrow>
            <ul className="!flex !flex-col !gap-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <NextLink
                    href={link.href}
                    className="!text-sm !text-white/65 !transition hover:!text-white"
                  >
                    {link.label}
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="!flex !flex-col !items-start !gap-4">
            <Eyebrow>Información</Eyebrow>
            <div className="!flex !items-start !gap-2 !text-sm !text-white/65">
              <IconMapPin
                size={16}
                className="!mt-0.5 !shrink-0 !text-white/55"
              />
              <span>Universidad Tecnológica de Pereira</span>
            </div>
            <a
              href="mailto:egresados@utp.edu.co"
              className="!flex !items-start !gap-2 !text-sm !text-white/65 !transition hover:!text-white"
            >
              <IconMail
                size={16}
                className="!mt-0.5 !shrink-0 !text-white/55"
              />
              <span>egresados@utp.edu.co</span>
            </a>
            <a
              href="mailto:aseutp@utp.edu.co"
              className="!flex !items-start !gap-2 !text-sm !text-white/65 !transition hover:!text-white"
            >
              <IconMail
                size={16}
                className="!mt-0.5 !shrink-0 !text-white/55"
              />
              <span>aseutp@utp.edu.co</span>
            </a>
            <a
              href="tel:+576063137110"
              className="!flex !items-start !gap-2 !text-sm !text-white/65 !transition hover:!text-white"
            >
              <IconPhone
                size={16}
                className="!mt-0.5 !shrink-0 !text-white/55"
              />
              <span>+57 606 313 7110 - 313 7533</span>
            </a>
          </div>
        </div>

        <div
          className="!my-8 !h-px"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />

        <div className="!flex !flex-col !items-center !justify-between !gap-4 sm:!flex-row">
          <span className="!text-xs !text-white/50">
            &copy; {new Date().getFullYear()} Universidad Tecnológica de
            Pereira - ASE UTP.
          </span>
          <div className="!flex !gap-5 !text-xs !text-white/50">
            <NextLink
              href="/privacidad"
              className="!transition hover:!text-white"
            >
              Política de privacidad
            </NextLink>
            <NextLink
              href="/terminos"
              className="!transition hover:!text-white"
            >
              Términos y condiciones
            </NextLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
