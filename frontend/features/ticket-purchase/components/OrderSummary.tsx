"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  IconShoppingCart,
  IconTicket,
  IconArrowRight,
} from "@tabler/icons-react";
import { useCart } from "../hooks/useCart";
import { useAuth } from "@/providers/AuthProvider";
import { formatCurrency } from "@/shared/utils/formats";

interface OrderSummaryProps {
  hideComprar?: boolean;
}

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

export const OrderSummary = memo(function OrderSummary({
  hideComprar,
}: OrderSummaryProps) {
  const { items, subtotalCents } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleBuy = () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    router.push("/checkout");
  };

  const totalTickets = items.reduce((sum, i) => sum + i.quantity, 0);
  const isEmpty = items.length === 0;

  return (
    <motion.aside
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
      <div
        className="!pointer-events-none !absolute !-right-20 !-top-20 !h-48 !w-48 !rounded-full !opacity-40 !blur-3xl"
        style={{ background: "oklch(0.7 0.22 280)" }}
        aria-hidden="true"
      />

      <div className="!relative">
        <div className="!mb-5 !flex !items-center !gap-3">
          <div
            className="!flex !h-11 !w-11 !items-center !justify-center !rounded-2xl"
            style={{
              background: "rgba(124, 60, 255, 0.18)",
              border: "1px solid rgba(124, 60, 255, 0.4)",
            }}
          >
            <IconShoppingCart size={20} color="#a78bfa" />
          </div>

          <h2 className="!text-xl !font-black !text-white">Resumen del pedido</h2>
        </div>

        {isEmpty ? (
          <div className="!flex !flex-col !items-center !gap-3 !py-8 !text-center">
            <div
              className="!flex !h-14 !w-14 !items-center !justify-center !rounded-full"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <IconTicket size={28} color="rgba(255,255,255,0.4)" />
            </div>

            <div>
              <h3 className="!text-base !font-semibold !text-white">
                Tu carrito está vacío
              </h3>

              <p className="!text-md !text-white/55">
                Selecciona tus entradas para ver el resumen
              </p>
            </div>
          </div>
        ) : (
          <div className="!flex !flex-col !gap-1">
            <div className="!flex !flex-col !gap-3">
              {items.map((item) => (
                <div
                  key={item.ticketTypeId}
                  className="!flex !flex-wrap !justify-between !items-center !gap-2.5"
                >
                  <div className="flex gap-2">
                    <span
                      className="!inline-flex !shrink-0 !items-center !justify-center !rounded-lg !px-2 !py-1 !text-md !font-black !whitespace-nowrap"
                      style={{
                        background: "rgba(0,229,255,0.12)",
                        border: "1px solid rgba(0,229,255,0.3)",
                        color: "#7dd3fc",
                      }}
                    >
                      x{item.quantity}
                    </span>

                    <div className="!min-w-0 !flex-wrap sm:!flex-1">
                      <p className="!truncate !text-md !font-semibold !text-white">
                        {item.name}
                      </p>

                      <p className="!text-md !whitespace-nowrap !text-white/50">
                        {formatCurrency(item.unitPriceCents)} c/u
                      </p>
                    </div>
                  </div>

                  <p className="!shrink-0 !text-right !text-md !font-black !whitespace-nowrap !text-white">
                    {formatCurrency(item.unitPriceCents * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="!my-4 !h-px"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />

            <div className="!mb-1 !flex !items-center !justify-between">
              <p className="!text-md !text-white/55">
                {totalTickets} entrada{totalTickets !== 1 ? "s" : ""}
              </p>

              <p className="!text-md !text-white/45">IVA incluido</p>
            </div>

            <div className="!flex !flex-wrap !items-center !justify-between">
              <p className="!text-lg !font-black !text-white">Total</p>
              <p
                className="!text-2xl !font-black"
                style={{
                  background: PRIMARY_BORDER,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {formatCurrency(subtotalCents)}
              </p>
            </div>
          </div>
        )}

        {!hideComprar && (
          <button
            type="button"
            disabled={isEmpty}
            onClick={handleBuy}
            className="!mt-6 !flex !w-full !items-center !justify-center !gap-2 !rounded-xl !border !px-5 !py-3.5 !text-md !font-bold !text-white !transition !duration-300 disabled:!cursor-not-allowed disabled:!opacity-50 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg/20 shadow-brand-blue"
            style={{
              background: isEmpty
                ? "rgba(255,255,255,0.04)"
                : "rgba(15, 18, 38, 0.6)",
              borderColor: "rgba(255, 15, 123, 0.4)",
            }}
          >
            <span>COMPRAR</span>
            {!isEmpty && <IconArrowRight size={18} />}
          </button>
        )}
      </div>
    </motion.aside>
  );
});
