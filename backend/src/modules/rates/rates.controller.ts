import { Request, Response } from "express";
import { getAllActiveRates, findBestRoute } from "./rate.service";
import { RateRequest } from "../../shared/types/rate.types";

/** GET /rates — return rates from all active anchors. */
export async function getRates(_req: Request, res: Response): Promise<void> {
  const rates = await getAllActiveRates();
  res.status(200).json({ success: true, data: { rates } });
}

/** POST /rates/best — return the cheapest route for the request. */
export async function getBestRoute(req: Request, res: Response): Promise<void> {
  const request = req.body as RateRequest;
  const best = await findBestRoute(request);

  if (!best) {
    res.status(404).json({
      success: false,
      error: { code: "NO_ROUTE_FOUND", message: "No anchor supports this route" },
    });
    return;
  }

  res.status(200).json({ success: true, data: best });
}
