import { NextFunction, Request, Response, Router } from "express";
import { validate } from "../../shared/middleware/validation.middleware";
import {
  putCustomerCallback,
  getCustomerCallback,
  deleteCustomerCallback,
  getRateCallback,
} from "./callbacks.controller";
import { putCustomerSchema } from "./callbacks.validator";

const router: Router = Router();

function callbackAuth(req: Request, res: Response, next: NextFunction): void {
  const configuredApiKey = process.env.CALLBACK_API_KEY;
  if (!configuredApiKey) {
    next();
    return;
  }

  const providedApiKey = req.header("x-callback-api-key");
  if (providedApiKey !== configuredApiKey) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid callback API key" },
    });
    return;
  }

  next();
}

router.use(callbackAuth);

router.get("/customer", getCustomerCallback);
router.put("/customer", validate(putCustomerSchema), putCustomerCallback);
router.delete("/customer", deleteCustomerCallback);
router.get("/rate", getRateCallback);

export default router;
