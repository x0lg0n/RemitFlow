import { StrKey } from "@stellar/stellar-sdk";
import { pool } from "../src/shared/config/database";

async function bootstrapAdminWallet(): Promise<void> {
  const walletAddress = process.argv[2];
  const createdBy = process.argv[3] ?? null;

  if (!walletAddress) {
    console.error("Usage: npm run bootstrap:admin -- <WALLET_ADDRESS> [CREATED_BY_WALLET]");
    process.exit(1);
  }

  if (!StrKey.isValidEd25519PublicKey(walletAddress)) {
    console.error("Invalid wallet address. Expected a valid Stellar public key.");
    process.exit(1);
  }

  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS admin_wallets (
         wallet_address VARCHAR(56) PRIMARY KEY,
         created_by VARCHAR(56),
         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`
    );

    const result = await pool.query(
      `INSERT INTO admin_wallets (wallet_address, created_by)
       VALUES ($1, $2)
       ON CONFLICT (wallet_address) DO NOTHING`,
      [walletAddress, createdBy]
    );

    if ((result.rowCount ?? 0) > 0) {
      console.log(`Admin wallet bootstrapped: ${walletAddress}`);
    } else {
      console.log(`Admin wallet already exists: ${walletAddress}`);
    }
  } finally {
    await pool.end();
  }
}

bootstrapAdminWallet().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to bootstrap admin wallet: ${message}`);
  process.exit(1);
});
