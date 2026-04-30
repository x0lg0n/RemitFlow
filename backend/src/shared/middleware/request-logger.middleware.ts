import { randomUUID } from "node:crypto";
import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

function getRequestId(req: Request): string {
  const existing =
    (req.headers["x-request-id"] as string | undefined) ??
    (req.headers["x-correlation-id"] as string | undefined);
  return existing && existing.trim().length > 0 ? existing : randomUUID();
}

export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = getRequestId(req);
  const startedAt = Date.now();
  const vercelRequestId = req.headers["x-vercel-id"];

  res.setHeader("x-request-id", requestId);
  logger.info("http_request_start", {
    requestId,
    vercelRequestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  res.on("finish", () => {
    logger.info("http_request_done", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
}
