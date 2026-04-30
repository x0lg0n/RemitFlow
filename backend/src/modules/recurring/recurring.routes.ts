import { Router } from "express";
import {
  createRecurringSend,
  getRecurringSends,
  patchRecurringSend,
  pauseRecurringSend,
  resumeRecurringSend,
  cancelRecurringSend,
  confirmRecurringRun,
} from "./recurring.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { validate } from "../../shared/middleware/validation.middleware";
import {
  confirmRecurringRunSchema,
  createRecurringSendSchema,
  updateRecurringSendSchema,
} from "./recurring.validator";

const router: Router = Router();

router.use(authMiddleware);

router.post("/", validate(createRecurringSendSchema), createRecurringSend);
router.get("/", getRecurringSends);
router.patch("/:id", validate(updateRecurringSendSchema), patchRecurringSend);
router.post("/:id/pause", pauseRecurringSend);
router.post("/:id/resume", resumeRecurringSend);
router.post("/:id/cancel", cancelRecurringSend);
router.post("/runs/:runId/confirm", validate(confirmRecurringRunSchema), confirmRecurringRun);

export default router;
