import "dotenv/config";

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // A non-routable fallback lets `prisma generate` run during install/build.
    // Migrate, seed, and runtime queries still require a real DATABASE_URL.
    url: process.env.DATABASE_URL ?? "postgresql://unconfigured:unconfigured@127.0.0.1:5432/unconfigured",
  },
});
