"use client";

import { createClient } from "@/shared/lib/supabase/client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useMe } from "@/features/users/hooks/useProfile";
import { OnboardingSurvey } from "@/features/surveys/components/OnboardingSurvey";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSurvey, setShowSurvey] = useState(false);

  // Obtén el perfil del usuario para verificar el estado de incorporación.
  const meQuery = useMe();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      // If user is authenticated, check onboarding status
      if (session?.user) {
        // The useMe query will be triggered by the session change
        // We'll check the onboarding status in the next effect
      } else {
        setShowSurvey(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user && !meQuery.isLoading && !meQuery.isError) {
      // Mostrar encuesta si onboarding_survey_done es falso
      const onboardingDone = meQuery.data?.onboarding_survey_done ?? true;
      setShowSurvey(!onboardingDone);
    } else {
      setShowSurvey(false);
    }
  }, [user, meQuery.data, meQuery.isLoading, meQuery.isError]);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
      {showSurvey && <OnboardingSurvey />}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
