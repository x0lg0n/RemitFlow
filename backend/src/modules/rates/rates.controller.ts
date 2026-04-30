import { Response } from "express";
import { getAllActiveRates, findBestRoute } from "./rate.service";
import { RateRequest } from "../../shared/types/rate.types";
import { AuthRequest } from "../../shared/middleware/auth.middleware";

/** GET /rates — return rates from all active anchors. */
export async function getRates(req: AuthRequest, res: Response): Promise<void> {
  const rates = await getAllActiveRates(req.walletAddress);
  res.status(200).json({ success: true, data: { rates } });
}

/** POST /rates/best — return the cheapest route for the request. */
export async function getBestRoute(req: AuthRequest, res: Response): Promise<void> {
  const request = req.body as RateRequest;
  const best = await findBestRoute(request, req.walletAddress);

  if (!best) {
    res.status(404).json({
      success: false,
      error: { code: "NO_ROUTE_FOUND", message: "No anchor supports this route" },
    });
    return;
  }

  res.status(200).json({ success: true, data: best });
}
