import "dotenv/config";
import { startScheduler } from "./scheduler";
import { pool } from "./shared/config/database";
import { redis } from "./shared/config/redis";

async function main(): Promise<void> {
  console.log("RemitFlow Oracle Service starting...");

  // Verify database connection.
  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected");
  } catch (err) {
    console.error(
      "PostgreSQL connection failed — oracle will retry on next run:",
      (err as Error).message
    );
  }

  // Redis is lazy — logged by the client itself.

  // Start the cron-based scheduler.
  startScheduler();
}

main().catch((err) => {
  console.error("Oracle failed to start:", err.message);
  process.exit(1);
});
