import { Router } from "express";
import { z } from "zod";
import { authMiddleware, requireAdmin } from "../../shared/middleware/auth.middleware";
import { validate } from "../../shared/middleware/validation.middleware";
import {
  approveAnchorSubmissionAdmin,
  getAnchorSubmissionsAdmin,
  patchCatalogEntryAdmin,
  rejectAnchorSubmissionAdmin,
} from "./admin.controller";

const router: Router = Router();

router.use(authMiddleware, requireAdmin);

const reviewSchema = z.object({
  reviewNotes: z.string().max(1000).optional(),
});

const catalogPatchSchema = z
  .object({
    isPublished: z.boolean().optional(),
    availabilityStatus: z.enum(["available", "pending", "disabled"]).optional(),
    rating: z.number().min(0).max(5).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
    feeEstimate: z.string().max(20).nullable().optional(),
    displayName: z.string().min(1).max(255).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required",
  });

router.get("/anchors/submissions", getAnchorSubmissionsAdmin);
router.post(
  "/anchors/submissions/:id/approve",
  validate(reviewSchema),
  approveAnchorSubmissionAdmin
);
router.post(
  "/anchors/submissions/:id/reject",
  validate(reviewSchema),
  rejectAnchorSubmissionAdmin
);
router.patch(
  "/anchors/catalog/:id",
  validate(catalogPatchSchema),
  patchCatalogEntryAdmin
);

export default router;
