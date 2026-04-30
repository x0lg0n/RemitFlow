import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  resolveRoleForAddress,
  type SessionRole,
} from "../services/role.service";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "volara_session";

export interface AuthRequest extends Request {
  walletAddress?: string;
  role?: SessionRole;
  anchorId?: string | null;
}

interface DecodedToken {
  sub: string;
  role?: string;
  anchorId?: string | null;
}

function getTokenFromRequest(req: AuthRequest): string | null {
  const bearerHeader = req.headers.authorization;
  const bearerToken =
    bearerHeader && bearerHeader.startsWith("Bearer ")
      ? bearerHeader.split(" ")[1]
      : null;
  const cookieToken = req.cookies?.[COOKIE_NAME] as string | undefined;
  return bearerToken ?? cookieToken ?? null;
}

async function applyAuthContext(req: AuthRequest, token: string): Promise<void> {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");

  const decoded = jwt.verify(token, secret) as DecodedToken;
  req.walletAddress = decoded.sub;

  const dbRole = await resolveRoleForAddress(decoded.sub);

  // Database role mappings take precedence over token role claims.
  if (dbRole.role === "admin") {
    req.role = "admin";
    req.anchorId = null;
    return;
  }

  if (dbRole.role === "anchor") {
    req.role = "anchor";
    req.anchorId = dbRole.anchorId;
    return;
  }

  // Preserve oracle role claim when no DB-mapped role exists.
  req.role = decoded.role === "oracle" ? "oracle" : "user";
  req.anchorId = null;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = getTokenFromRequest(req);

  if (!token) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Missing authentication token" },
    });
    return;
  }

  try {
    await applyAuthContext(req, token);
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Invalid or expired token" },
    });
  }
}

/**
 * Optional auth parser for endpoints that remain public but can benefit from
 * user context (for example user-specific filtering).
 */
export async function optionalAuthMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = getTokenFromRequest(req);
  if (!token) {
    next();
    return;
  }

  try {
    await applyAuthContext(req, token);
  } catch {
    // Ignore malformed/expired tokens for optional-auth routes.
  }

  next();
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
