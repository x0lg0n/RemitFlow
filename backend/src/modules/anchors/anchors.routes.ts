import { Router } from "express";
import {
  listAllAnchors,
  createAnchor,
  updateAnchor,
  getMyDashboard,
  getAnchorCatalog,
  getMyAnchorPreferences,
  activateMyAnchorPreference,
  deactivateMyAnchorPreference,
  createAnchorSubmissionRequest,
} from "./anchors.controller";
import {
  authMiddleware,
  optionalAuthMiddleware,
  requireAdmin,
  requireAnchor,
} from "../../shared/middleware/auth.middleware";
import { z } from "zod";
import { validate } from "../../shared/middleware/validation.middleware";

const router: Router = Router();

const registerAnchorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  stellarAddress: z.string().regex(/^G[A-Z0-9]{55}$/),
  baseUrl: z.string().url(),
  authToken: z.string().min(1),
  supportedCurrencies: z.array(z.string()).min(1),
  supportedCountries: z.array(z.string().regex(/^[A-Z]{2}$/)).min(1),
});

const submissionSchema = z.object({
  anchorName: z.string().min(2).max(255),
  baseUrl: z.string().url().optional(),
  countryCode: z
    .string()
    .regex(/^[A-Za-z]{2}$/)
    .transform((value) => value.toUpperCase())
    .optional(),
  supportedCurrencies: z
    .array(z.string().min(1).max(12).transform((value) => value.toUpperCase()))
    .max(12)
    .optional(),
  notes: z.string().max(1000).optional(),
});

/** GET /anchors — list active anchors (public). */
router.get("/", listAllAnchors);

/** GET /anchors/catalog — marketplace catalog (public, personalized when authenticated). */
router.get("/catalog", optionalAuthMiddleware, getAnchorCatalog);

/** GET /anchors/preferences/me — caller marketplace preferences. */
router.get("/preferences/me", authMiddleware, getMyAnchorPreferences);

/** POST /anchors/preferences/:anchorId/activate — activate caller preference. */
router.post("/preferences/:anchorId/activate", authMiddleware, activateMyAnchorPreference);

/** DELETE /anchors/preferences/:anchorId — deactivate caller preference. */
router.delete("/preferences/:anchorId", authMiddleware, deactivateMyAnchorPreference);

/** POST /anchors/submissions — submit a new anchor request. */
router.post("/submissions", authMiddleware, validate(submissionSchema), createAnchorSubmissionRequest);

/** GET /anchors/me/dashboard — anchor dashboard (anchor/admin). */
router.get("/me/dashboard", authMiddleware, requireAnchor, getMyDashboard);

/** POST /anchors — register anchor (admin only). */
router.post(
  "/",
  authMiddleware,
  requireAdmin,
  validate(registerAnchorSchema),
  createAnchor
);

/** PUT /anchors/:id — update anchor status (admin only). */
router.put(
  "/:id",
  authMiddleware,
  requireAdmin,
  validate(z.object({ isActive: z.boolean() })),
  updateAnchor
);

export default router;
