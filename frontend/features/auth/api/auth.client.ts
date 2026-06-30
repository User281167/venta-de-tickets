import { createClient } from "@/shared/lib/supabase/client";

const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Correo o contraseña incorrectos",
  "Email already registered": "Este correo ya está registrado",
  "User already registered": "Este correo ya está registrado",
  "Email not confirmed": "Debes confirmar tu correo electrónico",
};

function mapError(error: unknown): string {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: string }).message)
      : "desconocido";

  return ERROR_MESSAGES[message] ?? "Ocurrió un error. Intente de nuevo.";
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false as const, error: mapError(error) };
  }

  return { success: true as const, error: null };
}

export async function signUp(email: string, password: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { success: false as const, error: mapError(error) };
  }

  return { success: true as const, error: null };
}

export async function signInWithGoogle() {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return { success: false as const, error: mapError(error) };
  }

  return { success: true as const, error: null };
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false as const, error: mapError(error) };
  }

  return { success: true as const, error: null };
}
