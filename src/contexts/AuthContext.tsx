"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { decrypt } from "@/lib/session";

interface User {
  userId: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const cookies = document.cookie.split(";").map((c) => c.trim());
      const sessionCookie = cookies.find((c) => c.startsWith("session="));

      if (sessionCookie) {
        const encrypted = sessionCookie.split("=")[1];
        const session = decrypt(encrypted) as User;
        setUser(session);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error reading session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = () => {
    document.cookie = "session=; Max-Age=0; path=/";
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === "admin",
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
