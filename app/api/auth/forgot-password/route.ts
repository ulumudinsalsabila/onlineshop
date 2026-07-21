import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { forgotPasswordSchema } from "@/lib/auth-schemas";
import { sendAuthEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestFingerprint } from "@/lib/rate-limit";
import { createSecureToken } from "@/lib/security/token";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(requestFingerprint(request, "forgot-password"), 5, 60 * 60_000);
    if (!limit.allowed) return apiError("RATE_LIMITED", "Terlalu banyak permintaan. Coba kembali nanti.", 429);
    const { email } = forgotPasswordSchema.parse(await request.json());
    const user = await prisma.user.findFirst({ where: { email, isActive: true, deletedAt: null }, select: { id: true } });
    if (user) {
      const token = createSecureToken();
      await prisma.$transaction(async (tx) => {
        await tx.verificationToken.deleteMany({ where: { identifier: `password-reset:${email}` } });
        await tx.verificationToken.create({ data: { identifier: `password-reset:${email}`, token: token.digest, expires: new Date(Date.now() + 60 * 60_000) } });
      });
      const actionUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token.raw)}`;
      await sendAuthEmail({ to: email, subject: "Reset password IVORY", heading: "Atur password baru", body: "Kami menerima permintaan untuk mengatur ulang password akun Anda.", actionLabel: "Reset password", actionUrl });
    }
    return apiSuccess({ message: "Jika email terdaftar, instruksi reset password akan dikirim." });
  } catch (error) { return handleApiError(error); }
}
