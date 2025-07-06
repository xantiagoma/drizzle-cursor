import { type Cursor, generateCursor } from "../src";
import { and, asc, desc, eq, gt, lt, or } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const table = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name"),
  middleName: text("middle_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  email: text("email"),
});

describe("generateCursor", () => {
  const primaryCursorDefault: Cursor = { key: "id", schema: table.id };
  const primaryCursorASC: Cursor = {
    key: "id",
    order: "ASC",
    schema: table.id,
  };
  const primaryCursorDESC: Cursor = {
    key: "id",
    order: "DESC",
    schema: table.id,
  };

  describe("with only primaryCursor", () => {
    describe("without previous data generates only orderBy and where is undefined", () => {
      test("with primaryCursorDefault", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
        });
        expect(cursor.orderBy).toEqual([asc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorASC", () => {
        const cursor = generateCursor({ primaryCursor: primaryCursorASC });
        expect(cursor.orderBy).toEqual([asc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDESC", () => {
        const cursor = generateCursor({ primaryCursor: primaryCursorDESC });
        expect(cursor.orderBy).toEqual([desc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });
    });
    describe("with previous data generates orderBy and where", () => {
      const previousData = {
        id: 1,
        firstName: "John",
        middleName: "Doe",
        lastName: "Smith",
        phone: "123456789",
        email: "johndoe",
      };

      test("with primaryCursorDefault", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
        });
        expect(cursor.orderBy).toEqual([asc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          and(or(gt(table.id, previousData.id)))
        );
      });

      test("with primaryCursorASC", () => {
        const cursor = generateCursor({ primaryCursor: primaryCursorASC });
        expect(cursor.orderBy).toEqual([asc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          and(or(gt(table.id, previousData.id)))
        );
      });

      test("with primaryCursorDESC", () => {
        const cursor = generateCursor({ primaryCursor: primaryCursorDESC });
        expect(cursor.orderBy).toEqual([desc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          and(or(lt(table.id, previousData.id)))
        );
      });
    });
  });

  describe("with one cursor", () => {
    const cursorDefault: Cursor = {
      key: "lastName",
      schema: table.lastName,
    };

    const cursorASC: Cursor = {
      key: "lastName",
      order: "ASC",
      schema: table.lastName,
    };

    const cursorDESC: Cursor = {
      key: "lastName",
      order: "DESC",
      schema: table.lastName,
    };

    describe("without previous data generates only orderBy and where is undefined", () => {
      test("with primaryCursorDefault and cursorDefault", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDefault],
        });
        expect(cursor.orderBy).toEqual([asc(table.lastName), asc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDefault and cursorASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorASC],
        });
        expect(cursor.orderBy).toEqual([asc(table.lastName), asc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDefault and cursorDESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDESC],
        });
        expect(cursor.orderBy).toEqual([desc(table.lastName), asc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorASC and cursorDefault", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDefault],
        });
        expect(cursor.orderBy).toEqual([asc(table.lastName), asc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorASC and cursorASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorASC],
        });
        expect(cursor.orderBy).toEqual([asc(table.lastName), asc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorASC and cursorDESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDESC],
        });
        expect(cursor.orderBy).toEqual([desc(table.lastName), asc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDESC and cursorDefault", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDefault],
        });
        expect(cursor.orderBy).toEqual([asc(table.lastName), desc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDESC and cursorASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorASC],
        });
        expect(cursor.orderBy).toEqual([asc(table.lastName), desc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDESC and cursorDESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDESC],
        });
        expect(cursor.orderBy).toEqual([desc(table.lastName), desc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });
    });

    describe("with previous data generates orderBy and where", () => {
      const previousData = {
        id: 1,
        firstName: "John",
        middleName: "Doe",
        lastName: "Smith",
        phone: "123456789",
        email: "johndoe",
      };

      test("with primaryCursorDefault and cursorDefault", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDefault],
        });
        expect(cursor.orderBy).toEqual([asc(table.lastName), asc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDefault and cursorASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorASC],
        });
        expect(cursor.orderBy).toEqual([asc(table.lastName), asc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDefault and cursorDESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDESC],
        });
        expect(cursor.orderBy).toEqual([desc(table.lastName), asc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(lt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorASC and cursorDefault", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDefault],
        });
        expect(cursor.orderBy).toEqual([asc(table.lastName), asc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorASC and cursorASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorASC],
        });
        expect(cursor.orderBy).toEqual([asc(table.lastName), asc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorASC and cursorDESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDESC],
        });
        expect(cursor.orderBy).toEqual([desc(table.lastName), asc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(lt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDESC and cursorDefault", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDefault],
        });
        expect(cursor.orderBy).toEqual([asc(table.lastName), desc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              lt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDESC and cursorASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorASC],
        });
        expect(cursor.orderBy).toEqual([asc(table.lastName), desc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              lt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDESC and cursorDESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDESC],
        });
        expect(cursor.orderBy).toEqual([desc(table.lastName), desc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(lt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              lt(table.id, previousData.id)
            )
          )
        );
      });
    });
  });

  describe("with two cursors", () => {
    const cursorDefault: Cursor = {
      key: "lastName",
      schema: table.lastName,
    };

    const cursorASC: Cursor = {
      key: "lastName",
      order: "ASC",
      schema: table.lastName,
    };

    const cursorDESC: Cursor = {
      key: "lastName",
      order: "DESC",
      schema: table.lastName,
    };

    const cursor2Default: Cursor = {
      key: "firstName",
      schema: table.firstName,
    };

    const cursor2ASC: Cursor = {
      key: "firstName",
      order: "ASC",
      schema: table.firstName,
    };

    const cursor2DESC: Cursor = {
      key: "firstName",
      order: "DESC",
      schema: table.firstName,
    };

    describe("without previous data generates only orderBy and where is undefined", () => {
      test("with primaryCursorDefault and cursorDefault and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDefault, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDefault and cursorDefault and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDefault, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDefault and cursorDefault and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDefault, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          desc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDefault and cursorASC and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorASC, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDefault and cursorASC and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorASC, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDefault and cursorASC and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorASC, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          desc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDefault and cursorDESC and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDESC, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDefault and cursorDESC and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDESC, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDefault and cursorDESC and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDESC, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          desc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorASC and cursorDefault and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDefault, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorASC and cursorDefault and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDefault, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorASC and cursorDefault and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDefault, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          desc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorASC and cursorASC and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorASC, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorASC and cursorASC and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorASC, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorASC and cursorASC and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorASC, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          desc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorASC and cursorDESC and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDESC, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorASC and cursorDESC and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDESC, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorASC and cursorDESC and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDESC, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          desc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDESC and cursorDefault and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDefault, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDESC and cursorDefault and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDefault, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDESC and cursorDefault and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDefault, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          desc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDESC and cursorASC and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorASC, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDESC and cursorASC and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorASC, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDESC and cursorASC and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorASC, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          desc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDESC and cursorDESC and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDESC, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          asc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDESC and cursorDESC and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDESC, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          asc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorDESC and cursorDESC and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDESC, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          desc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });
    });

    describe("with previous data generates orderBy and where", () => {
      const previousData = {
        id: 1,
        firstName: "John",
        middleName: "Doe",
        lastName: "Smith",
        phone: "123456789",
        email: "johndoe",
      };

      test("with primaryCursorDefault and cursorDefault and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDefault, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDefault and cursorDefault and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDefault, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDefault and cursorDefault and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDefault, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          desc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              lt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDefault and cursorASC and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorASC, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDefault and cursorASC and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorASC, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDefault and cursorASC and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorASC, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          desc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              lt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDefault and cursorDESC and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDESC, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(lt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDefault and cursorDESC and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDESC, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(lt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDefault and cursorDESC and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [cursorDESC, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          desc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(lt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              lt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorASC and cursorDefault and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDefault, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorASC and cursorDefault and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDefault, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorASC and cursorDefault and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDefault, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          desc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              lt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorASC and cursorASC and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorASC, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorASC and cursorASC and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorASC, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorASC and cursorASC and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorASC, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          desc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              lt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorASC and cursorDESC and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDESC, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(lt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorASC and cursorDESC and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDESC, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          asc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(lt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorASC and cursorDESC and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorASC,
          cursors: [cursorDESC, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          desc(table.firstName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(lt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              lt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDESC and cursorDefault and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDefault, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              lt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDESC and cursorDefault and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDefault, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              lt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDESC and cursorDefault and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDefault, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          desc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              lt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              lt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDESC and cursorASC and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorASC, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              lt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDESC and cursorASC and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorASC, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              lt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDESC and cursorASC and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorASC, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          desc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              lt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              lt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDESC and cursorDESC and cursor2Default", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDESC, cursor2Default],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          asc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(lt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              lt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDESC and cursorDESC and cursor2ASC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDESC, cursor2ASC],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          asc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(lt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              lt(table.id, previousData.id)
            )
          )
        );
      });

      test("with primaryCursorDESC and cursorDESC and cursor2DESC", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDESC,
          cursors: [cursorDESC, cursor2DESC],
        });
        expect(cursor.orderBy).toEqual([
          desc(table.lastName),
          desc(table.firstName),
          desc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(lt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              lt(table.firstName, previousData.firstName)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(table.firstName, previousData.firstName),
              lt(table.id, previousData.id)
            )
          )
        );
      });
    });
  });

  describe("with multiple cursors", () => {
    test("with three cursors and no previous data", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", schema: table.id, order: "DESC" },
        cursors: [
          { key: "firstName", schema: table.firstName },
          { key: "lastName", schema: table.lastName, order: "DESC" },
          { key: "middleName", schema: table.middleName },
        ],
      });
      expect(cursor.orderBy).toEqual([
        asc(table.firstName),
        desc(table.lastName),
        asc(table.middleName),
        desc(table.id),
      ]);
      expect(cursor.where()).toBeUndefined();
    });

    test("with three cursors and previous data", () => {
      const item = {
        id: 1,
        firstName: "John",
        middleName: "Doe",
        lastName: "Smith",
        phone: "123456789",
        email: "johndoe",
      };

      const cursor = generateCursor({
        cursors: [
          { key: "firstName", schema: table.firstName, order: "DESC" },
          { key: "lastName", schema: table.lastName },
          { key: "middleName", schema: table.middleName, order: "DESC" },
        ],
        primaryCursor: { key: "id", schema: table.id, order: "ASC" },
      });

      expect(cursor.orderBy).toEqual([
        desc(table.firstName),
        asc(table.lastName),
        desc(table.middleName),
        asc(table.id),
      ]);
      expect(cursor.where(item)).toEqual(
        or(
          and(lt(table.firstName, item.firstName)),
          and(
            eq(table.firstName, item.firstName),
            gt(table.lastName, item.lastName)
          ),
          and(
            eq(table.firstName, item.firstName),
            eq(table.lastName, item.lastName),
            lt(table.middleName, item.middleName)
          ),
          and(
            eq(table.firstName, item.firstName),
            eq(table.lastName, item.lastName),
            eq(table.middleName, item.middleName),
            gt(table.id, item.id)
          )
        )
      );
    });
  });
});

