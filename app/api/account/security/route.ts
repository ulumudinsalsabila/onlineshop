import { z } from "zod";

import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { authenticateApi } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestFingerprint } from "@/lib/rate-limit";
import { hashPassword, verifyPassword } from "@/lib/security/password";

const schema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(10).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/), confirmPassword: z.string() }).refine((data) => data.newPassword === data.confirmPassword, { path: ["confirmPassword"], message: "Konfirmasi password tidak sama." });

export async function PATCH(request: Request) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    if (!rateLimit(requestFingerprint(request, `security:${authResult.user.id}`), 5, 60 * 60_000).allowed) return apiError("RATE_LIMITED", "Terlalu banyak percobaan.", 429);
    const data = schema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { id: authResult.user.id }, select: { passwordHash: true } });
    if (!user?.passwordHash || !(await verifyPassword(user.passwordHash, data.currentPassword))) return apiError("INVALID_PASSWORD", "Password saat ini tidak sesuai.", 400);
    await prisma.user.update({ where: { id: authResult.user.id }, data: { passwordHash: await hashPassword(data.newPassword) } });
    await prisma.session.deleteMany({ where: { userId: authResult.user.id } });
    return apiSuccess({ message: "Password berhasil diperbarui." });
  } catch (error) { return handleApiError(error); }
}
