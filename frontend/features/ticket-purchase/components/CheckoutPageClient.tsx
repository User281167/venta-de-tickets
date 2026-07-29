"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { IconTicket, IconAlertCircle, IconLock } from "@tabler/icons-react";
import { useCart } from "../hooks/useCart";
import { useCreateCheckoutPreference } from "../api/checkout.queries";
import { CheckoutError } from "../api/checkout.api";
import { useMe } from "@/features/users/hooks/useProfile";
import { OrderSummary } from "./OrderSummary";
import { MpWalletButton } from "./MpWalletButton";
import { EpaycoCheckoutButton } from "@/features/payments/components/EpaycoCheckoutButton";
import { UserIncompleteDialog } from "./UserIncompleteDialog";
import {
  CheckoutErrorDialog,
  type CheckoutErrorCode,
} from "./CheckoutErrorDialog";
import { PageShell } from "@/shared/components/PageShell";
import { formatCurrency } from "@/shared/utils/formats";

const PROFILE_FIELDS = ["cedula", "fullName"] as const;

const VIEWPORT = { once: true, margin: "-10% 0px -10% 0px" } as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

const PRIMARY_BORDER =
  "linear-gradient(100deg, #ff0f7b 0%, #a78bfa 35%, #00e5ff 65%, #fdba74 100%)";

function pickMissingFields(user: {
  cedula: string | null;
  fullName: string | null;
}): string[] {
  return PROFILE_FIELDS.filter((f) => !user[f]);
}

function isCheckoutError(err: unknown): err is CheckoutError {
  return err instanceof CheckoutError;
}

