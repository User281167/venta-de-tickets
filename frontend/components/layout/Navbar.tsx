"use client";

import { useState, useEffect, useRef } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconLogout,
  IconMenu2,
  IconQrcode,
  IconShield,
  IconUser,
  IconChevronDown,
  IconX,
} from "@tabler/icons-react";
import { signOut } from "@/features/auth/api/auth.client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { SkeletonButton } from "@/shared/components/SkeletonButton";
import { isAdminRole, isCheckerRole } from "@/providers/AuthProvider";
import { CartFab } from "@/features/ticket-purchase/components/CartFab";
import { CartDrawer } from "@/features/ticket-purchase/components/CartDrawer";
import { useCart } from "@/features/ticket-purchase/hooks/useCart";

type NavItem = { label: string; href: string };

const CENTER_ITEMS: NavItem[] = [
  { label: "ENTRADAS", href: "/entradas" },
];

const MORE_ITEMS: NavItem[] = [
  { label: "Inicio", href: "/#hero" },
  { label: "La Convención", href: "/#convencion" },
  { label: "Agenda", href: "/agenda" },
  { label: "Actividades", href: "/#actividades" },
  { label: "Ponentes", href: "/#speakers" },
  { label: "Aliados", href: "/aliados" },
  { label: "Contacto", href: "/#contacto" },
];

