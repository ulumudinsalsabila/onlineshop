import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestFingerprint } from "@/lib/rate-limit";
import { logSellerActivity } from "@/lib/seller/activity";
import { authenticateSellerApi } from "@/lib/seller/auth";
import { inspectImage, MAX_CONSIGNMENT_IMAGE_BYTES } from "@/lib/seller/image-validation";
import { getConsignmentImageStorage } from "@/lib/seller/storage";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const limit = rateLimit(requestFingerprint(request, "consignment-image"), 20, 60_000);
    if (!limit.allowed) return apiError("RATE_LIMITED", "Terlalu banyak percobaan upload. Tunggu sebentar.", 429);
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_CONSIGNMENT_IMAGE_BYTES + 1_000_000) return apiError("PAYLOAD_TOO_LARGE", "Ukuran upload terlalu besar.", 413);
    const auth = await authenticateSellerApi();
    if (!auth.user || !auth.seller) return auth.response;
    const id = (await params).id;
    const submission = await prisma.consignmentSubmission.findFirst({ where: { id, sellerId: auth.seller.id }, include: { _count: { select: { images: true } } } });
    if (!submission) return apiError("NOT_FOUND", "Pengajuan tidak ditemukan.", 404);
    if (!(submission.status === "DRAFT" || submission.status === "NEEDS_REVISION")) return apiError("SUBMISSION_LOCKED", "Foto tidak dapat diubah.", 409);
    if (submission._count.images >= 10) return apiError("IMAGE_LIMIT", "Maksimal 10 foto.", 422);
    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof File)) return apiError("IMAGE_REQUIRED", "Pilih file gambar.", 422);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const info = inspectImage(bytes, file.type);
    const stored = await getConsignmentImageStorage().save({ bytes, extension: info.extension });
    const image = await prisma.$transaction(async (tx) => {
      const created = await tx.consignmentImage.create({ data: { submissionId: id, ...stored, mimeType: info.mimeType, sizeBytes: info.sizeBytes, width: info.width, height: info.height, alt: `${submission.title} consignment photo`, sortOrder: submission._count.images, isPrimary: submission._count.images === 0 } });
      await logSellerActivity(tx, { sellerId: auth.seller.id, actorUserId: auth.user.id, action: "SUBMISSION_IMAGE_ADDED", entityType: "ConsignmentSubmission", entityId: id, metadata: { imageId: created.id, mimeType: info.mimeType, sizeBytes: info.sizeBytes } });
      return created;
    });
    return apiSuccess(image, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("IMAGE_")) return apiError(error.message, "File gambar tidak memenuhi persyaratan.", 422);
    return handleApiError(error);
  }
}
