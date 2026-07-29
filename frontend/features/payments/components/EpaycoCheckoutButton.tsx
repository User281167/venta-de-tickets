"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { IconLock } from "@tabler/icons-react";
import { useCart } from "@/features/ticket-purchase/hooks/useCart";
import { useCreateEpaycoCheckout } from "../api/epayco.queries";

declare const ePayco: {
  checkout: {
    configure: (config: {
      sessionId: string;
      type: "onpage" | "standard";
      test: boolean;
    }) => {
      open: () => void;
      setHooks: (hooks: {
        onCreated?: (data: unknown) => void;
        onResponse?: (response: { ref_payco?: string; x_response?: string; x_ref_payco?: string }) => void;
        onErrors?: (error: unknown) => void;
        onClosed?: (errors?: unknown) => void;
      }) => void;
    };
  };
};

interface EpaycoCheckoutButtonProps {
  backUrl: string;
}

export function EpaycoCheckoutButton({ backUrl }: EpaycoCheckoutButtonProps) {
  const router = useRouter();
  const { items } = useCart();
  const mutation = useCreateEpaycoCheckout();
  const [scriptReady, setScriptReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof ePayco !== "undefined") {
      setScriptReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.epayco.co/checkout-v2.js";
    script.async = true;
    script.onload = () => {
      if (typeof ePayco !== "undefined") {
        setScriptReady(true);
      } else {
        setErrorMsg("ePayco no cargó correctamente.");
      }
    };
    script.onerror = () => {
      setErrorMsg("Error al cargar ePayco. Verifica tu conexión.");
    };
    document.body.appendChild(script);
  }, []);

  const handlePagar = useCallback(async () => {
    setErrorMsg("");

    if (!scriptReady) {
      setErrorMsg("Medio de pago no disponible.");
      return;
    }

    const mutationResult = await mutation.mutateAsync({
      items: items.map((i) => ({
        ticketTypeId: i.ticketTypeId,
        quantity: i.quantity,
      })),
      backUrl,
    });

    const sessionId = mutationResult.sessionId;
    if (!sessionId) {
      setErrorMsg("Error al crear sesión de pago.");
      return;
    }

    const checkout = ePayco.checkout.configure({
      sessionId,
      type: "onpage",
      test: process.env.NEXT_PUBLIC_EPAYCO_TEST === "true",
    });

    checkout.setHooks({
      onResponse: (response) => {
        if (response.x_response === "Aceptada") {
          router.push(
            `/checkout/result?ref_payco=${response.x_ref_payco ?? ""}`,
          );
        } else {
          setErrorMsg("El pago no fue procesado. Intenta de nuevo.");
        }
      },
      onErrors: (error) => {
        setErrorMsg("Error al procesar el pago.");
      },
      onClosed: () => {
        mutation.reset();
      },
    });

    checkout.open();
  }, [scriptReady, mutation, items, backUrl, router]);

  return (
    <div className="!mt-4 !flex !flex-col !gap-2">
      <button
        type="button"
        onClick={handlePagar}
        disabled={mutation.isPending || !scriptReady}
        data-testid="epayco-pay-button"
        className="!relative !flex !h-16 !w-full !items-center !justify-center !overflow-hidden !rounded-xl !bg-white !p-2 !transition !duration-300 hover:!translate-y-[-2px] disabled:!cursor-not-allowed disabled:!opacity-60 disabled:hover:!translate-y-0"
        style={{
          boxShadow:
            mutation.isPending || !scriptReady
              ? undefined
              : "0 8px 24px rgba(0,201,183,0.25)",
        }}
      >
        {mutation.isPending ? (
          <div className="!flex !items-center !gap-2 !text-white">
            <span
              className="!inline-block !h-4 !w-4 !animate-spin !rounded-full !border-2 !border-white !border-t-transparent"
              aria-hidden="true"
            />
            <span className="!font-bold">Creando sesión de pago...</span>
          </div>
        ) : (
          <div className="!relative !h-full !w-full">
            <NextImage
              src="/logo-epayco.webp"
              alt="ePayco"
              fill
              sizes="200px"
              style={{ objectFit: "contain" }}
            />
          </div>
        )}
      </button>

      <p className="!flex !items-center !justify-center !gap-1.5 !text-[10px] !uppercase !tracking-[0.18em] !text-white/35">
        <IconLock size={11} />
        Pago seguro ePayco
      </p>

      {errorMsg && (
        <div
          className="!rounded-lg !p-2 !text-xs !leading-tight"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fca5a5",
          }}
        >
          {errorMsg}
        </div>
      )}

      <dialog ref={dialogRef} />
    </div>
  );
}
