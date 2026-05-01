import { describe, expect, test } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { generateCursor } from "../../src";

type RelationalFindManyResult = Array<{
  id: number;
  slug: string;
}>;

type RelationalFindManyInput = {
  columns: Record<string, true>;
  orderBy: unknown;
  where: unknown;
  limit: number;
};

type RelationalUsersApi = {
  findMany: (input: RelationalFindManyInput) => Promise<RelationalFindManyResult>;
};

const getRelationalApi = (
  db: { [key: string]: unknown },
  path: "_query" | "query",
): RelationalUsersApi | undefined => {
  const root = Reflect.get(db, path);
  if (typeof root !== "object" || root === null) {
    return undefined;
  }

  if (!("users" in root)) {
    return undefined;
  }

  const users = Reflect.get(root as Record<string, unknown>, "users");
  if (typeof users !== "object" || users === null || !("findMany" in users)) {
    return undefined;
  }

  const findMany = Reflect.get(users as Record<string, unknown>, "findMany");
  if (typeof findMany !== "function") {
    return undefined;
  }

  return { findMany } as RelationalUsersApi;
};

const runRelationalPage = async (relationalApi: RelationalUsersApi, label: string) => {
  const cursor = generateCursor({
    primaryCursor: { key: "id", schema: users.id, order: "ASC" },
    cursors: [{ key: "slug", schema: users.slug, order: "ASC" }],
  });

  const firstPage = await relationalApi.findMany({
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
  return { firstPage, secondPage, label };
};

const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
});

const schema = { users };

describe("relational query compatibility", () => {
  test("supports query-builder path across drizzle versions", async () => {
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

  test("supports db._query.users.findMany when available", async () => {
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

    const usersQuery = getRelationalApi(db as Record<string, unknown>, "_query");
    if (!usersQuery?.findMany) {
      expect(usersQuery).toBeUndefined();
      return;
    }
    await runRelationalPage(usersQuery, "db._query");
  });

  test("supports db.query.users.findMany when available", async () => {
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

    const usersQuery = getRelationalApi(db as Record<string, unknown>, "query");
    if (!usersQuery?.findMany) {
      expect(usersQuery).toBeUndefined();
      return;
    }

    await runRelationalPage(usersQuery, "db.query");
  });
});
