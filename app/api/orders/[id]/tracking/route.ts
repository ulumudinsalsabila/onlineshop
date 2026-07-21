import { authenticateApi } from "@/lib/api-auth";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getShippingProvider } from "@/lib/shipping";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const shipment = await prisma.shipment.findFirst({ where: { order: { id: (await params).id, userId: authResult.user.id } }, orderBy: { createdAt: "desc" } });
    if (!shipment) return apiError("NOT_FOUND", "Data pengiriman belum tersedia.", 404);
    if (!shipment.trackingNumber) return apiSuccess({ status: shipment.status, trackingNumber: null, events: [] });
    const tracking = await getShippingProvider().track({ trackingNumber: shipment.trackingNumber, courierCode: shipment.courier });
    const normalized = normalizeShipmentStatus(tracking.status);
    await prisma.shipment.update({ where: { id: shipment.id }, data: { status: normalized, lastTrackedAt: new Date(), metadata: { tracking } } });
    return apiSuccess(tracking);
  } catch (error) { return handleApiError(error); }
}

function normalizeShipmentStatus(status: string): "PENDING" | "READY" | "IN_TRANSIT" | "DELIVERED" | "RETURNED" | "FAILED" {
  const value = status.toUpperCase();
  if (value.includes("DELIVER")) return "DELIVERED";
  if (value.includes("RETURN")) return "RETURNED";
  if (value.includes("FAIL")) return "FAILED";
  if (value.includes("TRANSIT") || value.includes("COURIER")) return "IN_TRANSIT";
  if (value.includes("READY") || value.includes("PICK")) return "READY";
  return "PENDING";
}
