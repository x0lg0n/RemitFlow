import { Router } from "express";
import { getChallenge, verifyAuth, getSession, logout } from "./auth.controller";
import { validate } from "../../shared/middleware/validation.middleware";
import { challengeSchema, verifySchema } from "./auth.validator";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router: Router = Router();

/** Generate a SEP-10 challenge transaction. */
router.post("/challenge", validate(challengeSchema), getChallenge);

/** Verify a signed challenge and receive a JWT + httpOnly cookie. */
router.post("/verify", validate(verifySchema), verifyAuth);

/** Return currently authenticated session details. */
router.get("/session", authMiddleware, getSession);

/** Clear session cookie. */
router.post("/logout", logout);

export default router;
