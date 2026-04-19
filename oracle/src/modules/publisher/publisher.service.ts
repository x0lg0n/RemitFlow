import { ValidatedRate, PublishResult } from "../../shared/types/oracle.types";
import { publishToDatabase } from "./db-publisher.service";
import { publishToContract } from "./contract-publisher.service";

/**
 * Publish validated rates to all destinations:
 * 1. PostgreSQL (upsert) + Redis (cache)
 * 2. Soroban smart contract (on-chain)
 */
export async function publishRates(
  rates: ValidatedRate[]
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];

  // Step 1: Write to DB + Redis (batch).
  try {
    await publishToDatabase(rates);
  } catch (error) {
    console.error(
      "Oracle Publisher: DB/Redis batch failed:",
      (error as Error).message
    );
    // Mark all as failed for DB.
    for (const rate of rates) {
      results.push({
        anchorId: rate.anchorId,
        dbSuccess: false,
        redisSuccess: false,
        contractSuccess: false,
        error: (error as Error).message,
      });
    }
    return results;
  }

  // Step 2: Publish each rate on-chain (individually).
  for (const rate of rates) {
    const contractResult = await publishToContract(rate);

    results.push({
      anchorId: rate.anchorId,
      dbSuccess: true,
      redisSuccess: true,
      contractSuccess: contractResult.success,
      contractTxHash: contractResult.txHash,
      error: contractResult.error,
    });
  }

  return results;
}
