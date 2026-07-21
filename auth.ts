import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import type { UserRole } from "@/generated/prisma/client";
import { loginSchema } from "@/lib/auth-schemas";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestFingerprint } from "@/lib/rate-limit";
import { verifyPassword } from "@/lib/security/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const attempt = rateLimit(`${requestFingerprint(request, "login")}:${parsed.data.email}`, 8, 15 * 60_000);
        if (!attempt.allowed) return null;
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user?.passwordHash || !user.isActive || user.deletedAt || !user.emailVerified) return null;
        if (!(await verifyPassword(user.passwordHash, parsed.data.password))) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = user.role; }
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.id === "string" && typeof token.role === "string") { session.user.id = token.id; session.user.role = token.role as UserRole; }
      return session;
    },
  },
});
