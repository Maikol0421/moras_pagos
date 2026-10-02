import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verificarSessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const sesion = token ? await verificarSessionToken(token) : null;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !sesion) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname === "/login" && sesion) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (pathname === "/") {
    return NextResponse.redirect(new URL(sesion ? "/dashboard" : "/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
