import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { seedReferenceData } from "./seed";

export type Database = NodePgDatabase<typeof schema>;

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("DATABASE_URL is not set. Connect a PostgreSQL database in production.");
    this.name = "DatabaseUnavailableError";
  }
}

const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle");

/**
 * Local development: embedded PostgreSQL (PGlite) stored outside the project,
 * so OneDrive/Git never sync live database files. Migrations and seed run automatically.
 */
async function createLocalDatabase(): Promise<Database> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");

  const dataDir =
    process.env.PGLITE_DATA_DIR ?? path.join(os.homedir(), ".clinic-platform", "pglite");
  // PGlite only creates the last folder, so make sure the parents exist
  await mkdir(path.dirname(dataDir), { recursive: true });
  const client = new PGlite(dataDir);
  const db = drizzle({ client, schema });

  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  await seedReferenceData(db as unknown as Database);

  // Both drivers expose the same query builder API; one type keeps call sites simple.
  return db as unknown as Database;
}

/** Production: regular PostgreSQL (e.g. Neon) via DATABASE_URL. Migrations run at build time. */
async function createRemoteDatabase(connectionString: string): Promise<Database> {
  const { drizzle } = await import("drizzle-orm/node-postgres");
  return drizzle({ connection: { connectionString, max: 5 }, schema });
}

const globalForDb = globalThis as unknown as { dbPromise?: Promise<Database> };

export function getDb(): Promise<Database> {
  if (!globalForDb.dbPromise) {
    const url = process.env.DATABASE_URL;
    if (url) {
      globalForDb.dbPromise = createRemoteDatabase(url);
    } else if (process.env.NODE_ENV !== "production") {
      globalForDb.dbPromise = createLocalDatabase();
    } else {
      return Promise.reject(new DatabaseUnavailableError());
    }
    // Allow a retry on the next request if initialisation failed
    globalForDb.dbPromise.catch(() => {
      globalForDb.dbPromise = undefined;
    });
  }
  return globalForDb.dbPromise;
}

export { schema };
