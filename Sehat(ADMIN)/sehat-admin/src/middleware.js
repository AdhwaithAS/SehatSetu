// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("sb-access-token")?.value;
  const { pathname } = req.nextUrl;

  // Allow public paths
  const publicPaths = ["/login", "/_next", "/favicon.ico"];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  // If no token and route is not public → redirect to login
  if (isPublic && token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If token exists and user tries to access /login → redirect to dashboard
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Run middleware on all routes
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
