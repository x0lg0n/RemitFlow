import { Request, Response } from "express";
import {
  listAnchors,
  registerAnchor,
  updateAnchorActive,
  getAnchorDashboard,
} from "./anchor.service";
import { AuthRequest } from "../../shared/middleware/auth.middleware";

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