export function CheckoutPageClient() {
  const { items } = useCart();
  const router = useRouter();
  const mutation = useCreateCheckoutPreference();
  const { data: meData, isLoading: isLoadingMe } = useMe();

  const [selectedProvider, setSelectedProvider] = useState<"mercadopago" | "epayco">("mercadopago");
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [autoOpenHandled, setAutoOpenHandled] = useState(false);

  const preferenceId = mutation.data?.preferenceId ?? null;

  useEffect(() => {
    if (items.length === 0) {
      router.push("/entradas");
    }
  }, [items, router]);

  const missingFields = meData?.user
    ? pickMissingFields({
        cedula: meData.user.cedula,
        fullName: meData.user.fullName,
      })
    : [];
  const isProfileIncomplete = missingFields.length > 0;

  useEffect(() => {
    if (
      !isLoadingMe &&
      meData?.user &&
      isProfileIncomplete &&
      !autoOpenHandled
    ) {
      setProfileDialogOpen(true);
      setAutoOpenHandled(true);
    }
  }, [isLoadingMe, meData, isProfileIncomplete, autoOpenHandled]);

  if (items.length === 0) return null;

  const totalTickets = items.reduce((sum, i) => sum + i.quantity, 0);
  const err = mutation.error;
  const isError = mutation.isError;
  const errorCode: CheckoutErrorCode | "USER_INFO_INCOMPLETE" | null = err
    ? (err as { code?: string }).code === "USER_INFO_INCOMPLETE"
      ? "USER_INFO_INCOMPLETE"
      : (((err as { code?: string }).code as CheckoutErrorCode) ?? "INTERNAL_ERROR")
    : null;

  const dialogMissingFields = isCheckoutError(err) ? err.missingFields : missingFields;
  const dialogMessage = isCheckoutError(err) ? err.message : undefined;

  const handlePagar = () => {
    if (isProfileIncomplete) {
      setProfileDialogOpen(true);
      return;
    }

    mutation.mutate({ items, provider: selectedProvider });
  };

  const handleDialogRetry = () => {
    mutation.reset();

    if (items.length > 0 && !isProfileIncomplete) {
      mutation.mutate({ items, provider: selectedProvider });
    }
  };

  const handleProfileDialogChange = (open: boolean) => {
    setProfileDialogOpen(open);

    if (!open && isError && errorCode === "USER_INFO_INCOMPLETE") {
      mutation.reset();
    }
  };

  const handleErrorDialogChange = (open: boolean) => {
    setErrorDialogOpen(open);

    if (!open && isError && errorCode !== "USER_INFO_INCOMPLETE") {
      mutation.reset();
    }
  };

  const pagarDisabled =
    mutation.isPending || isProfileIncomplete || isLoadingMe;

  const profileDialogForceOpen = isError && errorCode === "USER_INFO_INCOMPLETE";
  const errorDialogForceOpen =
    isError && errorCode !== null && errorCode !== "USER_INFO_INCOMPLETE";

  return (
    <PageShell
      eyebrow="Finalizar compra"
      title="Revisa tu pedido"
      subtitle={`${totalTickets} entrada${totalTickets !== 1 ? "s" : ""} en tu carrito`}
    >
      <div className="!grid !grid-cols-1 !gap-6 lg:!grid-cols-[2fr_1fr] lg:!items-start">
        <div className="!flex !flex-col !gap-4">
          {items.map((item, i) => (
            <motion.article
              key={item.ticketTypeId}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT}
              variants={fadeUp}
              custom={i}
              className="!relative !grid !grid-cols-[auto_1fr] !items-center !gap-3 !overflow-hidden !rounded-3xl glass !p-4 sm:!grid-cols-[auto_1fr_auto_auto] sm:!gap-4 sm:!p-5 md:!gap-6"
              style={{
                background: "rgba(15, 18, 38, 0.45)",
                WebkitBackdropFilter: "blur(14px) saturate(140%)",
                backdropFilter: "blur(14px) saturate(140%)",
              }}
            >
              <div
                className="!flex !h-12 !w-12 !items-center !justify-center !rounded-2xl"
                style={{
                  background: "rgba(0, 229, 255, 0.12)",
                  border: "1px solid rgba(0, 229, 255, 0.3)",
                }}
              >
                <IconTicket size={22} color="#00e5ff" />
              </div>

              <div className="!min-w-0">
                <h3 className="!text-base !font-black !text-white sm:!text-lg">
                  {item.name}
                </h3>

                <p className="!text-xs !text-white/50 sm:!text-sm">
                  {formatCurrency(item.unitPriceCents * 100)} c/u
                </p>
              </div>

              <div className="!col-span-2 !flex !items-center !justify-between !gap-2 !whitespace-nowrap sm:!col-span-1 sm:!flex-col sm:!justify-center">
                <span className="!text-[10px] !font-medium !uppercase !tracking-[0.18em] !text-white/40">
                  Cantidad
                </span>

                <span className="!shrink-0 !rounded-lg !px-2 !py-1 !text-sm !font-black !whitespace-nowrap"
                  style={{
                    background: "rgba(0,229,255,0.12)",
                    border: "1px solid rgba(0,229,255,0.3)",
                    color: "#7dd3fc",
                  }}
                >
                  x{item.quantity}
                </span>
              </div>

              <div className="!col-span-2 !flex !items-center !justify-between !gap-2 !whitespace-nowrap sm:!col-span-1 sm:!flex-col sm:!items-end sm:!justify-center">
                <span className="!text-[10px] !font-medium !uppercase !tracking-[0.18em] !text-white/40">
                  Subtotal
                </span>

                <span
                  className="!shrink-0 !text-base !font-black !whitespace-nowrap sm:!text-lg"
                  style={{
                    background: PRIMARY_BORDER,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {formatCurrency(item.unitPriceCents * item.quantity * 100)}
                </span>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="lg:!sticky lg:!top-28">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            variants={fadeUp}
            custom={0}
            className="!relative !overflow-hidden !rounded-3xl glass !p-6 sm:!p-7"
            style={{
              background: "rgba(15, 18, 38, 0.45)",
              WebkitBackdropFilter: "blur(14px) saturate(140%)",
              backdropFilter: "blur(14px) saturate(140%)",
            }}
          >
            <OrderSummary hideComprar />

            <div className="!mb-4 !flex !gap-2">
              <button
                type="button"
                onClick={() => setSelectedProvider("mercadopago")}
                className={`!flex-1 !rounded-lg !p-2 !text-xs !font-bold !uppercase !tracking-[0.12em] !transition ${
                  selectedProvider === "mercadopago"
                    ? "!bg-[#ffe600] !text-[#2d3277]"
                    : "!bg-white/5 !text-white/50 hover:!bg-white/10"
                }`}
              >
                Mercado Pago
              </button>
              <button
                type="button"
                onClick={() => setSelectedProvider("epayco")}
                className={`!flex-1 !rounded-lg !p-2 !text-xs !font-bold !uppercase !tracking-[0.12em] !transition ${
                  selectedProvider === "epayco"
                    ? "!bg-white !text-black"
                    : "!bg-white/5 !text-white/50 hover:!bg-white/10"
                }`}
              >
                ePayco
              </button>
            </div>

            {selectedProvider === "epayco" && (
              <EpaycoCheckoutButton
                backUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/checkout`}
              />
            )}

            {selectedProvider === "mercadopago" && preferenceId && (
              <div className="!mt-4" data-testid="wallet-section">
                <MpWalletButton preferenceId={preferenceId} />
              </div>
            )}

            {selectedProvider === "mercadopago" && !preferenceId && !mutation.isError && (
              <div className="!flex !flex-col !gap-2">
                <button
                  type="button"
                  onClick={handlePagar}
                  disabled={pagarDisabled}
                  title={
                    isProfileIncomplete
                      ? "Completa tu perfil para pagar"
                      : undefined
                  }
                  data-testid="pagar-mp-button"
                  className="!relative !flex !h-16 !w-full !items-center !justify-center !overflow-hidden !rounded-xl !bg-[#ffe600] !p-2 !transition !duration-300 hover:!translate-y-[-2px] disabled:!cursor-not-allowed disabled:!opacity-60 disabled:hover:!translate-y-0"
                  style={{
                    boxShadow: pagarDisabled
                      ? undefined
                      : "0 8px 24px rgba(255,230,0,0.25)",
                  }}
                >
                  {mutation.isPending ? (
                    <div className="!flex !items-center !gap-2 !text-[#2d3277]">
                      <span
                        className="!inline-block !h-4 !w-4 !animate-spin !rounded-full !border-2 !border-[#2d3277] !border-t-transparent"
                        aria-hidden="true"
                      />

                      <span className="!font-bold">
                        Creando preferencia de pago...
                      </span>
                    </div>
                  ) : (
                    <div className="!relative !h-full !w-full">
                      <NextImage
                        src="/logo-mercado-libre.png"
                        alt="Mercado Pago"
                        fill
                        sizes="200px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  )}
                </button>

                <p className="!flex !items-center !justify-center !gap-1.5 !text-[10px] !uppercase !tracking-[0.18em] !text-white/35">
                  <IconLock size={11} />
                  Pago seguro Mercado Pago
                </p>

                {isProfileIncomplete && !mutation.isPending && (
                  <div
                    className="!flex !items-center !gap-2 !rounded-lg !p-2"
                    style={{
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.2)",
                    }}
                  >
                    <IconAlertCircle size={16} color="#f59e0b" />

                    <p
                      className="!text-xs !leading-tight !text-amber-200"
                      data-testid="profile-incomplete-hint"
                    >
                      Completa tu cédula y nombre para pagar
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <UserIncompleteDialog
        open={profileDialogOpen || profileDialogForceOpen}
        onOpenChange={handleProfileDialogChange}
        missingFields={
          isError && errorCode === "USER_INFO_INCOMPLETE"
            ? dialogMissingFields
            : missingFields
        }
        defaultCedula={meData?.user?.cedula}
        defaultFullName={meData?.user?.fullName}
      />

      <CheckoutErrorDialog
        open={errorDialogOpen || errorDialogForceOpen}
        onOpenChange={handleErrorDialogChange}
        code={errorCode as CheckoutErrorCode | null}
        message={dialogMessage}
        onRetry={handleDialogRetry}
      />
    </PageShell>
  );
}
