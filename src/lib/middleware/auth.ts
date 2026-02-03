import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./../session";

export function withAuth(req: NextRequest) {
  const cookie = req.cookies.get("session")?.value;

  // Enhanced logging for debugging
  console.log('🔐 Auth Middleware Check:');
  console.log('  📍 Path:', req.nextUrl.pathname);
  console.log('  🍪 Cookie exists:', !!cookie);
  if (cookie) {
    console.log('  📏 Cookie length:', cookie.length);
  }

  const session = cookie ? decrypt(cookie) : null;

  console.log('  ✅ Session valid:', !!session);
  if (session) {
    console.log('  👤 User ID:', session.userId);
    console.log('  📧 Email:', session.email);
  }

  if (!session) {
    console.log('  ❌ NO VALID SESSION - Redirecting to /');
    console.log('  ℹ️  Reason:', cookie ? 'Cookie exists but decrypt failed' : 'No session cookie found');
    console.log('  💡 Solution: Please log in at /login');
    return NextResponse.redirect(new URL("/", req.url));
  }

  console.log('  ✅ AUTH SUCCESS - Allowing access to', req.nextUrl.pathname);
  // return session so admin middleware can reuse it
  return session;
}
