import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { generateCursor } from "drizzle-cursor";

const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull(),
});

async function main() {
  const client = new PGlite();
  const db = drizzle(client, { schema: { users } });

  await db.execute(
    sql`create table users (id integer generated always as identity primary key, slug text not null);`,
  );

  for (let i = 1; i <= 20; i++) {
    await db.insert(users).values({ slug: `slug-${String(i).padStart(2, "0")}` });
  }

  const cursor = generateCursor({
    primaryCursor: { key: "id", schema: users.id, order: "ASC" },
    cursors: [{ key: "slug", schema: users.slug, order: "ASC" }],
  });

  const page1 = await db
    .select({ id: users.id, slug: users.slug })
    .from(users)
    .orderBy(...cursor.orderBy)
    .where(cursor.where())
    .limit(5);

  assert.equal(page1.length, 5);
  assert.equal(page1[0]?.slug, "slug-01");

  const page2 = await db
    .select({ id: users.id, slug: users.slug })
    .from(users)
    .orderBy(...cursor.orderBy)
    .where(cursor.where(cursor.serialize(page1.at(-1))))
    .limit(5);

  assert.equal(page2.length, 5);
  assert.equal(page2[0]?.slug, "slug-06");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
