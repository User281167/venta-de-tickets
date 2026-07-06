import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import {
  registerSchema,
  type RegisterInput,
} from "@/features/auth/schemas/auth.schema";
import { signUp, signInWithGoogle } from "@/features/auth/api/auth.client";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useRegister() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({});
  const [generalError, setGeneralError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "error" | "success"
  >("idle");
  const [googleStatus, setGoogleStatus] = useState<"idle" | "loading">("idle");

  if (user) {
    router.push("/mi-cuenta");
    return null;
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setGeneralError("");
      setFieldErrors({});

      const result = registerSchema.safeParse({
        email,
        password,
        confirmPassword,
        consentGiven,
      });

      if (!result.success) {
        const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};

        for (const issue of result.error.issues) {
          const path = issue.path[0] as keyof RegisterInput;
          fieldErrors[path] = issue.message;
        }

        setFieldErrors(fieldErrors);
        return;
      }

      setStatus("submitting");

      const { success, error } = await signUp(email, password);

      if (!success) {
        setGeneralError(error);
        setStatus("error");
        return;
      }

      setStatus("success");
    },
    [email, password, confirmPassword, consentGiven],
  );

  const handleGoogleSignIn = useCallback(async () => {
    setGoogleStatus("loading");
    await signInWithGoogle();
  }, []);

  return {
    status,
    email,
    setEmail,
    handleSubmit,
    fieldErrors,
    password,
    confirmPassword,
    setConfirmPassword,
    setPassword,
    showPassword,
    setShowPassword,
    consentGiven,
    setConsentGiven,
    generalError,
    googleStatus,
    handleGoogleSignIn,
  };
}
