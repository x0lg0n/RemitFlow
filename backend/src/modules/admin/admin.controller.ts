import { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth.middleware";
import { logAuditEvent } from "../../shared/services/audit.service";
import {
  approveAnchorSubmission,
  listAnchorSubmissions,
  rejectAnchorSubmission,
  updateCatalogEntry,
} from "../anchors/marketplace.service";

function getAdminActor(req: AuthRequest): { userId: string; role: "admin" } {
  return {
    userId: req.walletAddress ?? "unknown",
    role: "admin",
  };
}

function getRouteParam(value: string | string[] | undefined): string {
  if (!value || Array.isArray(value)) {
    throw new Error("Invalid route parameter");
  }

  return value;
}

export async function getAnchorSubmissionsAdmin(req: AuthRequest, res: Response): Promise<void> {
  const status =
    typeof req.query.status === "string" &&
    ["pending", "approved", "rejected"].includes(req.query.status)
      ? (req.query.status as "pending" | "approved" | "rejected")
      : undefined;

  const submissions = await listAnchorSubmissions(status);
  res.status(200).json({ success: true, data: { submissions } });
}

export async function approveAnchorSubmissionAdmin(req: AuthRequest, res: Response): Promise<void> {
  const actor = getAdminActor(req);
  const submission = await approveAnchorSubmission({
    submissionId: getRouteParam(req.params.id),
    reviewerUserId: actor.userId,
    reviewNotes: req.body.reviewNotes,
  });

  await logAuditEvent({
    actorUserId: actor.userId,
    actorRole: actor.role,
    action: "anchor_submission_approved",
    targetType: "anchor_submission",
    targetId: submission.id,
    metadata: { catalogId: submission.catalogId },
  });

  res.status(200).json({ success: true, data: { submission } });
}

export async function rejectAnchorSubmissionAdmin(req: AuthRequest, res: Response): Promise<void> {
  const actor = getAdminActor(req);
  const submission = await rejectAnchorSubmission({
    submissionId: getRouteParam(req.params.id),
    reviewerUserId: actor.userId,
    reviewNotes: req.body.reviewNotes,
  });

  await logAuditEvent({
    actorUserId: actor.userId,
    actorRole: actor.role,
    action: "anchor_submission_rejected",
    targetType: "anchor_submission",
    targetId: submission.id,
  });

  res.status(200).json({ success: true, data: { submission } });
}

export async function patchCatalogEntryAdmin(req: AuthRequest, res: Response): Promise<void> {
  const actor = getAdminActor(req);

  const catalogEntry = await updateCatalogEntry({
    catalogId: getRouteParam(req.params.id),
    isPublished: req.body.isPublished,
    availabilityStatus: req.body.availabilityStatus,
    rating: req.body.rating,
    notes: req.body.notes,
    feeEstimate: req.body.feeEstimate,
    displayName: req.body.displayName,
  });

  await logAuditEvent({
    actorUserId: actor.userId,
    actorRole: actor.role,
    action: "anchor_catalog_updated",
    targetType: "anchor_catalog",
    targetId: catalogEntry.id,
    metadata: {
      isPublished: catalogEntry.isPublished,
      availabilityStatus: catalogEntry.availabilityStatus,
      rating: catalogEntry.rating,
    },
  });

  res.status(200).json({ success: true, data: { catalogEntry } });
}
