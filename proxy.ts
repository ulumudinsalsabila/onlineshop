import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isTrustedMutationRequest } from "@/lib/security/request-origin";

export const proxy = auth((request) => {
  const isWebhook = request.nextUrl.pathname === "/api/payments/webhook/midtrans";
  if (request.nextUrl.pathname.startsWith("/api/") && !isWebhook && !isTrustedMutationRequest(request, process.env.NEXT_PUBLIC_APP_URL)) return NextResponse.json({ success: false, error: { code: "INVALID_ORIGIN", message: "Origin request tidak diizinkan." } }, { status: 403 });
  const protectedPath = request.nextUrl.pathname.startsWith("/account") || request.nextUrl.pathname.startsWith("/checkout") || request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/seller") || request.nextUrl.pathname === "/sell";
  if (protectedPath && !request.auth) {
    const login = new URL("/login", request.nextUrl.origin);
    login.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }
  if (request.auth && ["/login", "/register"].includes(request.nextUrl.pathname)) return NextResponse.redirect(new URL("/account", request.nextUrl.origin));
  return NextResponse.next();
});

export const config = { matcher: ["/api/:path*", "/account/:path*", "/checkout/:path*", "/admin/:path*", "/seller/:path*", "/sell", "/login", "/register"] };
