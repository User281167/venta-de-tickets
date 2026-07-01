"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Acceso denegado",
  otp_expired:
    "El enlace ha expirado. Solicita un nuevo enlace de inicio de sesión.",
};

function AuthErrorToastInner() {
  const searchParams = useSearchParams();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;

    const error = searchParams.get("error");
    const description = searchParams.get("error_description");
    const errorCode = searchParams.get("error_code");

    if (!error && !errorCode) return;

    shown.current = true;

    const title =
      ERROR_MESSAGES[error ?? errorCode ?? ""] ?? "Error de autenticación";
    const message = description
      ? decodeURIComponent(description.replace(/\+/g, " "))
      : title;

    toast.error(title, {
      description: message,
      duration: 8000,
    });

    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState({}, "", url.toString());
  }, [searchParams]);

  return null;
}

export function AuthErrorToast() {
  return (
    <Suspense fallback={null}>
      <AuthErrorToastInner />
    </Suspense>
  );
}
