import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { loginSchema } from "@/features/auth/schemas/auth.schema";
import {
  signInWithPassword,
  signInWithGoogle,
} from "@/features/auth/api/auth.client";

import { createClient } from "@/shared/lib/supabase/client";
import { authFetch } from "@/shared/api/admin-fetch";

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
      let role = session?.user?.app_metadata?.role as string | null;

      if (!role) {
        try {
          const { role: r } = await authFetch<{ role: string | null }>(
            "/api/auth/session",
          );

          role = r;
        } catch {
          role = "client";
        }
      }

      if (role === "client") {
        router.push("/mi-cuenta");
      } else {
        router.push("/admin");
      }
    },
    [email, password],
  );

  const handleGoogleSignIn = useCallback(async () => {
    setGoogleStatus("loading");
    await signInWithGoogle();
  }, []);

  return {
    fieldErrors,
    showPassword,
    setShowPassword,
    generalError,
    googleStatus,
    setPassword,
    email,
    setEmail,
    password,
    status,
    handleSubmit,
    handleGoogleSignIn,
  };
}
