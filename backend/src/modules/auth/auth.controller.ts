import { Request, Response } from "express";
import { generateChallenge, verifyChallenge } from "./auth.service";
import { AuthRequest } from "../../shared/middleware/auth.middleware";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "remitflow_session";
const JWT_EXPIRY_HOURS = parseInt(process.env.JWT_EXPIRY_HOURS ?? "24", 10);
const SESSION_MAX_AGE_MS = JWT_EXPIRY_HOURS * 60 * 60 * 1000;

/** POST /auth/challenge — generate a SEP-10 challenge transaction. */
export async function getChallenge(req: Request, res: Response): Promise<void> {
  const { address } = req.body;
  const challenge = await generateChallenge(address);
  res.status(200).json({ success: true, data: challenge });
}

/** POST /auth/verify — verify signed challenge and issue cookie + JWT. */
export async function verifyAuth(req: Request, res: Response): Promise<void> {
  const { address, signedChallengeTx } = req.body;
  const result = await verifyChallenge(address, signedChallengeTx);

  res.cookie(COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_MS,
    path: "/",
  });

  res.status(200).json({
    success: true,
    data: {
      token: result.token,
      role: result.role,
      anchorId: result.anchorId,
    },
  });
}

/** GET /auth/session — retrieve active session details. */
export async function getSession(req: AuthRequest, res: Response): Promise<void> {
  if (!req.walletAddress) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "No active session" },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      walletAddress: req.walletAddress,
      role: req.role ?? "user",
      anchorId: req.anchorId ?? null,
    },
  });
}

/** POST /auth/logout — clear active session cookie. */
export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({ success: true, data: { loggedOut: true } });
}
