import { generateCursor } from "../../src";
import { eq, gt, lt } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  slug: text("slug"),
});

describe("relational query compatibility", () => {
  test("checks cursor.relational helper values", () => {
    const cursor = generateCursor({
      primaryCursor: { key: "id", schema: users.id, order: "ASC" },
      cursors: [{ key: "slug", schema: users.slug, order: "ASC" }],
    });

    expect(cursor.relational.orderBy).toEqual({
      slug: "asc",
      id: "asc",
    });
    expect(cursor.relational.where()).toBeUndefined();
    expect(cursor.relational.where(null)).toBeUndefined();
    expect(cursor.relational.where("")).toBeUndefined();
  });

  test("builds relational where from object and token", () => {
    const cursor = generateCursor({
      primaryCursor: { key: "id", schema: users.id, order: "ASC" },
      cursors: [{ key: "slug", schema: users.slug, order: "ASC" }],
    });

    const fromObject = cursor.relational.where({
      id: 10,
      slug: "slug-10",
      name: "should-ignore",
    });
    const token = cursor.serialize({ id: 10, slug: "slug-10", name: "should-ignore" });
    const fromToken = cursor.relational.where(token);

    expect(fromObject).toEqual({
      OR: [{ slug: { gt: "slug-10" } }, { slug: { eq: "slug-10" }, id: { gt: 10 } }],
    });
    expect(fromToken).toEqual(fromObject);
  });

  test("applies desc order in relational helper", () => {
    const cursor = generateCursor({
      primaryCursor: { key: "slug", schema: users.slug, order: "DESC" },
      cursors: [{ key: "id", schema: users.id, order: "ASC" }],
    });

    expect(cursor.relational.orderBy).toEqual({
      slug: "desc",
      id: "asc",
    });
    expect(cursor.relational.where({ id: 3, slug: "slug-03" })).toEqual({
      OR: [{ slug: { lt: "slug-03" } }, { slug: { eq: "slug-03" }, id: { gt: 3 } }],
    });
  });
});
