import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import type { PgliteClient } from "drizzle-orm/pglite";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { defineRelations, sql } from "drizzle-orm";
import type { CursorConfig } from "drizzle-cursor";
import { generateCursor } from "drizzle-cursor";

const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull(),
});

const relations = defineRelations({ users }, (r) => ({}));

async function main() {
  const client = new PGlite() as PgliteClient;
  const db = drizzle({
    client,
    schema: { users },
    relations,
  });

  await db.execute(
    sql`create table users (id integer generated always as identity primary key, slug text not null);`,
  );

  for (let i = 1; i <= 20; i++) {
    await db
      .insert(users)
      .values({ slug: `slug-${String(i).padStart(2, "0")}` });
  }

  const cursorConfig: CursorConfig = {
    primaryCursor: { key: "id", schema: users.id, order: "ASC" },
    cursors: [{ key: "slug", schema: users.slug, order: "ASC" }],
  };

  const cursor = generateCursor(cursorConfig);

  /*****************
   * QUERY BUILDER *
   *****************/

  const queryBuilderPage1 = await db
    .select({ id: users.id, slug: users.slug })
    .from(users)
    .orderBy(...cursor.orderBy)
    .where(cursor.where())
    .limit(5);

  assert.equal(queryBuilderPage1.length, 5);
  assert.equal(queryBuilderPage1[0]?.slug, "slug-01");

  const queryBuilderPage2 = await db
    .select({ id: users.id, slug: users.slug })
    .from(users)
    .orderBy(...cursor.orderBy)
    .where(cursor.where(cursor.serialize(queryBuilderPage1.at(-1))))
    .limit(5);

  assert.equal(queryBuilderPage2.length, 5);
  assert.equal(queryBuilderPage2[0]?.slug, "slug-06");

  /************
   * QUERY V1 *
   ************/

  const queryV1Page1 = await db._query.users.findMany({
    orderBy: cursor.orderBy,
    where: cursor.where(),
    limit: 5,
  });

  assert.equal(queryV1Page1.length, 5);
  assert.equal(queryV1Page1[0].slug, "slug-01");

  const queryV1Page2 = await db._query.users.findMany({
    orderBy: cursor.orderBy,
    where: cursor.where(queryV1Page1.at(-1)),
    limit: 5,
  });

  assert.equal(queryV1Page2.length, 5);
  assert.equal(queryV1Page2[0]?.slug, "slug-06");

  /************
   * QUERY V2 *
   ************/

  const queryV2Page1 = await db.query.users.findMany({
    orderBy: cursor.relational.orderBy,
    where: cursor.relational.where(),
    limit: 5,
  });

  assert.equal(queryV2Page1.length, 5);
  assert.equal(queryV2Page1[0].slug, "slug-01");

  const queryV2Page2 = await db.query.users.findMany({
    orderBy: cursor.relational.orderBy,
    where: cursor.relational.where(queryV2Page1.at(-1)),
    limit: 5,
  });

  assert.equal(queryV2Page2.length, 5);
  assert.equal(queryV2Page2[0]?.slug, "slug-06");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
