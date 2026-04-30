import { Router } from "express";
import { getRates, getBestRoute } from "./rates.controller";
import { validate } from "../../shared/middleware/validation.middleware";
import { bestRouteSchema } from "./rate.validator";
import { optionalAuthMiddleware } from "../../shared/middleware/auth.middleware";

const router: Router = Router();

/** GET /rates — list all active anchor rates. */
router.get("/", optionalAuthMiddleware, getRates);

/** POST /rates/best — find cheapest route (public, validated). */
router.post("/best", optionalAuthMiddleware, validate(bestRouteSchema), getBestRoute);

export default router;
