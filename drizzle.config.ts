import { defineConfig } from "drizzle-kit";

// Only used to generate SQL migrations (`npm run db:generate`).
// Migrations are applied by src/db/migrate.ts — locally on startup, in production during build.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
});
