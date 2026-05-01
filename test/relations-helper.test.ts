import { generateCursor } from "../src";
import { asc, eq, gt, lt, sql } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  slug: text("slug"),
});

describe("relations helper contract", () => {
  test("checks cursor.relations helper values", () => {
    const cursor = generateCursor({
      primaryCursor: { key: "id", schema: users.id, order: "ASC" },
      cursors: [{ key: "slug", schema: users.slug, order: "ASC" }],
    });

    expect(cursor.relations.orderBy).toEqual({
      slug: "asc",
      id: "asc",
    });
    expect(cursor.relations.where()).toBeUndefined();
    expect(cursor.relations.where(null)).toBeUndefined();
    expect(cursor.relations.where("")).toBeUndefined();
  });

  test("builds relations where from object and token", () => {
    const cursor = generateCursor({
      primaryCursor: { key: "id", schema: users.id, order: "ASC" },
      cursors: [{ key: "slug", schema: users.slug, order: "ASC" }],
    });

    const fromObject = cursor.relations.where({
      id: 10,
      slug: "slug-10",
      name: "should-ignore",
    });
    const token = cursor.serialize({
      id: 10,
      slug: "slug-10",
      name: "should-ignore",
    });
    const fromToken = cursor.relations.where(token);

    expect(fromObject).toEqual({
      OR: [
        { slug: { gt: "slug-10" } },
        { id: { gt: 10 }, slug: { eq: "slug-10" } },
      ],
    });
    expect(fromToken).toEqual(fromObject);
  });

  test("SQL expression cursor uses RAW in relations.where and returns SQL callback for orderBy", () => {
    const upperNameSql = sql`upper(${users.name})`;
    const cursor = generateCursor({
      primaryCursor: { key: "id", schema: users.id, order: "ASC" },
      cursors: [{ key: "upperName", sql: upperNameSql, order: "ASC" }],
    });

    // orderBy is now a callback returning SQL[] — usable as RQB v2 orderBy callback
    expect(cursor.relations.orderBy).toBeInstanceOf(Function);
    expect(cursor.relations.orderBy()).toEqual([asc(upperNameSql), asc(users.id)]);

    expect(cursor.relations.where()).toBeUndefined();
    expect(cursor.relations.where(null)).toBeUndefined();

    const result = cursor.relations.where({ id: 1, upperName: "ALICE" });
    expect(result?.OR).toHaveLength(2);
    expect(result?.OR.map((c) => c.RAW?.(undefined))).toEqual([
      gt(upperNameSql, "ALICE"),
      eq(upperNameSql, "ALICE"),
    ]);
    expect(result?.OR.map(({ RAW: _, ...rest }) => rest)).toEqual([
      {},
      { id: { gt: 1 } },
    ]);
  });

  test("applies desc order in relations helper", () => {
    const cursor = generateCursor({
      primaryCursor: { key: "slug", schema: users.slug, order: "DESC" },
      cursors: [{ key: "id", schema: users.id, order: "ASC" }],
    });

    expect(cursor.relations.orderBy).toEqual({
      id: "asc",
      slug: "desc",
    });
    expect(cursor.relations.where({ id: 3, slug: "slug-03" })).toEqual({
      OR: [{ id: { gt: 3 } }, { id: { eq: 3 }, slug: { lt: "slug-03" } }],
    });
  });
});
