import { pool } from "../config/database";

export type SessionRole = "user" | "admin" | "oracle" | "anchor";

export interface RoleResolution {
  role: SessionRole;
  anchorId: string | null;
}

/**
 * Resolve the effective role for a Stellar wallet address.
 * Precedence: admin_wallets -> anchors -> user.
 */
export async function resolveRoleForAddress(address: string): Promise<RoleResolution> {
  try {
    const adminResult = await pool.query<{ wallet_address: string }>(
      "SELECT wallet_address FROM admin_wallets WHERE wallet_address = $1 LIMIT 1",
      [address]
    );

    if (adminResult.rows.length > 0) {
      return { role: "admin", anchorId: null };
    }
  } catch (error) {
    // Allow auth to continue when migrations have not yet created admin_wallets.
    const code = (error as { code?: string }).code;
    if (code !== "42P01") {
      throw error;
    }
  }

  const anchorResult = await pool.query<{ id: string }>(
    "SELECT id FROM anchors WHERE stellar_address = $1 LIMIT 1",
    [address]
  );

  if (anchorResult.rows.length > 0) {
    return { role: "anchor", anchorId: anchorResult.rows[0].id };
  }

  return { role: "user", anchorId: null };
}
