import { pool } from "../config/database";
import { resolveRoleForAddress } from "./role.service";

jest.mock("../config/database", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("resolveRoleForAddress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns admin when wallet exists in admin_wallets", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ wallet_address: "GADMIN" }],
    });

    const result = await resolveRoleForAddress("GADMIN");

    expect(result).toEqual({ role: "admin", anchorId: null });
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("falls back to anchor when admin table is missing", async () => {
    (pool.query as jest.Mock)
      .mockRejectedValueOnce({ code: "42P01" })
      .mockResolvedValueOnce({ rows: [{ id: "anchor-1" }] });

    const result = await resolveRoleForAddress("GANCHOR");

    expect(result).toEqual({ role: "anchor", anchorId: "anchor-1" });
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  it("returns user when address has no admin or anchor role", async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await resolveRoleForAddress("GUSER");

    expect(result).toEqual({ role: "user", anchorId: null });
  });
});
