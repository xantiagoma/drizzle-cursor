import { CursorConfig, generateCursor, parse, serialize } from "../src";
import { and, asc, desc, eq, gt, lt, or } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

describe("cursors", () => {
  const table = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    firstName: text("first_name"),
    middleName: text("middle_name"),
    lastName: text("last_name"),
    phone: text("phone"),
    email: text("email"),
    birthday: text("birthday"), // datestring,
  });

  const config: CursorConfig = {
    cursors: [
      { key: "firstName", schema: table.firstName, order: "DESC" },
      { key: "lastName", schema: table.lastName },
      { key: "middleName", schema: table.middleName, order: "DESC" },
      { key: "birthday", schema: table.birthday, order: "DESC" },
    ],
    primaryCursor: { key: "id", schema: table.id, order: "ASC" },
  };

  const data = {
    id: 1,
    firstName: "John",
    middleName: "Doe",
    lastName: "Smith",
    phone: "1234567890",
    email: "john@doe.com",
    birthday: "1990-01-01",
  };

  const cursorToken =
    "eyJpZCI6MSwiZmlyc3ROYW1lIjoiSm9obiIsImxhc3ROYW1lIjoiU21pdGgiLCJtaWRkbGVOYW1lIjoiRG9lIiwiYmlydGhkYXkiOiIxOTkwLTAxLTAxVDAwOjAwOjAwLjAwMFoifQ==";

  describe("serialize", () => {
    test("generates a cursor", () => {
      expect(serialize(config, data)).to.equal(cursorToken);
    });
  });

  describe("parse & serialize", () => {
    test("generates the same cursor", () => {
      expect(serialize(config, parse(config, cursorToken))).to.equal(
        cursorToken
      );
    });
  });
});
