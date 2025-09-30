"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase, AuthUser } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: AuthUser | null;
  session: any;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isLead: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    checkAuthState();

    // Listen for auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);
      setSession(session);
      if (session?.user) {
        await setUserWithPermissions(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      if (session?.user) {
        await setUserWithPermissions(session.user);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setLoading(false);
    }
  };

  const setUserWithPermissions = async (user: User) => {
    try {
      // Get user role from database using ID (more reliable)
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", user.id)
        .single();

      setUser({
        ...user,
        role: userData?.role || "user",
      });
    } catch (error) {
      console.error("Failed to get user permissions:", error);
      setUser({
        ...user,
        role: "user", // Fallback
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    error: null, // Handle errors differently
    signIn,
    signOut,
    isAdmin: user?.role === "admin",
    isLead: user?.role === "lead" || user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

