import { randomUUID } from "node:crypto";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { authenticateSellerApi } from "@/lib/seller/auth";
import { logSellerActivity } from "@/lib/seller/activity";
import { submissionSchema } from "@/lib/seller/schemas";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) { try { const auth = await authenticateSellerApi(); if (!auth.user || !auth.seller) return auth.response; const data = submissionSchema.parse(await request.json()); const submission = await prisma.$transaction(async (tx) => { const created = await tx.consignmentSubmission.create({ data: { submissionNumber: `CS-${Date.now()}-${randomUUID().slice(0, 5).toUpperCase()}`, sellerId: auth.seller.id, title: data.title, brandId: data.brandId || null, proposedBrand: data.proposedBrand || null, categoryId: data.categoryId, conditionLabel: data.conditionLabel, completeness: data.completeness, flawNotes: data.flawNotes || null, description: data.description, expectedPrice: data.expectedPrice } }); await logSellerActivity(tx, { sellerId: auth.seller.id, actorUserId: auth.user.id, action: "SUBMISSION_DRAFT_CREATED", entityType: "ConsignmentSubmission", entityId: created.id, metadata: { submissionNumber: created.submissionNumber } }); return created; }); return apiSuccess({ id: submission.id, submissionNumber: submission.submissionNumber }, { status: 201 }); } catch (error) { return handleApiError(error); } }
