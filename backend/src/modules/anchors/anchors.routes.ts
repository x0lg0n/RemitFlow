import { Router } from "express";
import {
  listAllAnchors,
  createAnchor,
  updateAnchor,
  getMyDashboard,
} from "./anchors.controller";
import {
  authMiddleware,
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

/** GET /anchors — list active anchors (public). */
router.get("/", listAllAnchors);

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
