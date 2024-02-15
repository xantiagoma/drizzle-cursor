import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "test/db/schema.ts",
  out: "test/db/migrations",
  driver: "better-sqlite",
  verbose: true,
  dbCredentials: {
    url: "db.db",
  },
} satisfies Config;
