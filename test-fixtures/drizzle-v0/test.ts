import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import type { PgliteClient } from "drizzle-orm/pglite";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { generateCursor } from "drizzle-cursor";

const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull(),
});

const items = pgTable("items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  firstName: text("first_name").notNull(),
  rank: integer("rank").notNull(),
});

async function main() {
  const client = new PGlite() as unknown as PgliteClient;
  const db = drizzle({
    client,
    schema: { users, items },
  });

  await db.execute(
    sql`create table users (id integer generated always as identity primary key, slug text not null);`,
  );

  for (let i = 1; i <= 20; i++) {
    await db
      .insert(users)
      .values({ slug: `slug-${String(i).padStart(2, "0")}` });
  }

  const cursor = generateCursor({
    primaryCursor: { key: "id", schema: users.id, order: "ASC" },
    cursors: [{ key: "slug", schema: users.slug, order: "ASC" }],
  });

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

  const queryV1Page1 = await db.query.users.findMany({
    orderBy: cursor.orderBy,
    where: cursor.where(),
    limit: 5,
  });

  assert.equal(queryV1Page1.length, 5);
  assert.equal(queryV1Page1[0].slug, "slug-01");

  const queryV1Page2 = await db.query.users.findMany({
    orderBy: cursor.orderBy,
    where: cursor.where(queryV1Page1.at(-1)),
    limit: 5,
  });

  assert.equal(queryV1Page2.length, 5);
  assert.equal(queryV1Page2[0]?.slug, "slug-06");

  /**********************
   * SQL EXPRESSION CURSOR
   * Table: items(id, firstName, rank)
   * Sort: rank::text || '-' || upper(firstName) ASC, then id ASC
   **********************/

  await db.execute(
    sql`create table items (id integer generated always as identity primary key, first_name text not null, rank integer not null);`,
  );

  // Insert order matters for id assignment
  // rank=2 "alpha" → id=1, rank=1 "beta" → id=2, rank=3 "gamma" → id=3
  // rank=1 "delta" → id=4, rank=2 "epsilon" → id=5, rank=3 "zeta" → id=6
  for (const row of [
    { firstName: "alpha", rank: 2 },
    { firstName: "beta", rank: 1 },
    { firstName: "gamma", rank: 3 },
    { firstName: "delta", rank: 1 },
    { firstName: "epsilon", rank: 2 },
    { firstName: "zeta", rank: 3 },
  ]) {
    await db.insert(items).values(row);
  }

  // SQL expression: rank || '-' || upper(firstName)
  // Sorted: "1-BETA","1-DELTA","2-ALPHA","2-EPSILON","3-GAMMA","3-ZETA"
  const rankUpperName = sql<string>`${items.rank}::text || '-' || upper(${items.firstName})`;
  const sqlCursor = generateCursor({
    primaryCursor: { key: "id", schema: items.id, order: "ASC" },
    cursors: [{ key: "rankUpperName", sql: rankUpperName, order: "ASC" }],
  });

  const sqlQbPage1 = await db
    .select({
      id: items.id,
      firstName: items.firstName,
      rank: items.rank,
      rankUpperName,
    })
    .from(items)
    .orderBy(...sqlCursor.orderBy)
    .where(sqlCursor.where())
    .limit(3);

  assert.equal(sqlQbPage1.length, 3);
  assert.equal(sqlQbPage1[0]?.firstName, "beta");
  assert.equal(sqlQbPage1[1]?.firstName, "delta");
  assert.equal(sqlQbPage1[2]?.firstName, "alpha");

  const sqlQbPage2 = await db
    .select({
      id: items.id,
      firstName: items.firstName,
      rank: items.rank,
      rankUpperName,
    })
    .from(items)
    .orderBy(...sqlCursor.orderBy)
    .where(sqlCursor.where(sqlCursor.serialize(sqlQbPage1.at(-1))))
    .limit(3);

  assert.equal(sqlQbPage2.length, 3);
  assert.equal(sqlQbPage2[0]?.firstName, "epsilon");
  assert.equal(sqlQbPage2[1]?.firstName, "gamma");
  assert.equal(sqlQbPage2[2]?.firstName, "zeta");

  /**********************
   * QUERY V1 + SQL CURSOR
   **********************/

  const sqlV1Page1 = await db.query.items.findMany({
    orderBy: sqlCursor.orderBy,
    where: sqlCursor.where(),
    limit: 3,
  });

  assert.equal(sqlV1Page1.length, 3);
  assert.equal(sqlV1Page1[0]?.firstName, "beta");

  // Use token from query builder (which has rankUpperName) to paginate
  const sqlV1Page2 = await db.query.items.findMany({
    orderBy: sqlCursor.orderBy,
    where: sqlCursor.where(sqlCursor.serialize(sqlQbPage1.at(-1))),
    limit: 3,
  });

  assert.equal(sqlV1Page2.length, 3);
  assert.equal(sqlV1Page2[0]?.firstName, "epsilon");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
