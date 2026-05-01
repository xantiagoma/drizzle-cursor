import { generateCursor } from "../src";
import { eq, gt, lt } from "drizzle-orm";
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
    const token = cursor.serialize({ id: 10, slug: "slug-10", name: "should-ignore" });
    const fromToken = cursor.relations.where(token);

    expect(fromObject).toEqual({
      OR: [{ slug: { gt: "slug-10" } }, { slug: { eq: "slug-10" }, id: { gt: 10 } }],
    });
    expect(fromToken).toEqual(fromObject);
  });

  test("applies desc order in relations helper", () => {
    const cursor = generateCursor({
      primaryCursor: { key: "slug", schema: users.slug, order: "DESC" },
      cursors: [{ key: "id", schema: users.id, order: "ASC" }],
    });

    expect(cursor.relations.orderBy).toEqual({
      slug: "desc",
      id: "asc",
    });
    expect(cursor.relations.where({ id: 3, slug: "slug-03" })).toEqual({
      OR: [{ slug: { lt: "slug-03" } }, { slug: { eq: "slug-03" }, id: { gt: 3 } }],
    });
  });
});
