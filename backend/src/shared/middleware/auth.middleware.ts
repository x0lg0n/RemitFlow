import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "remitflow_session";

export interface AuthRequest extends Request {
  walletAddress?: string;
  role?: "user" | "admin" | "oracle" | "anchor";
  anchorId?: string | null;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const bearerHeader = req.headers.authorization;
  const bearerToken =
    bearerHeader && bearerHeader.startsWith("Bearer ")
      ? bearerHeader.split(" ")[1]
      : null;
  const cookieToken = req.cookies?.[COOKIE_NAME] as string | undefined;
  const token = bearerToken ?? cookieToken;

  if (!token) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Missing authentication token" },
    });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const decoded = jwt.verify(token, secret) as {
      sub: string;
      role?: string;
      anchorId?: string | null;
    };

    req.walletAddress = decoded.sub;
    req.role = (decoded.role as AuthRequest["role"]) ?? "user";
    req.anchorId = decoded.anchorId ?? null;

    // Resolve anchor role from DB if token role is user and wallet maps to an anchor.
    if (req.walletAddress && req.role === "user") {
      const { rows } = await pool.query<{ id: string }>(
        "SELECT id FROM anchors WHERE stellar_address = $1 LIMIT 1",
        [req.walletAddress]
      );

      if (rows.length > 0) {
        req.role = "anchor";
        req.anchorId = rows[0].id;
      }
    }

    next();
  } catch {
    res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Invalid or expired token" },
    });
  }
}

/** Require the authenticated user to have the admin role. */
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.role !== "admin") {
    res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "Admin access required" },
    });
    return;
  }
  next();
}

/** Require the oracle role. */
export function requireOracle(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.role !== "oracle") {
    res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "Oracle access required" },
    });
    return;
  }
  next();
}

/** Require anchor role (or admin override). */
export function requireAnchor(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.role !== "anchor" && req.role !== "admin") {
    res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "Anchor access required" },
    });
    return;
  }

  if (req.role === "anchor" && !req.anchorId) {
    res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "Anchor mapping not found" },
    });
    return;
  }

  next();
}
