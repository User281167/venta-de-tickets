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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false as const, error: mapError(error) };
  }

  return { success: true as const, error: null };
}

export async function signUp(_email: string, _password: string) {
  void _email;
  void _password;
  return { success: false as const, error: "El registro público está deshabilitado." };
}

export async function signInWithGoogle() {
  return { success: false as const, error: "El acceso de personal requiere una cuenta autorizada." };
}

export async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false as const, error: mapError(error) };
  }

  return { success: true as const, error: null };
}

export async function resetPasswordForEmail(email: string) {
  const supabase = createClient();

  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: origin
      ? `${origin}/update-password`
      : undefined,
  });

  if (error) {
    return { success: false as const, error: mapError(error) };
  }

  return { success: true as const, error: null };
}

export async function updatePassword(password: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { success: false as const, error: mapError(error) };
  }

  return { success: true as const, error: null };
}
