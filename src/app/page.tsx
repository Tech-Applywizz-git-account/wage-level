"use client";

import { useAuth } from "@/contexts/AuthContext";
import Overview from "@/components/Overview";
import LoginPage from "@/components/LoginPage";

export default function RootPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Overview />;
  }

  return <LoginPage />;
}