describe("generateCursor with SQL cursors", () => {
  // 定义一些 SQL 表达式用于测试
  const fullNameSql = sql`${table.firstName} || ' ' || ${table.lastName}`;
  const upperLastNameSql = sql`upper(${table.lastName})`;
  const lengthSql = sql`length(${table.firstName})`;

  const primaryCursorDefault: Cursor = { key: "id", schema: table.id };
  const primaryCursorSql: Cursor = { key: "id", sql: sql`${table.id}` };
  const primaryCursorSqlASC: Cursor = { key: "id", sql: sql`${table.id}`, order: "ASC" };
  const primaryCursorSqlDESC: Cursor = { key: "id", sql: sql`${table.id}`, order: "DESC" };

  describe("with only SQL primaryCursor", () => {
    describe("without previous data generates only orderBy and where is undefined", () => {
      test("with primaryCursorSql default order", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorSql,
        });
        expect(cursor.orderBy).toEqual([asc(sql`${table.id}`)]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorSql ASC order", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorSqlASC,
        });
        expect(cursor.orderBy).toEqual([asc(sql`${table.id}`)]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with primaryCursorSql DESC order", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorSqlDESC,
        });
        expect(cursor.orderBy).toEqual([desc(sql`${table.id}`)]);
        expect(cursor.where()).toBeUndefined();
      });
    });

    describe("with previous data generates orderBy and where", () => {
      const previousData = {
        id: 1,
        firstName: "John",
        middleName: "Doe",
        lastName: "Smith",
        phone: "123456789",
        email: "johndoe",
      };

      test("with primaryCursorSql default order", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorSql,
        });
        expect(cursor.orderBy).toEqual([asc(sql`${table.id}`)]);
        expect(cursor.where(previousData)).toEqual(
          and(or(gt(sql`${table.id}`, previousData.id)))
        );
      });

      test("with primaryCursorSql ASC order", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorSqlASC,
        });
        expect(cursor.orderBy).toEqual([asc(sql`${table.id}`)]);
        expect(cursor.where(previousData)).toEqual(
          and(or(gt(sql`${table.id}`, previousData.id)))
        );
      });

      test("with primaryCursorSql DESC order", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorSqlDESC,
        });
        expect(cursor.orderBy).toEqual([desc(sql`${table.id}`)]);
        expect(cursor.where(previousData)).toEqual(
          and(or(lt(sql`${table.id}`, previousData.id)))
        );
      });
    });
  });

  describe("with SQL expression cursors", () => {
    const fullNameCursor: Cursor = {
      key: "fullName",
      sql: fullNameSql,
    };

    const fullNameCursorASC: Cursor = {
      key: "fullName",
      sql: fullNameSql,
      order: "ASC",
    };

    const fullNameCursorDESC: Cursor = {
      key: "fullName",
      sql: fullNameSql,
      order: "DESC",
    };

    describe("without previous data generates only orderBy and where is undefined", () => {
      test("with fullNameCursor default order", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [fullNameCursor],
        });
        expect(cursor.orderBy).toEqual([asc(fullNameSql), asc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with fullNameCursor ASC order", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [fullNameCursorASC],
        });
        expect(cursor.orderBy).toEqual([asc(fullNameSql), asc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with fullNameCursor DESC order", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [fullNameCursorDESC],
        });
        expect(cursor.orderBy).toEqual([desc(fullNameSql), asc(table.id)]);
        expect(cursor.where()).toBeUndefined();
      });
    });

    describe("with previous data generates orderBy and where", () => {
      const previousData = {
        id: 1,
        firstName: "John",
        middleName: "Doe",
        lastName: "Smith",
        phone: "123456789",
        email: "johndoe",
        fullName: "John Smith",
      };

      test("with fullNameCursor default order", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [fullNameCursor],
        });
        expect(cursor.orderBy).toEqual([asc(fullNameSql), asc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(fullNameSql, previousData.fullName)),
            and(
              eq(fullNameSql, previousData.fullName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with fullNameCursor ASC order", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [fullNameCursorASC],
        });
        expect(cursor.orderBy).toEqual([asc(fullNameSql), asc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(fullNameSql, previousData.fullName)),
            and(
              eq(fullNameSql, previousData.fullName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with fullNameCursor DESC order", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [fullNameCursorDESC],
        });
        expect(cursor.orderBy).toEqual([desc(fullNameSql), asc(table.id)]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(lt(fullNameSql, previousData.fullName)),
            and(
              eq(fullNameSql, previousData.fullName),
              gt(table.id, previousData.id)
            )
          )
        );
      });
    });
  });

  describe("with mixed SQL and schema cursors", () => {
    const lengthCursor: Cursor = {
      key: "firstNameLength",
      sql: lengthSql,
    };

    const schemaCursor: Cursor = {
      key: "lastName",
      schema: table.lastName,
    };

    describe("without previous data generates only orderBy and where is undefined", () => {
      test("with lengthCursor and schemaCursor", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [lengthCursor, schemaCursor],
        });
        expect(cursor.orderBy).toEqual([
          asc(lengthSql),
          asc(table.lastName),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });

      test("with schemaCursor and lengthCursor", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [schemaCursor, lengthCursor],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(lengthSql),
          asc(table.id),
        ]);
        expect(cursor.where()).toBeUndefined();
      });
    });

    describe("with previous data generates orderBy and where", () => {
      const previousData = {
        id: 1,
        firstName: "John",
        middleName: "Doe",
        lastName: "Smith",
        phone: "123456789",
        email: "johndoe",
        firstNameLength: 4,
      };

      test("with lengthCursor and schemaCursor", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [lengthCursor, schemaCursor],
        });
        expect(cursor.orderBy).toEqual([
          asc(lengthSql),
          asc(table.lastName),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(lengthSql, previousData.firstNameLength)),
            and(
              eq(lengthSql, previousData.firstNameLength),
              gt(table.lastName, previousData.lastName)
            ),
            and(
              eq(lengthSql, previousData.firstNameLength),
              eq(table.lastName, previousData.lastName),
              gt(table.id, previousData.id)
            )
          )
        );
      });

      test("with schemaCursor and lengthCursor", () => {
        const cursor = generateCursor({
          primaryCursor: primaryCursorDefault,
          cursors: [schemaCursor, lengthCursor],
        });
        expect(cursor.orderBy).toEqual([
          asc(table.lastName),
          asc(lengthSql),
          asc(table.id),
        ]);
        expect(cursor.where(previousData)).toEqual(
          or(
            and(gt(table.lastName, previousData.lastName)),
            and(
              eq(table.lastName, previousData.lastName),
              gt(lengthSql, previousData.firstNameLength)
            ),
            and(
              eq(table.lastName, previousData.lastName),
              eq(lengthSql, previousData.firstNameLength),
              gt(table.id, previousData.id)
            )
          )
        );
      });
    });
  });

  describe("with complex SQL expressions", () => {
    const upperLastNameCursor: Cursor = {
      key: "upperLastName",
      sql: upperLastNameSql,
      order: "DESC",
    };

    const previousData = {
      id: 1,
      firstName: "John",
      middleName: "Doe",
      lastName: "Smith",
      phone: "123456789",
      email: "johndoe",
      upperLastName: "SMITH",
    };

    test("with upperLastNameCursor DESC order", () => {
      const cursor = generateCursor({
        primaryCursor: primaryCursorDefault,
        cursors: [upperLastNameCursor],
      });
      expect(cursor.orderBy).toEqual([desc(upperLastNameSql), asc(table.id)]);
      expect(cursor.where(previousData)).toEqual(
        or(
          and(lt(upperLastNameSql, previousData.upperLastName)),
          and(
            eq(upperLastNameSql, previousData.upperLastName),
            gt(table.id, previousData.id)
          )
        )
      );
    });

    test("with multiple complex SQL cursors", () => {
      const cursor = generateCursor({
        primaryCursor: primaryCursorSqlDESC,
        cursors: [
          {
            key: "fullName",
            sql: fullNameSql,
            order: "ASC",
          },
          {
            key: "upperLastName",
            sql: upperLastNameSql,
            order: "DESC",
          },
          {
            key: "firstNameLength",
            sql: lengthSql,
            order: "ASC",
          },
        ],
      });
      
      expect(cursor.orderBy).toEqual([
        asc(fullNameSql),
        desc(upperLastNameSql),
        asc(lengthSql),
        desc(sql`${table.id}`),
      ]);
      
      const complexPreviousData = {
        ...previousData,
        fullName: "John Smith",
        firstNameLength: 4,
      };
      
      expect(cursor.where(complexPreviousData)).toEqual(
        or(
          and(gt(fullNameSql, complexPreviousData.fullName)),
          and(
            eq(fullNameSql, complexPreviousData.fullName),
            lt(upperLastNameSql, complexPreviousData.upperLastName)
          ),
          and(
            eq(fullNameSql, complexPreviousData.fullName),
            eq(upperLastNameSql, complexPreviousData.upperLastName),
            gt(lengthSql, complexPreviousData.firstNameLength)
          ),
          and(
            eq(fullNameSql, complexPreviousData.fullName),
            eq(upperLastNameSql, complexPreviousData.upperLastName),
            eq(lengthSql, complexPreviousData.firstNameLength),
            lt(sql`${table.id}`, complexPreviousData.id)
          )
        )
      );
    });
  });
});
