"use client";

import { useState } from "react";
import NextLink from "next/link";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { IconLogout, IconMenu2, IconX } from "@tabler/icons-react";
import { signOut } from "@/features/auth/api/auth.client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { isAdminRole, isCheckerRole } from "@/providers/AuthProvider";

const LINKS = [
  { label: "Inicio", href: "/#hero" },
  { label: "Programa", href: "/agenda" },
  { label: "Sumate a la UTPtón", href: "/#donaciones" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, role, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const staff = Boolean(user && (isAdminRole(role) || isCheckerRole(role)));
  const showLoginLink = !isLoading && !user && pathname !== "/login";

  async function handleLogout() {
    await signOut();
    queryClient.clear();
    router.push("/");
  }

  const links =
    pathname === "/"
      ? LINKS
      : LINKS.map((link) => ({
          ...link,
          href: link.href === "/#hero" ? "/" : link.href,
        }));

  return (
    <header className="!fixed !inset-x-0 !top-0 !z-[200] !px-3 !pt-3 sm:!px-6">
      <nav
        aria-label="Navegación principal"
        className="!mx-auto !flex !min-w-0 !max-w-7xl !items-center !gap-3 !rounded-full !border !border-white/15 !bg-[#07152b]/75 !px-3 !py-2 !shadow-[0_12px_48px_rgba(0,0,0,.2)] !backdrop-blur-2xl sm:!px-5"
      >
        <NextLink
          href="/"
          aria-label="UTPton, inicio"
          className="!min-w-0 !shrink"
        >
          <NextImage
            src="/assets/utpton/Logos/Horizontal blanco.png"
            alt="La U del Futuro 2026 · UTPtón"
            width={320}
            height={110}
            className="!h-auto !w-[min(58vw,16rem)] !max-w-full !object-contain md:!h-12 md:!w-auto"
          />
        </NextLink>

        <NextImage
          src="/assets/todos_somo_utp_transparent.png"
          alt="La U del Futuro 2026 · UTPtón"
          width={320}
          height={110}
          className="!h-10 !w-auto sm:!h-12 !hidden md:!block"
        />

        <div className="!ml-auto !hidden !items-center !gap-1 md:!flex">
          {links.map((link) => (
            <NextLink
              key={link.label}
              href={link.href}
              className={`!rounded-full !px-4 !py-2 !text-sm !transition ${
                link.href === "/#donaciones"
                  ? "!bg-[#f5bd35] !font-bold !text-[#08142b] hover:!bg-[#ffd46d]"
                  : "!text-white/80 hover:!bg-white/10 hover:!text-white"
              }`}
            >
              {link.href === "/#donaciones" ? (
                <>
                  <span className="lg:!hidden">{link.label.split(" ")[0]}</span>
                  <span className="!hidden lg:!block">{link.label}</span>
                </>
              ) : (
                <span>{link.label}</span>
              )}
            </NextLink>
          ))}

          {showLoginLink && (
            <NextLink
              href="/login"
              className="!rounded-full !px-4 !py-2 !text-sm !text-white/80 hover:!bg-white/10 hover:!text-white"
            >
              Iniciar sesión
            </NextLink>
          )}

          {staff && (
            <>
              <NextLink
                href="/admin"
                className="!rounded-full !px-4 !py-2 !text-sm !text-white/80 hover:!bg-white/10 hover:!text-white"
              >
                Admin
              </NextLink>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                className="!rounded-full !p-2 !text-white/70 hover:!bg-white/10 hover:!text-white"
              >
                <IconLogout size={18} />
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="!ml-auto !rounded-full !border !border-white/15 !p-2 !text-white md:!hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <IconX size={19} /> : <IconMenu2 size={19} />}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-navigation"
          className="!mx-3 !mt-2 !rounded-2xl !border !border-white/15 !bg-[#07152b]/95 !p-2 !backdrop-blur-2xl sm:!mx-6 md:!hidden"
        >
          {links.map((link) => (
            <NextLink
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="!block !rounded-xl !px-4 !py-3 !text-sm !font-medium !text-white/85 hover:!bg-white/10"
            >
              {link.label}
            </NextLink>
          ))}

          {showLoginLink && (
            <NextLink
              href="/login"
              onClick={() => setOpen(false)}
              className="!block !rounded-xl !px-4 !py-3 !text-sm !font-medium !text-white/85 hover:!bg-white/10"
            >
              Iniciar sesión
            </NextLink>
          )}

          {staff && (
            <>
              <NextLink
                href="/admin"
                onClick={() => setOpen(false)}
                className="!block !rounded-xl !px-4 !py-3 !text-sm !text-white/85 hover:!bg-white/10"
              >
                Administración
              </NextLink>
              <button
                type="button"
                onClick={handleLogout}
                className="!flex !w-full !items-center !gap-2 !rounded-xl !px-4 !py-3 !text-left !text-sm !text-white/85 hover:!bg-white/10"
              >
                <IconLogout size={17} /> Cerrar sesión
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
