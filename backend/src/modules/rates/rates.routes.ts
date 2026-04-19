import { Router } from "express";
import { getRates, getBestRoute } from "./rates.controller";
import { validate } from "../../shared/middleware/validation.middleware";
import { bestRouteSchema } from "./rate.validator";

const router: Router = Router();

/** GET /rates — list all active anchor rates. */
router.get("/", getRates);

/** POST /rates/best — find cheapest route (public, validated). */
router.post("/best", validate(bestRouteSchema), getBestRoute);

export default router;
