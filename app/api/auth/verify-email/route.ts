import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/sanitize";
import { digestToken } from "@/lib/security/token";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = normalizeEmail(url.searchParams.get("email") ?? "");
  const raw = url.searchParams.get("token") ?? "";
  const login = new URL("/login", url.origin);
  if (!email || raw.length < 20) { login.searchParams.set("error", "invalid-token"); return NextResponse.redirect(login); }
  const token = await prisma.verificationToken.findUnique({ where: { token: digestToken(raw) } });
  if (!token || token.identifier !== `verify:${email}` || token.expires <= new Date()) { login.searchParams.set("error", "invalid-token"); return NextResponse.redirect(login); }
  await prisma.$transaction([prisma.user.update({ where: { email }, data: { emailVerified: new Date() } }), prisma.verificationToken.delete({ where: { token: token.token } })]);
  login.searchParams.set("verified", "true");
  return NextResponse.redirect(login);
}
