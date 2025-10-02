import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "./lib/middleware/auth";
import { withAdmin } from "./lib/middleware/admin";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🔒 Protect normal user routes
  if (
    pathname.startsWith("/overview") ||
    pathname.startsWith("/role-analysis") ||
    pathname.startsWith("/company-analysis") ||
    pathname.startsWith("/top-performers") ||
    pathname.startsWith("/data-explorer") ||
    pathname.startsWith("/api/jobs")
  ) {
    const result = withAuth(req);
    if (result instanceof NextResponse) return result;
  }

  // 🔒 Protect admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const result = await withAdmin(req);
    if (result instanceof NextResponse) return result;
  }

  // ✅ No need to handle "/" anymore (handled in page.tsx)

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/overview/:path*",
    "/role-analysis/:path*",
    "/company-analysis/:path*",
    "/top-performers/:path*",
    "/data-explorer/:path*",
    "/api/jobs/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    // ❌ remove "/" here since we handle login/overview in page.tsx
  ],
  runtime: "nodejs", // important since you’re using crypto
};
