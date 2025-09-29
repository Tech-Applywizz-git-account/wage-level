"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase, AuthUser, checkUserPermissions } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
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
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const isAdmin = user?.role === "admin";
  const isLead = user?.role === "lead" || user?.role === "admin";

  useEffect(() => {
    let isMounted = true;
    console.log("AuthProvider mounting...");

    const getSession = async () => {
      console.log("getSession started");
      try {
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();
        console.log("getSession completed:", {
          session: !!initialSession,
          error,
        });

        if (!isMounted) {
          console.log("Component unmounted, skipping state update");
          return;
        }

        if (error) {
          console.error("Error getting session:", error);
          setError(error.message);
          setLoading(false);
        } else {
          setSession(initialSession);
          if (initialSession?.user) {
            console.log("User found, checking permissions...");
            try {
              const authUser = await checkUserPermissions(initialSession.user);
              console.log("Permission check completed:", authUser);
              if (isMounted) setUser(authUser);
            } catch (err) {
              console.error("Permission check failed (initial):", err);
              if (isMounted) setError("Permission check failed");
            }
          } else {
            console.log("No user in session");
          }
          if (isMounted) setLoading(false);
        }
      } catch (err) {
        console.error("Error in getSession:", err);
        if (isMounted) {
          setError("Failed to initialize authentication");
          setLoading(false);
        }
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      if (!isMounted) return;

      setSession(session);
      setError(null);

      if (session?.user) {
        setLoading(true);
        try {
          console.log("Auth state change - checking permissions...");
          const authUser = await checkUserPermissions(session.user);
          console.log("Auth state change - permission check completed");
          if (isMounted) setUser(authUser);
        } catch (err) {
          console.error("Permission check failed (onAuthStateChange):", err);
          if (isMounted) setError("Permission check failed");
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        console.log("Auth state change - no user");
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      console.log("AuthProvider unmounting...");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return { error: error.message };
      }

      return {};
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setLoading(false);
      return { error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
        console.error("Error signing out:", error);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error in signOut:", err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signOut,
    isAdmin,
    isLead,
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

