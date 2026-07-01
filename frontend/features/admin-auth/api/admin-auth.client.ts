import { createClient } from "@/shared/lib/supabase/client";

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false as const, error: "Correo o contraseña incorrectos" };
  }

  return { success: true as const, error: null };
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false as const, error: "Error al cerrar sesión" };
  }

  return { success: true as const, error: null };
}
