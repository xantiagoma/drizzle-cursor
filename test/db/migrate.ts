import "dotenv/config";

import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";

import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const runMigrate = async () => {
  const sqlite = new Database("db.db");
  const db: BetterSQLite3Database = drizzle(sqlite);

  console.log("⏳ Running migrations...");

  const start = Date.now();

  await migrate(db, { migrationsFolder: "test/db/migrations" });

  const end = Date.now();

  console.log("✅ Migrations completed in", end - start, "ms");

  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
