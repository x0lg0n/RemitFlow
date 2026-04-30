import { Router } from "express";
import { authMiddleware, requireAdmin } from "../../shared/middleware/auth.middleware";
import {
  getMetricsOverviewController,
  getMetricsRetentionController,
  getMetricsTransactionsController,
} from "./metrics.controller";

const router: Router = Router();

router.use(authMiddleware, requireAdmin);
router.get("/overview", getMetricsOverviewController);
router.get("/transactions", getMetricsTransactionsController);
router.get("/retention", getMetricsRetentionController);

export default router;
