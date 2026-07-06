import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { loginSchema } from "@/features/auth/schemas/auth.schema";
import {
  signInWithPassword,
  signInWithGoogle,
} from "@/features/auth/api/auth.client";
import { submitOnboardingSurvey } from "@/features/surveys/api/endpoints/surveys.endpoints";

import { createClient } from "@/shared/lib/supabase/client";
import { adminFetch } from "@/shared/api/admin-fetch";

export function useLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [generalError, setGeneralError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "error" | "success"
  >("idle");
  const [googleStatus, setGoogleStatus] = useState<"idle" | "loading">("idle");
  const [skipLoading, setSkipLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setGeneralError("");
      setFieldErrors({});

      const result = loginSchema.safeParse({ email, password });

      if (!result.success) {
        const fieldErrors: { email?: string; password?: string } = {};

        for (const issue of result.error.issues) {
          const path = issue.path[0] as "email" | "password";
          fieldErrors[path] = issue.message;
        }

        setFieldErrors(fieldErrors);
        return;
      }

      setStatus("submitting");

      const { success, error } = await signInWithPassword(email, password);

      if (!success) {
        setGeneralError(error);
        setStatus("error");
        return;
      }

      setStatus("success");

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const role = session?.user?.app_metadata?.role as string | null;

      if (role) {
        router.push("/admin");
      } else {
        try {
          const { role: r } = await adminFetch<{ role: string | null }>(
            "/api/auth/session",
          );

          router.push(r ? "/admin" : "/mi-cuenta");
        } catch {
          router.push("/mi-cuenta");
        }
      }
    },
    [email, password],
  );

  const handleGoogleSignIn = useCallback(async () => {
    setGoogleStatus("loading");
    await signInWithGoogle();
  }, []);

  const handleSkipSurvey = useCallback(async () => {
    setSkipLoading(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      toast("Inicia sesión primero", {
        description: "Debes iniciar sesión para omitir la encuesta.",
      });

      setSkipLoading(false);
      return;
    }

    try {
      await submitOnboardingSurvey({ responses: [] });
      toast.success("Encuesta omitida", {
        description: "Puedes completarla después desde tu perfil.",
      });

      router.push("/");
    } catch {
      toast.error("Error", {
        description: "No se pudo omitir la encuesta. Intenta de nuevo.",
      });
    } finally {
      setSkipLoading(false);
    }
  }, []);

  return {
    fieldErrors,
    showPassword,
    setShowPassword,
    generalError,
    googleStatus,
    skipLoading,
    setPassword,
    email,
    setEmail,
    password,
    status,
    handleSubmit,
    handleGoogleSignIn,
    handleSkipSurvey,
  };
}
