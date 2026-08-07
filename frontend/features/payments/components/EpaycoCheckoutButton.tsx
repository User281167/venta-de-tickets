"use client";

import { useState, useCallback, useRef } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { IconLock } from "@tabler/icons-react";
import { useCart } from "@/features/ticket-purchase/hooks/useCart";
import { useCreateEpaycoCheckout } from "../api/epayco.queries";

const EPAYCO_SDK_URL = "https://checkout.epayco.co/checkout-v2.js";
const EPAYCO_TEST_MODE = process.env.NEXT_PUBLIC_EPAYCO_TEST === "true";

interface EpaycoCheckoutButtonProps {
  backUrl: string;
  onError?: (code: string, message: string) => void;
}

export function EpaycoCheckoutButton({ backUrl, onError }: EpaycoCheckoutButtonProps) {
  const router = useRouter();
  const { items } = useCart();
  const mutation = useCreateEpaycoCheckout();
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const isMountedRef = useRef(true);

  const handleScriptLoad = useCallback(() => {
    if (typeof window === "undefined") return;

    if (window.ePayco) {
      isMountedRef.current = true;
      setScriptReady(true);
    } else {
      setScriptError(true);
    }
  }, []);

  const handleScriptError = useCallback(() => {
    setScriptError(true);
  }, []);

  const handlePagar = useCallback(async () => {
    setErrorMsg("");

    if (scriptError) {
      setErrorMsg("No se pudo cargar el medio de pago. Recarga la página.");
      return;
    }

    if (!scriptReady || typeof window === "undefined" || !window.ePayco) {
      setErrorMsg("Medio de pago no disponible. Intenta de nuevo.");
      return;
    }

    let mutationResult;
    try {
      mutationResult = await mutation.mutateAsync({
        items: items.map((i) => ({
          ticketTypeId: i.ticketTypeId,
          quantity: i.quantity,
        })),
        backUrl,
      });
    } catch (err: any) {
      onError?.(err.code ?? "INTERNAL_ERROR", err.message ?? "Error al crear sesión de pago");
      return;
    }

    const sessionId = mutationResult.sessionId;
    if (!sessionId) {
      setErrorMsg("Error al crear sesión de pago.");
      return;
    }

    const checkout = window.ePayco.checkout.configure({
      sessionId,
      type: "onpage",
      test: EPAYCO_TEST_MODE,
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
      onErrors: () => {
        setErrorMsg("Error al procesar el pago.");
      },
      onClosed: () => {
        mutation.reset();
      },
    });

    checkout.open();
  }, [scriptReady, scriptError, mutation, items, backUrl, router, onError]);

  const buttonDisabled = mutation.isPending || !scriptReady || scriptError;
  const buttonTitle = scriptError
    ? "No se pudo cargar ePayco. Recarga la página."
    : !scriptReady
      ? "Cargando medio de pago..."
      : undefined;

  return (
    <div className="!mt-4 !flex !flex-col !gap-2">
      <Script
        src={EPAYCO_SDK_URL}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />

      <button
        type="button"
        onClick={handlePagar}
        disabled={buttonDisabled}
        title={buttonTitle}
        data-testid="epayco-pay-button"
        className="!relative !flex !h-16 !w-full !items-center !justify-center !overflow-hidden !rounded-xl !bg-white !p-2 !transition !duration-300 hover:!translate-y-[-2px] disabled:!cursor-not-allowed disabled:!opacity-60 disabled:hover:!translate-y-0"
        style={{
          boxShadow: buttonDisabled
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
              src="/assets/logo-epayco.webp"
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
    </div>
  );
}
