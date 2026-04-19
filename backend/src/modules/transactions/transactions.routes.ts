import { Router } from "express";
import { createTx, listUserTransactions, getTx } from "./transactions.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { validate } from "../../shared/middleware/validation.middleware";
import { createTransactionSchema } from "./transaction.validator";

const router: Router = Router();

/** All transaction endpoints require authentication. */
router.use(authMiddleware);

/** POST /transactions — create a new remittance. */
router.post("/", validate(createTransactionSchema), createTx);

/** GET /transactions — list user's transactions. */
router.get("/", listUserTransactions);

/** GET /transactions/:id — get a single transaction. */
router.get("/:id", getTx);

export default router;
