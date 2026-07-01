"use client";

import { createClient } from "@/shared/lib/supabase/client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useMe } from "@/features/users/hooks/useProfile";
import { OnboardingSurvey } from "@/features/surveys/components/OnboardingSurvey";
import { adminFetch } from "@/shared/api/admin-fetch";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  role: string | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  role: null,
  isLoading: true,
});

const ADMIN_ROLES = new Set(["super_admin", "organizer", "staff", "checker"]);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSurvey, setShowSurvey] = useState(false);

  // Obtén el perfil del usuario para verificar el estado de incorporación.
  const meQuery = useMe();

  const fetchRoleFallback = useCallback(async () => {
    try {
      const { role: r } = await adminFetch<{ role: string | null }>(
        "/api/auth/session",
      );
      setRole(r);
    } catch {
      setRole(null);
    }
  }, []);

  const syncRole = useCallback(
    (s: Session | null) => {
      const fromJwt = (s?.user?.app_metadata?.role as string | null) ?? null;
      if (fromJwt && ADMIN_ROLES.has(fromJwt)) {
        setRole(fromJwt);
      } else if (s?.user) {
        fetchRoleFallback();
      } else {
        setRole(null);
      }
    },
    [fetchRoleFallback],
  );

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      syncRole(session);
      setIsLoading(false);

      if (session?.user) {
        // La consulta useMe se activará con el cambio de sesión.
      } else {
        setShowSurvey(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncRole]);

  useEffect(() => {
    if (user && !meQuery.isLoading && !meQuery.isError) {
      const onboardingDone = meQuery.data?.onboarding_survey_done ?? true;
      setShowSurvey(!onboardingDone);
    } else {
      setShowSurvey(false);
    }
  }, [user, meQuery.data, meQuery.isLoading, meQuery.isError]);

  return (
    <AuthContext.Provider value={{ user, session, role, isLoading }}>
      {children}
      {showSurvey && <OnboardingSurvey />}
    </AuthContext.Provider>
  );
}

export function isAdminRole(r: string | null): boolean {
  return r !== null && ADMIN_ROLES.has(r);
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