const POPOVER_STYLE = {
  background: "rgba(15, 18, 38, 0.85)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  backdropFilter: "blur(20px) saturate(140%)",
} as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);

  const isAuthPage = useIsAuthPage();
  const { user, role, isLoading } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setUserOpen(false);
    router.push("/");
  };

  const closeMobile = () => setOpen(false);
  const closeMore = () => setMoreOpen(false);
  const closeUser = () => setUserOpen(false);

  return (
    <header
      className={`!fixed !inset-x-0 !top-0 !z-[200] !transition-all !duration-500 ${
        scrolled ? "!py-3" : "!py-4"
      }`}
    >
      <div className="!mx-auto !max-w-7xl !px-4 sm:!px-6">
        <nav
          className={`!flex !items-center !gap-2 !rounded-full !border !border-white/10 !px-3 !py-2 sm:!gap-3 sm:!px-5 ${
            scrolled ? "!bg-white/[0.04]" : "!bg-white/[0.06]"
          } !transition-all !duration-500`}
          style={{
            WebkitBackdropFilter: scrolled
              ? "blur(20px) saturate(140%)"
              : "blur(14px) saturate(130%)",
            backdropFilter: scrolled
              ? "blur(20px) saturate(140%)"
              : "blur(14px) saturate(130%)",
          }}
        >
          <NextLink href="/" className="!flex !shrink-0 !items-center" aria-label="UTP">
            <img
              src="/utp-logo.png"
              alt="Universidad Tecnológica de Pereira"
              className="!h-9 !w-auto sm:!h-10"
            />
          </NextLink>

          {CENTER_ITEMS.map((item) => (
            <NextLink
              key={item.href + item.label}
              href={item.href}
              className="!hidden !rounded-full !px-4 !py-2 !text-sm !text-white/70 !transition hover:!bg-white/5 hover:!text-white md:!inline-flex"
            >
              {item.label}
            </NextLink>
          ))}

          <div ref={moreRef} className="!relative !hidden md:!block">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className="!inline-flex !items-center !gap-1 !rounded-full !px-4 !py-2 !text-sm !text-white/70 !transition hover:!bg-white/5 hover:!text-white"
            >
              <span>Más</span>
              <IconChevronDown
                size={14}
                className={`!transition-transform ${moreOpen ? "!rotate-180" : ""}`}
              />
            </button>

            {moreOpen && (
              <div
                role="menu"
                className="!absolute !left-0 !top-full !z-30 !mt-2 !min-w-[220px] !rounded-2xl !border !border-white/10 !p-1.5 !shadow-2xl"
                style={POPOVER_STYLE}
              >
                {MORE_ITEMS.map((item) => (
                  <NextLink
                    key={item.href + item.label}
                    href={item.href}
                    role="menuitem"
                    onClick={closeMore}
                    className="!block !rounded-xl !px-3 !py-2 !text-sm !text-white/75 !transition hover:!bg-white/10 hover:!text-white"
                  >
                    {item.label}
                  </NextLink>
                ))}
              </div>
            )}
          </div>

          <div className="!ml-auto !flex !items-center !gap-2">
            <CartFab itemCount={totalItems} onClick={() => setCartOpen(true)} />

            {isLoading ? (
              <SkeletonButton count={1} />
            ) : user ? (
              <div ref={userRef} className="!relative !hidden md:!block">
                <button
                  type="button"
                  onClick={() => setUserOpen((v) => !v)}
                  aria-expanded={userOpen}
                  aria-haspopup="menu"
                  className="!inline-flex !items-center !justify-center !rounded-full !border !border-white/10 !p-2 !text-white/85 !transition hover:!bg-white/10 hover:!text-white"
                  aria-label="Menú de usuario"
                >
                  <IconUser size={18} />
                </button>

                {userOpen && (
                  <div
                    role="menu"
                    className="!absolute !right-0 !top-full !z-30 !mt-2 !min-w-[220px] !rounded-2xl !border !border-white/10 !p-1.5 !shadow-2xl"
                    style={POPOVER_STYLE}
                  >
                    <div className="!px-3 !pt-2 !pb-1 !text-[11px] !font-medium !uppercase !tracking-[0.18em] !text-white/40">
                      Sesión iniciada
                    </div>
                    {isAdminRole(role) && (
                      <NextLink
                        href="/admin"
                        role="menuitem"
                        onClick={closeUser}
                        className="!flex !items-center !gap-2 !rounded-xl !px-3 !py-2 !text-sm !text-white/85 !transition hover:!bg-white/10 hover:!text-white"
                      >
                        <IconShield size={16} />
                        Admin
                      </NextLink>
                    )}
                    {isCheckerRole(role) && (
                      <NextLink
                        href="/admin/checkin"
                        role="menuitem"
                        onClick={closeUser}
                        className="!flex !items-center !gap-2 !rounded-xl !px-3 !py-2 !text-sm !text-white/85 !transition hover:!bg-white/10 hover:!text-white"
                      >
                        <IconQrcode size={16} />
                        Check-in
                      </NextLink>
                    )}
                    <NextLink
                      href="/mi-cuenta"
                      role="menuitem"
                      onClick={closeUser}
                      className="!flex !items-center !gap-2 !rounded-xl !px-3 !py-2 !text-sm !text-white/85 !transition hover:!bg-white/10 hover:!text-white"
                    >
                      <IconUser size={16} />
                      Mi Perfil
                    </NextLink>
                    <div className="!my-1 !h-px !bg-white/10" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      role="menuitem"
                      className="!flex !w-full !items-center !gap-2 !rounded-xl !px-3 !py-2 !text-left !text-sm !text-white/85 !transition hover:!bg-white/10 hover:!text-white"
                    >
                      <IconLogout size={16} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !isAuthPage && (
                <>
                  <NextLink
                    href="/login"
                    className="!hidden !items-center !justify-center !rounded-full !border !border-white/10 !px-5 !py-2 !text-sm !font-semibold !text-white/85 !transition hover:!bg-white/10 hover:!text-white sm:!inline-flex"
                  >
                    Iniciar sesión
                  </NextLink>
                  <NextLink
                    href="/registro"
                    className="!hidden !items-center !justify-center !rounded-full !bg-white !px-5 !py-2 !text-sm !font-semibold !text-black !transition hover:!bg-white/90 sm:!inline-flex"
                  >
                    Inscríbete
                  </NextLink>
                </>
              )
            )}

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="!inline-flex !items-center !justify-center !rounded-full !border !border-white/10 !p-2 !text-white/85 !transition hover:!bg-white/10 hover:!text-white md:!hidden"
              aria-label="Menú"
              aria-expanded={open}
            >
              {open ? <IconX size={18} /> : <IconMenu2 size={18} />}
            </button>
          </div>
        </nav>

        {open && (
          <div
            className="!mt-2 !overflow-hidden !rounded-2xl !border !border-white/10 !p-2"
            style={POPOVER_STYLE}
          >
            <div className="!flex !flex-col">
              {[...CENTER_ITEMS, ...MORE_ITEMS].map((item) => (
                <NextLink
                  key={item.href + item.label}
                  href={item.href}
                  onClick={closeMobile}
                  className="!rounded-xl !px-3 !py-2 !text-sm !text-white/80 !transition hover:!bg-white/10 hover:!text-white"
                >
                  {item.label}
                </NextLink>
              ))}

              {isLoading ? (
                <div className="!p-2">
                  <SkeletonButton count={2} />
                </div>
              ) : user ? (
                <>
                  {isAdminRole(role) && (
                    <NextLink
                      href="/admin"
                      onClick={closeMobile}
                      className="!rounded-xl !px-3 !py-2 !text-sm !text-white/80 !transition hover:!bg-white/10 hover:!text-white"
                    >
                      Admin
                    </NextLink>
                  )}
                  {isCheckerRole(role) && (
                    <NextLink
                      href="/admin/checkin"
                      onClick={closeMobile}
                      className="!rounded-xl !px-3 !py-2 !text-sm !text-white/80 !transition hover:!bg-white/10 hover:!text-white"
                    >
                      Check-in
                    </NextLink>
                  )}
                  <NextLink
                    href="/mi-cuenta"
                    onClick={closeMobile}
                    className="!rounded-xl !px-3 !py-2 !text-sm !text-white/80 !transition hover:!bg-white/10 hover:!text-white"
                  >
                    Mi Perfil
                  </NextLink>
                  <button
                    type="button"
                    onClick={() => {
                      closeMobile();
                      handleLogout();
                    }}
                    className="!rounded-xl !px-3 !py-2 !text-left !text-sm !text-white/80 !transition hover:!bg-white/10 hover:!text-white"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                !isAuthPage && (
                  <>
                    <NextLink
                      href="/login"
                      onClick={closeMobile}
                      className="!rounded-xl !px-3 !py-2 !text-sm !text-white/80 !transition hover:!bg-white/10 hover:!text-white"
                    >
                      Iniciar sesión
                    </NextLink>
                    <NextLink
                      href="/registro"
                      onClick={closeMobile}
                      className="!rounded-xl !bg-white !px-3 !py-2 !text-center !text-sm !font-semibold !text-black !transition hover:!bg-white/90"
                    >
                      Inscríbete
                    </NextLink>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}

function useIsAuthPage(): boolean {
  const pathname = usePathname();
  return pathname === "/login" || pathname === "/registro";
}
