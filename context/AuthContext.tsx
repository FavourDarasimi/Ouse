"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  role: Profile["role"] | null;
  onboarded: boolean;
  isAuthInitialized: boolean;
  isLoggingOut: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  kyc_status: Profile["kyc_status"];
  kyc_method: Profile["kyc_method"];
  kyc_verified_at: Profile["kyc_verified_at"];
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  role: null,
  onboarded: false,
  isAuthInitialized: false,
  isLoggingOut: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  kyc_status: "unverified",
  kyc_method: null,
  kyc_verified_at: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const loggingOutRef = useRef(false);
  const initialHydrationComplete = useRef(false);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      setProfile(data ?? null);
    },
    [supabase]
  );

  useEffect(() => {
    let ignore = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (ignore) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          if (ignore) return;
          initialHydrationComplete.current = true;
          setIsAuthInitialized(true);
        });
      } else {
        setProfile(null);
        initialHydrationComplete.current = true;
        setIsAuthInitialized(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (ignore) return;
      if (loggingOutRef.current) return;
      if (!initialHydrationComplete.current) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, [fetchProfile, supabase.auth]);

  const refreshProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      setProfile(profile);
    }
  }, [supabase]);

  const signOut = async () => {
    loggingOutRef.current = true;
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      onboarded: profile?.onboarded ?? false,
      isAuthInitialized,
      isLoggingOut,
      signOut,
      refreshProfile,
      kyc_status: profile?.kyc_status ?? "unverified",
      kyc_method: profile?.kyc_method ?? null,
      kyc_verified_at: profile?.kyc_verified_at ?? null,
    }),
    [
      user,
      profile,
      isAuthInitialized,
      isLoggingOut,
      signOut,
      refreshProfile,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
