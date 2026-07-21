import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { registerSchema } from "@/lib/auth-schemas";
import { sendAuthEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestFingerprint } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { hashPassword } from "@/lib/security/password";
import { createSecureToken } from "@/lib/security/token";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(requestFingerprint(request, "register"), 5, 60 * 60_000);
    if (!limit.allowed) return apiError("RATE_LIMITED", "Terlalu banyak percobaan. Coba kembali nanti.", 429);
    const data = registerSchema.parse(await request.json());
    if (await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } })) return apiError("EMAIL_EXISTS", "Email sudah terdaftar.", 409);
    const passwordHash = await hashPassword(data.password);
    const token = createSecureToken();
    await prisma.$transaction(async (tx) => {
      await tx.user.create({ data: { name: sanitizeText(data.name, 80), email: data.email, passwordHash, wishlist: { create: {} } } });
      await tx.verificationToken.create({ data: { identifier: `verify:${data.email}`, token: token.digest, expires: new Date(Date.now() + 24 * 60 * 60_000) } });
    });
    const actionUrl = `${env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?email=${encodeURIComponent(data.email)}&token=${encodeURIComponent(token.raw)}`;
    await sendAuthEmail({ to: data.email, subject: "Verifikasi email IVORY", heading: "Konfirmasi email Anda", body: "Selesaikan pendaftaran agar akun dapat digunakan untuk berbelanja.", actionLabel: "Verifikasi email", actionUrl });
    return apiSuccess({ message: "Registrasi berhasil. Periksa email untuk melakukan verifikasi." }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
