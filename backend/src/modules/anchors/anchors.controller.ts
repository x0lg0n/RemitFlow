import { Request, Response } from "express";
import {
  listAnchors,
  registerAnchor,
  updateAnchorActive,
  getAnchorDashboard,
} from "./anchor.service";
import { AuthRequest } from "../../shared/middleware/auth.middleware";
import {
  activateUserAnchor,
  createAnchorSubmission,
  deactivateUserAnchor,
  getUserAnchorPreferences,
  listCatalog,
  MarketplaceError,
} from "./marketplace.service";

/** GET /anchors — list all active anchors. */
export async function listAllAnchors(_req: Request, res: Response): Promise<void> {
  const anchors = await listAnchors();
  res.status(200).json({ success: true, data: { anchors } });
}

/** POST /anchors — register a new anchor (admin). */
export async function createAnchor(req: Request, res: Response): Promise<void> {
  const {
    id,
    name,
    stellarAddress,
    baseUrl,
    authToken,
    supportedCurrencies,
    supportedCountries,
  } = req.body;

  const anchor = await registerAnchor({
    id,
    name,
    stellarAddress,
    baseUrl,
    authToken,
    supportedCurrencies,
    supportedCountries,
  });

  res.status(201).json({ success: true, data: { anchor } });
}

/** PUT /anchors/:id — update anchor active status (admin). */
export async function updateAnchor(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (Array.isArray(id)) {
    res.status(400).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Invalid anchor ID" },
    });
    return;
  }

  const { isActive } = req.body;
  const anchor = await updateAnchorActive(id, isActive);

  if (!anchor) {
    res.status(404).json({
      success: false,
      error: { code: "ANCHOR_NOT_FOUND", message: "Anchor not found" },
    });
    return;
  }

  res.status(200).json({ success: true, data: { anchor } });
}

/** GET /anchors/me/dashboard — anchor-specific KPI + trends + recent txs. */
export async function getMyDashboard(req: AuthRequest, res: Response): Promise<void> {
  const anchorId = req.anchorId;
  if (!anchorId) {
    res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "Anchor context not found" },
    });
    return;
  }

  const dashboard = await getAnchorDashboard(anchorId);
  if (!dashboard) {
    res.status(404).json({
      success: false,
      error: { code: "ANCHOR_NOT_FOUND", message: "Anchor not found" },
    });
    return;
  }

  res.status(200).json({ success: true, data: dashboard });
}

function getAuthenticatedUserId(req: AuthRequest): string {
  if (!req.walletAddress) {
    throw new MarketplaceError(401, "UNAUTHORIZED", "Authentication required");
  }

  return req.walletAddress;
}

function readRouteParam(value: string | string[] | undefined, fieldName: string): string {
  if (!value || Array.isArray(value)) {
    throw new MarketplaceError(400, "BAD_REQUEST", `Invalid ${fieldName}`);
  }

  return value;
}

/** GET /anchors/catalog — list published marketplace anchors. */
export async function getAnchorCatalog(req: AuthRequest, res: Response): Promise<void> {
  const catalog = await listCatalog(req.walletAddress);
  res.status(200).json({ success: true, data: { catalog } });
}

/** GET /anchors/preferences/me — list caller's anchor preferences. */
export async function getMyAnchorPreferences(req: AuthRequest, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req);
  const preferences = await getUserAnchorPreferences(userId);
  res.status(200).json({ success: true, data: { preferences } });
}

/** POST /anchors/preferences/:anchorId/activate — activate anchor preference for caller. */
export async function activateMyAnchorPreference(req: AuthRequest, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req);
  const catalogId = readRouteParam(req.params.anchorId, "anchorId");
  const preference = await activateUserAnchor(userId, catalogId);
  res.status(200).json({ success: true, data: { preference } });
}

/** DELETE /anchors/preferences/:anchorId — deactivate caller anchor preference. */
export async function deactivateMyAnchorPreference(req: AuthRequest, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req);
  const catalogId = readRouteParam(req.params.anchorId, "anchorId");
  const updated = await deactivateUserAnchor(userId, catalogId);
  if (!updated) {
    res.status(404).json({
      success: false,
      error: { code: "PREFERENCE_NOT_FOUND", message: "Anchor preference not found" },
    });
    return;
  }

  res.status(200).json({ success: true, data: { deactivated: true } });
}

/** POST /anchors/submissions — submit a new marketplace anchor request. */
export async function createAnchorSubmissionRequest(req: AuthRequest, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req);
  const submission = await createAnchorSubmission({
    userId,
    anchorName: req.body.anchorName,
    baseUrl: req.body.baseUrl,
    countryCode: req.body.countryCode,
    supportedCurrencies: req.body.supportedCurrencies,
    notes: req.body.notes,
  });

  res.status(201).json({ success: true, data: { submission } });
}
