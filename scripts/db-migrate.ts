/**
 * Applies migrations and reference data to the production database.
 * Runs before `next build`; skipped when DATABASE_URL is not configured.
 */
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "../src/db/schema";
import { seedReferenceData } from "../src/db/seed";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log("[db] DATABASE_URL is not set — skipping migrations.");
    return;
  }

  const db = drizzle({ connection: { connectionString, max: 1 }, schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await seedReferenceData(db);
  await db.$client.end();
  console.log("[db] Migrations and reference data applied.");
}

main().catch((error) => {
  console.error("[db] Migration failed:", error);
  process.exit(1);
});
