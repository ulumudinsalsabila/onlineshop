import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { resetPasswordSchema } from "@/lib/auth-schemas";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestFingerprint } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/security/password";
import { digestToken } from "@/lib/security/token";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(requestFingerprint(request, "reset-password"), 8, 60 * 60_000);
    if (!limit.allowed) return apiError("RATE_LIMITED", "Terlalu banyak percobaan. Coba kembali nanti.", 429);
    const data = resetPasswordSchema.parse(await request.json());
    const digest = digestToken(data.token);
    const token = await prisma.verificationToken.findUnique({ where: { token: digest } });
    if (!token || token.identifier !== `password-reset:${data.email}` || token.expires <= new Date()) return apiError("INVALID_TOKEN", "Link reset tidak valid atau sudah kedaluwarsa.", 400);
    const passwordHash = await hashPassword(data.password);
    await prisma.$transaction([prisma.user.update({ where: { email: data.email }, data: { passwordHash } }), prisma.verificationToken.delete({ where: { token: digest } })]);
    return apiSuccess({ message: "Password berhasil diperbarui. Silakan login." });
  } catch (error) { return handleApiError(error); }
}
