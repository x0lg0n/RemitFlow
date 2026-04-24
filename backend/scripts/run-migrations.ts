/**
 * Database migration runner for CI/CD and local development
 * Applies all SQL migrations in order from database/migrations/
 */

import { pool } from "./src/shared/config/database";
import * as fs from "fs";
import * as path from "path";

async function runMigrations(): Promise<void> {
  console.log("Starting database migrations...");

  const migrationsDir = path.join(__dirname, "../database/migrations");

  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f: string) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found.");
    await pool.end();
    return;
  }

  console.log(`Found ${files.length} migration(s) to apply:`);
  files.forEach((f: string, i: number) => {
    console.log(`  ${i + 1}. ${f}`);
  });
  console.log("");

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf8");

    try {
      await pool.query(sql);
      console.log(`✅ Applied migration: ${file}`);
    } catch (error) {
      console.error(`❌ Failed to apply migration: ${file}`);
      console.error((error as Error).message);
      await pool.end();
      process.exit(1);
    }
  }

  console.log("\n✅ All migrations applied successfully!");
  await pool.end();
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
