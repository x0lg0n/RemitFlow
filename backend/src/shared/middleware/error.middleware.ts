import { Request, Response, NextFunction } from "express";

interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorMiddleware(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? "INTERNAL_ERROR";

  // Never expose internal errors or stack traces to clients.
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  console.error(`[Error] ${code}: ${err.message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}
