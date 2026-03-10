import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
}

type AppRole = "student" | "teacher";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  role: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch profile:", error);
        setProfile(null);
        return;
      }

      setProfile(data ?? null);
    } catch (error) {
      console.error("Unexpected profile fetch error:", error);
      setProfile(null);
    }
  };

  const fetchRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch role:", error);
        setRole("student");
        return;
      }

      setRole((data?.role as AppRole) ?? "student");
    } catch (error) {
      console.error("Unexpected role fetch error:", error);
      setRole("student");
    }
  };

  const loadUserData = useCallback(async (userId: string) => {
    await Promise.all([fetchProfile(userId), fetchRole(userId)]);
  }, []);

  const refreshProfile = async () => {
    if (userIdRef.current) {
      await Promise.all([fetchProfile(userIdRef.current), fetchRole(userIdRef.current)]);
    }
  };

  const applySession = useCallback((nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    userIdRef.current = nextSession?.user?.id ?? null;

    if (!nextSession?.user) {
      setProfile(null);
      setRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    void loadUserData(nextSession.user.id)
      .catch((error) => {
        console.error("Failed to load user data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loadUserData]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        applySession(nextSession);
      }
    );

    void supabase.auth.getSession()
      .then(({ data: { session: nextSession } }) => {
        applySession(nextSession);
      })
      .catch((error) => {
        console.error("Failed to initialize auth session:", error);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [applySession]);

  // Re-fetch role on window focus to catch Supabase dashboard changes
  useEffect(() => {
    const handleFocus = () => {
      if (userIdRef.current) {
        fetchRole(userIdRef.current);
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, role, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
