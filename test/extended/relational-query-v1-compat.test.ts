import { describe, expect, test } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { generateCursor } from "../../src";

type RelationalFindManyInput = {
  columns: {
    id: true;
    slug: true;
  };
  orderBy: ReturnType<Awaited<ReturnType<typeof generateCursor>>["orderBy"]>;
  where: ReturnType<Awaited<ReturnType<typeof generateCursor>>["where"]>;
  limit: number;
};

type RelationalFindMany = (input: RelationalFindManyInput) => Promise<Array<{ id: number; slug: string }>>;

const getRelationalFindMany = (db: Record<string, unknown>, key: "_query" | "query"): RelationalFindMany | undefined => {
  const container = db[key];
  if (!container || typeof container !== "object") {
    return undefined;
  }

  const users = (container as { users?: unknown }).users;
  if (!users || typeof users !== "object") {
    return undefined;
  }

  const findMany = (users as { findMany?: unknown }).findMany;
  if (typeof findMany !== "function") {
    return undefined;
  }

  return findMany as RelationalFindMany;
};

const runRelationalPage = async (findMany: RelationalFindMany, relationLabel: string) => {
  const cursor = generateCursor({
    primaryCursor: { key: "id", schema: users.id, order: "ASC" },
    cursors: [{ key: "slug", schema: users.slug, order: "ASC" }],
  });

  const firstPage = await findMany({
    columns: {
      id: true,
      slug: true,
    },
    orderBy: cursor.orderBy,
    where: cursor.where(),
    limit: 5,
  });
  expect(firstPage).toHaveLength(5);
  expect(firstPage[0]?.slug).toBe("slug-01");

  const token = cursor.serialize(firstPage.at(-1));
  const secondPage = await relationalApi.findMany({
    columns: {
      id: true,
      slug: true,
    },
    orderBy: cursor.orderBy,
    where: cursor.where(token),
    limit: 5,
  });

  expect(secondPage).toHaveLength(5);
  expect(secondPage[0]?.slug).toBe("slug-06");
  return { firstPage, secondPage, relationLabel };
};

const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
});

const schema = { users };

describe("relational query compatibility", () => {
  const setup = async () => {
    const client = new PGlite();
    const db = drizzle(client, { schema });

    await db.execute(
      sql`create table users (id integer generated always as identity primary key, name text not null, slug text not null);`,
    );

    for (let i = 1; i <= 20; i++) {
      await db.insert(users).values({
        name: `user-${i}`,
        slug: `slug-${String(i).padStart(2, "0")}`,
      });
    }
    return db;
  };

  test("supports query-builder path across drizzle versions", async () => {
    const db = await setup();

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

    expect(page1).toHaveLength(5);
    expect(page1[0]?.slug).toBe("slug-01");

    const token = cursor.serialize(page1.at(-1));

    const page2 = await db
      .select({ id: users.id, slug: users.slug })
      .from(users)
      .orderBy(...cursor.orderBy)
      .where(cursor.where(token))
      .limit(5);

    expect(page2).toHaveLength(5);
    expect(page2[0]?.slug).toBe("slug-06");
  });

  test("supports db._query in drizzle v1 and db.query in drizzle v0/v1", async () => {
    const db = await setup();
    const hasLegacyRelational = "_query" in db && "query" in db;

    const queryApi = getRelationalFindMany(db, "query");
    const legacyApi = getRelationalFindMany(db, "_query");

    if (hasLegacyRelational) {
      expect(legacyApi).toBeDefined();
      expect(queryApi).toBeDefined();
      await runRelationalPage(legacyApi!, "db._query.users.findMany");
      await runRelationalPage(queryApi!, "db.query.users.findMany");
      return;
    }

    expect(queryApi).toBeDefined();
    await runRelationalPage(queryApi!, "db.query.users.findMany");
  });
});
