import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./auth.middleware";
import { pool } from "../config/database";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

jest.mock("../config/database", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("authMiddleware", () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const next = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("accepts cookie token and resolves anchor role", async () => {
    const req = {
      headers: {},
      cookies: { remitflow_session: "cookie.jwt" },
    } as unknown as Request;

    (jwt.verify as jest.Mock).mockReturnValue({ sub: "GABC", role: "user" });
    (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: "anchor-1" }] });

    await authMiddleware(req as never, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("cookie.jwt", "test-secret");
    expect((req as never as { role?: string }).role).toBe("anchor");
    expect((req as never as { anchorId?: string }).anchorId).toBe("anchor-1");
    expect(next).toHaveBeenCalled();
  });

  it("returns 401 when token missing", async () => {
    const req = { headers: {}, cookies: {} } as unknown as Request;

    await authMiddleware(req as never, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
