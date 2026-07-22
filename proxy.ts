import { NextResponse } from "next/server";

export function proxy(request: import("next/server").NextRequest) {
  const protectedPath = request.nextUrl.pathname.startsWith("/account") || request.nextUrl.pathname.startsWith("/checkout") || request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/seller") || request.nextUrl.pathname === "/sell";
  const authenticated = request.cookies.has("ivory_session");
  if (protectedPath && !authenticated) {
    const login = new URL("/login", request.nextUrl.origin);
    login.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }
  if (authenticated && ["/login", "/register"].includes(request.nextUrl.pathname)) return NextResponse.redirect(new URL("/account", request.nextUrl.origin));
  return NextResponse.next();
}

export const config = { matcher: ["/account/:path*", "/checkout/:path*", "/admin/:path*", "/seller/:path*", "/sell", "/login", "/register"] };
