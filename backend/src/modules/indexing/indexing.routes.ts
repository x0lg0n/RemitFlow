import { Router } from "express";
import { authMiddleware, requireAdmin } from "../../shared/middleware/auth.middleware";
import {
  getIndexingSummaryController,
  getRecentReconciliationsController,
  runIndexingNowController,
} from "./indexing.controller";

const router: Router = Router();

router.use(authMiddleware, requireAdmin);

router.get("/summary", getIndexingSummaryController);
router.get("/recent", getRecentReconciliationsController);
router.post("/reconcile-now", runIndexingNowController);

export default router;
