import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import { desc, sql } from "drizzle-orm";
import { faker, th } from "@faker-js/faker";
import generateCursor from "../src";

const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").unique(),
  title: text("title"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  publishedAt: integer("published_at", { mode: "timestamp_ms" }),
  timestamp: text("timestamp"),
});

const schema = {
  users: usersTable,
} as const;

const sqlite = new Database(":memory:");

export const db = drizzle(sqlite, { schema, logger: true });
const migrationsFolder = path.join(__dirname, "example.sqlite/migrations");

async function main() {
  await migrate(db, { migrationsFolder });

  await db.run(sql`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE,
            title TEXT,
            created_at TIMESTAMP,
            published_at TIMESTAMP_MS,
            timestamp TEXT
        );
    `);

  const items: (typeof usersTable.$inferInsert)[] = Array.from(
    { length: 100 },
    () => {
      const isPublished = faker.datatype.boolean();
      const hasTimestamp = faker.datatype.boolean();
      return {
        slug: faker.lorem.slug(),
        title: faker.lorem.words(),
        createdAt: faker.date.past({ years: 10 }),
        publishedAt: isPublished ? faker.date.past({ years: 10 }) : null,
        timestamp: hasTimestamp
          ? faker.date.past({ years: 10 }).toISOString()
          : null,
      };
    }
  );

  await db.insert(usersTable).values(items);

  const users = await db.query.users.findMany();

  if (users.length !== 100) {
    throw new Error("❌ Users count is not equal to 101");
  }

  const cursor = generateCursor({
    primaryCursor: { key: "id", schema: usersTable.id, order: "ASC" },
    cursors: [
      { key: "createdAt", schema: usersTable.createdAt, order: "DESC" },
      { key: "publishedAt", schema: usersTable.publishedAt, order: "DESC" },
      { key: "timestamp", schema: usersTable.timestamp, order: "DESC" },
      { key: "slug", schema: usersTable.slug, order: "ASC" },
    ],
  });

  const PAGE_SIZE = 10;

  const data1 = await db
    .select()
    .from(usersTable)
    .orderBy(...cursor.orderBy)
    .where(cursor.where())
    .limit(PAGE_SIZE);

  const [latestRecord] = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt))
    .limit(1);

  console.log({ latestRecord });

  if (data1?.at?.(0)?.id !== latestRecord?.id) {
    throw new Error("❌ First record is not the latest");
  }

  const last1 = data1.at(-1);

  if (!last1) {
    throw new Error("❌ Last1 is not defined");
  }

  const data2 = await db
    .select()
    .from(usersTable)
    .orderBy(...cursor.orderBy)
    .where(cursor.where(last1))
    .limit(PAGE_SIZE);

  const eleventhRecord = (
    await db
      .select()
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(11)
  )?.at?.(-1);

  if (data2?.at?.(0)?.id !== eleventhRecord?.id) {
    throw new Error("❌ First record on data2 is not the eleventh");
  }

  console.log({ eleventhRecord });

  // const n20thRecordToken = cursor.serialize(data2.at(-1));

  // console.log({ n20thRecordToken });

  // const data3 = await db
  //   .select()
  //   .from(usersTable)
  //   .orderBy(...cursor.orderBy)
  //   .where(cursor.where(n20thRecordToken))
  //   .limit(PAGE_SIZE);

  // const n21Record = (
  //   await db
  //     .select()
  //     .from(usersTable)
  //     .orderBy(desc(usersTable.createdAt))
  //     .limit(21)
  // )?.at?.(-1);

  // if (data3?.at?.(0)?.id !== n21Record?.id) {
  //   throw new Error("❌ First record on data3 is not the 21nd");
  // }

  // console.log({ n21Record });
}

main().catch((err) => {
  console.error("❌ test failed");
  console.error(err);
  process.exit(1);
});
