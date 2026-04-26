import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // Public routes
  const publicPaths = ["/login", "/register", "/chat", "/rate"];
  const isPublic = pathname === "/" || publicPaths.some((p) => pathname.startsWith(p));
  const isAuthApi = pathname.startsWith("/api/auth");
  const isPublicApi =
    pathname.startsWith("/api/chat-token") ||
    pathname.startsWith("/api/ratings");

  if (isPublic || isAuthApi || isPublicApi) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based access
  if (pathname.startsWith("/manager") && role !== "MANAGER") {
    return NextResponse.redirect(new URL("/tutor", req.url));
  }
  if (pathname.startsWith("/tutor") && role !== "TUTOR") {
    return NextResponse.redirect(new URL("/manager", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
