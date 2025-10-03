"use client";

import {
  Building2,
  Briefcase,
  TrendingUp,
  Search,
  Database,
  Home,
  Settings,
  LogOut,
  User,
} from "lucide-react";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut, isAdmin, loading } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth/set-password" || pathname === "/";

  // 1. Show spinner while loading session
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

  // 2. Root route → login page (just render children, no nav/header)
  if (isAuthPage && !user) {
    return <main>{children}</main>;
  }

  // 3. All other routes → full layout
  const navItems = [
    { href: "/", label: "Overview", icon: Home },
    { href: "/role-analysis", label: "Role Analysis", icon: Briefcase },
    { href: "/company-analysis", label: "Company Analysis", icon: Building2 },
    { href: "/top-performers", label: "Top Performers", icon: TrendingUp },
    { href: "/data-explorer", label: "Data Explorer", icon: Search },
    ...(isAdmin
      ? [{ href: "/admin-controls", label: "Admin Controls", icon: Settings }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sponsored Jobs Analysis Engine
                </h1>
                <p className="text-sm text-gray-500">Powered by Supabase</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                    {user.role && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "lead"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={signOut}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Live Database
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <nav className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Navigation
              </h2>
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? "bg-blue-100 text-blue-700 border-r-2 border-blue-600"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50">
        <AuthProvider>
          <DataProvider>
            <AppLayout>{children}</AppLayout>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
