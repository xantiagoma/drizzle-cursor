import { describe, expect, test } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { generateCursor } from "../../src";

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

  test("supports relational query api when available", async () => {
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

    const relational: any = (db as any)._query ?? (db as any).query;
    const usersQuery = relational?.users;

    if (!usersQuery?.findMany) {
      expect(usersQuery).toBeUndefined();
      return;
    }

    const relationalPage1 = await usersQuery.findMany({
      columns: {
        id: true,
        slug: true,
      },
      orderBy: cursor.orderBy,
      where: cursor.where(),
      limit: 5,
    });

    expect(relationalPage1).toHaveLength(5);
    expect(relationalPage1[0]?.slug).toBe("slug-01");

    const token = cursor.serialize(relationalPage1.at(-1));

    const relationalPage2 = await usersQuery.findMany({
      columns: {
        id: true,
        slug: true,
      },
      orderBy: cursor.orderBy,
      where: cursor.where(token),
      limit: 5,
    });

    expect(relationalPage2).toHaveLength(5);
    expect(relationalPage2[0]?.slug).toBe("slug-06");
  });
});
