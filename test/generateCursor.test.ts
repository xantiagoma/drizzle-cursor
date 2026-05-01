import { type Cursor, generateCursor } from "../src";
import { and, asc, desc, eq, gt, lt, or, sql } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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

  describe("relational compatibility helper", () => {
    const slugCursorDefault: Cursor = {
      key: "firstName",
      schema: table.firstName,
      order: "ASC",
    };
    const slugCursorDESC: Cursor = {
      key: "id",
      schema: table.id,
      order: "DESC",
    };
    const nameCursorASC: Cursor = {
      key: "middleName",
      schema: table.middleName,
      order: "ASC",
    };
    const nameCursorDESC: Cursor = {
      key: "lastName",
      schema: table.lastName,
      order: "DESC",
    };

    test("exposes orderBy as object", () => {
      const cursor = generateCursor({
        primaryCursor: primaryCursorDefault,
        cursors: [slugCursorDefault, nameCursorASC],
      });
      expect(cursor.relations.orderBy).toEqual({
        firstName: "asc",
        middleName: "asc",
        id: "asc",
      });
    });

    test("returns undefined when no previous data", () => {
      const cursor = generateCursor({
        primaryCursor: primaryCursorASC,
        cursors: [slugCursorDefault],
      });
      expect(cursor.relations.where()).toBeUndefined();
      expect(cursor.relations.where(null)).toBeUndefined();
      expect(cursor.relations.where("")).toBeUndefined();
    });

    test("builds RQB v2 matrix for previous object", () => {
      const cursor = generateCursor({
        primaryCursor: primaryCursorDefault,
        cursors: [slugCursorDefault],
      });
      expect(cursor.relations.where({ id: 5, firstName: "slug-05" })).toEqual({
        OR: [
          { firstName: { gt: "slug-05" } },
          {
            firstName: { eq: "slug-05" },
            id: { gt: 5 },
          },
        ],
      });
    });

    test("parses token and returns same rqb v2 shape", () => {
      const cursor = generateCursor({
        primaryCursor: primaryCursorASC,
        cursors: [slugCursorDefault],
      });
      const token = cursor.serialize({
        id: 4,
        firstName: "slug-04",
        middleName: "middleName-04",
        lastName: "lastName-04",
        phone: "123",
        email: "a@b.com",
      });
      expect(token).toBeTypeOf("string");

      const expected = cursor.relations.where({
        id: 4,
        firstName: "slug-04",
      });
      expect(cursor.relations.where(token)).toEqual(expected);
    });

    test("uses lt for desc cursor fields", () => {
      const cursor = generateCursor({
        primaryCursor: slugCursorDESC,
        cursors: [nameCursorDESC],
      });
      expect(
        cursor.relations.where({
          id: 7,
          lastName: "zeta",
          middleName: "middleName-04",
          firstName: "John",
          phone: "123",
          email: "a@b.com",
        }),
      ).toEqual({
        OR: [
          { lastName: { lt: "zeta" } },
          {
            lastName: { eq: "zeta" },
            id: { lt: 7 },
          },
        ],
      });
    });

    test("builds matrix for multiple cursors", () => {
      const cursor = generateCursor({
        primaryCursor: primaryCursorDESC,
        cursors: [slugCursorDefault, nameCursorDESC],
      });
      expect(
        cursor.relations.where({
          id: 2,
          firstName: "john",
          middleName: "adam",
          lastName: "zoe",
          phone: "123",
          email: "a@b.com",
        }),
      ).toEqual({
        OR: [
          { firstName: { gt: "john" } },
          {
            firstName: { eq: "john" },
            lastName: { lt: "zoe" },
          },
          {
            firstName: { eq: "john" },
            lastName: { eq: "zoe" },
            id: { lt: 2 },
          },
        ],
      });
    });
  });

});

// ---------------------------------------------------------------------------
// SQL expression cursors
// ---------------------------------------------------------------------------

describe("generateCursor with SQL expression cursors", () => {
  const fullNameSql = sql`${table.firstName} || ' ' || ${table.lastName}`;
  const upperLastNameSql = sql`upper(${table.lastName})`;
  const lengthSql = sql`length(${table.firstName})`;

  const previousData = {
    id: 1,
    firstName: "John",
    middleName: "Doe",
    lastName: "Smith",
    phone: "123456789",
    email: "johndoe",
    fullName: "John Smith",
    upperLastName: "SMITH",
    firstNameLength: 4,
  };

  describe("SQL-only primaryCursor", () => {
    test("default order: orderBy asc, where undefined with no data", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", sql: sql`${table.id}` },
      });
      expect(cursor.orderBy).toEqual([asc(sql`${table.id}`)]);
      expect(cursor.where()).toBeUndefined();
    });

    test("ASC: where uses gt", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", sql: sql`${table.id}`, order: "ASC" },
      });
      expect(cursor.orderBy).toEqual([asc(sql`${table.id}`)]);
      expect(cursor.where(previousData)).toEqual(
        or(and(gt(sql`${table.id}`, previousData.id)))
      );
    });

    test("DESC: where uses lt", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", sql: sql`${table.id}`, order: "DESC" },
      });
      expect(cursor.orderBy).toEqual([desc(sql`${table.id}`)]);
      expect(cursor.where(previousData)).toEqual(
        or(and(lt(sql`${table.id}`, previousData.id)))
      );
    });
  });

  describe("SQL expression as secondary cursor", () => {
    test("fullName ASC + schema primaryCursor", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", schema: table.id },
        cursors: [{ key: "fullName", sql: fullNameSql, order: "ASC" }],
      });
      expect(cursor.orderBy).toEqual([asc(fullNameSql), asc(table.id)]);
      expect(cursor.where()).toBeUndefined();
      expect(cursor.where(previousData)).toEqual(
        or(
          and(gt(fullNameSql, previousData.fullName)),
          and(eq(fullNameSql, previousData.fullName), gt(table.id, previousData.id))
        )
      );
    });

    test("fullName DESC + schema primaryCursor", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", schema: table.id },
        cursors: [{ key: "fullName", sql: fullNameSql, order: "DESC" }],
      });
      expect(cursor.orderBy).toEqual([desc(fullNameSql), asc(table.id)]);
      expect(cursor.where(previousData)).toEqual(
        or(
          and(lt(fullNameSql, previousData.fullName)),
          and(eq(fullNameSql, previousData.fullName), gt(table.id, previousData.id))
        )
      );
    });

    test("upperLastName DESC + schema primaryCursor", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", schema: table.id },
        cursors: [{ key: "upperLastName", sql: upperLastNameSql, order: "DESC" }],
      });
      expect(cursor.orderBy).toEqual([desc(upperLastNameSql), asc(table.id)]);
      expect(cursor.where(previousData)).toEqual(
        or(
          and(lt(upperLastNameSql, previousData.upperLastName)),
          and(eq(upperLastNameSql, previousData.upperLastName), gt(table.id, previousData.id))
        )
      );
    });
  });

  describe("mixed SQL and schema cursors", () => {
    test("SQL length cursor first, then schema cursor, then schema primaryCursor", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", schema: table.id },
        cursors: [
          { key: "firstNameLength", sql: lengthSql, order: "ASC" },
          { key: "lastName", schema: table.lastName, order: "ASC" },
        ],
      });
      expect(cursor.orderBy).toEqual([asc(lengthSql), asc(table.lastName), asc(table.id)]);
      expect(cursor.where(previousData)).toEqual(
        or(
          and(gt(lengthSql, previousData.firstNameLength)),
          and(eq(lengthSql, previousData.firstNameLength), gt(table.lastName, previousData.lastName)),
          and(
            eq(lengthSql, previousData.firstNameLength),
            eq(table.lastName, previousData.lastName),
            gt(table.id, previousData.id)
          )
        )
      );
    });

    test("schema cursor first, then SQL length cursor, then schema primaryCursor", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", schema: table.id },
        cursors: [
          { key: "lastName", schema: table.lastName, order: "ASC" },
          { key: "firstNameLength", sql: lengthSql, order: "ASC" },
        ],
      });
      expect(cursor.orderBy).toEqual([asc(table.lastName), asc(lengthSql), asc(table.id)]);
      expect(cursor.where(previousData)).toEqual(
        or(
          and(gt(table.lastName, previousData.lastName)),
          and(eq(table.lastName, previousData.lastName), gt(lengthSql, previousData.firstNameLength)),
          and(
            eq(table.lastName, previousData.lastName),
            eq(lengthSql, previousData.firstNameLength),
            gt(table.id, previousData.id)
          )
        )
      );
    });
  });

  describe("multiple SQL cursors with SQL primaryCursor", () => {
    test("complex multi-SQL cursor chain", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", sql: sql`${table.id}`, order: "DESC" },
        cursors: [
          { key: "fullName", sql: fullNameSql, order: "ASC" },
          { key: "upperLastName", sql: upperLastNameSql, order: "DESC" },
          { key: "firstNameLength", sql: lengthSql, order: "ASC" },
        ],
      });

      expect(cursor.orderBy).toEqual([
        asc(fullNameSql),
        desc(upperLastNameSql),
        asc(lengthSql),
        desc(sql`${table.id}`),
      ]);

      expect(cursor.where(previousData)).toEqual(
        or(
          and(gt(fullNameSql, previousData.fullName)),
          and(eq(fullNameSql, previousData.fullName), lt(upperLastNameSql, previousData.upperLastName)),
          and(
            eq(fullNameSql, previousData.fullName),
            eq(upperLastNameSql, previousData.upperLastName),
            gt(lengthSql, previousData.firstNameLength)
          ),
          and(
            eq(fullNameSql, previousData.fullName),
            eq(upperLastNameSql, previousData.upperLastName),
            eq(lengthSql, previousData.firstNameLength),
            lt(sql`${table.id}`, previousData.id)
          )
        )
      );
    });
  });

  describe("token round-trip with SQL cursors", () => {
    test("serialize and parse work via key-based extraction", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", schema: table.id },
        cursors: [{ key: "fullName", sql: fullNameSql, order: "ASC" }],
      });

      const row = { id: 42, fullName: "Jane Doe" };
      const token = cursor.serialize(row);
      expect(token).toBeTypeOf("string");

      const parsed = cursor.parse(token);
      expect(parsed).toEqual({ id: 42, fullName: "Jane Doe" });
    });

    test("where() accepts token for SQL cursor", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", schema: table.id },
        cursors: [{ key: "fullName", sql: fullNameSql, order: "ASC" }],
      });

      const row = { id: 5, fullName: "Alice Smith" };
      const token = cursor.serialize(row);

      const fromObject = cursor.where(row);
      const fromToken = cursor.where(token);
      expect(fromToken).toEqual(fromObject);
    });
  });

  describe("relations.where() with SQL cursors uses RAW", () => {
    test("no previous data returns undefined", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", schema: table.id },
        cursors: [{ key: "fullName", sql: fullNameSql }],
      });
      expect(cursor.relations.where()).toBeUndefined();
      expect(cursor.relations.where(null)).toBeUndefined();
    });

    test("SQL-only primaryCursor: single RAW entry per OR clause", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", sql: sql`${table.id}`, order: "ASC" },
      });
      const result = cursor.relations.where({ id: 5 });
      expect(result?.OR).toHaveLength(1);
      expect(result?.OR.map((c) => c.RAW?.(undefined))).toEqual([
        gt(sql`${table.id}`, 5),
      ]);
    });

    test("SQL secondary cursor + schema primaryCursor: mixed RAW and field conditions", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", schema: table.id },
        cursors: [{ key: "fullName", sql: fullNameSql, order: "ASC" }],
      });
      const result = cursor.relations.where({ id: 1, fullName: "John Smith" });
      expect(result?.OR).toHaveLength(2);
      expect(result?.OR.map((c) => c.RAW?.(undefined))).toEqual([
        gt(fullNameSql, "John Smith"),
        eq(fullNameSql, "John Smith"),
      ]);
      expect(result?.OR.map(({ RAW: _, ...rest }) => rest)).toEqual([
        {},
        { id: { gt: 1 } },
      ]);
    });

    test("SQL secondary cursor DESC: RAW uses lt for inequality", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", schema: table.id },
        cursors: [{ key: "upperLastName", sql: upperLastNameSql, order: "DESC" }],
      });
      const result = cursor.relations.where({ id: 1, upperLastName: "SMITH" });
      expect(result?.OR).toHaveLength(2);
      expect(result?.OR.map((c) => c.RAW?.(undefined))).toEqual([
        lt(upperLastNameSql, "SMITH"),
        eq(upperLastNameSql, "SMITH"),
      ]);
      expect(result?.OR.map(({ RAW: _, ...rest }) => rest)).toEqual([
        {},
        { id: { gt: 1 } },
      ]);
    });

    test("multiple SQL cursors in one AND clause are combined via and()", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", sql: sql`${table.id}`, order: "ASC" },
        cursors: [
          { key: "fullName", sql: fullNameSql, order: "ASC" },
          { key: "upperLastName", sql: upperLastNameSql, order: "DESC" },
        ],
      });
      const result = cursor.relations.where({
        id: 1,
        fullName: "John Smith",
        upperLastName: "SMITH",
      });
      expect(result?.OR).toHaveLength(3);
      expect(result?.OR.map((c) => c.RAW?.(undefined))).toEqual([
        gt(fullNameSql, "John Smith"),
        and(eq(fullNameSql, "John Smith"), lt(upperLastNameSql, "SMITH")),
        and(eq(fullNameSql, "John Smith"), eq(upperLastNameSql, "SMITH"), gt(sql`${table.id}`, 1)),
      ]);
    });

    test("mixed SQL and schema cursors: RAW for sql, plain fields for schema", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", schema: table.id },
        cursors: [
          { key: "lastName", schema: table.lastName, order: "ASC" },
          { key: "firstNameLength", sql: lengthSql, order: "ASC" },
        ],
      });
      const result = cursor.relations.where({
        id: 1,
        lastName: "Smith",
        firstNameLength: 4,
      });
      expect(result?.OR).toHaveLength(3);
      expect(result?.OR.map((c) => c.RAW?.(undefined))).toEqual([
        undefined,           // clause 0: schema only, no RAW
        gt(lengthSql, 4),    // clause 1: SQL length gt
        eq(lengthSql, 4),    // clause 2: SQL length eq
      ]);
      expect(result?.OR.map(({ RAW: _, ...rest }) => rest)).toEqual([
        { lastName: { gt: "Smith" } },
        { lastName: { eq: "Smith" } },
        { lastName: { eq: "Smith" }, id: { gt: 1 } },
      ]);
    });

    test("token round-trip works for relations.where with SQL cursor", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", schema: table.id },
        cursors: [{ key: "fullName", sql: fullNameSql, order: "ASC" }],
      });
      const token = cursor.serialize({ id: 7, fullName: "Bob Jones" });
      const fromObject = cursor.relations.where({ id: 7, fullName: "Bob Jones" });
      const fromToken = cursor.relations.where(token);
      // Functions can't be deep-equal; compare RAW outputs and schema fields separately
      expect(fromToken?.OR.map((c) => c.RAW?.(undefined))).toEqual(
        fromObject?.OR.map((c) => c.RAW?.(undefined)),
      );
      expect(fromToken?.OR.map(({ RAW: _, ...rest }) => rest)).toEqual(
        fromObject?.OR.map(({ RAW: _, ...rest }) => rest),
      );
    });

    test("relations.orderBy is a SQL callback for SQL cursors", () => {
      const cursor = generateCursor({
        primaryCursor: { key: "id", schema: table.id },
        cursors: [{ key: "fullName", sql: fullNameSql, order: "ASC" }],
      });
      expect(cursor.relations.orderBy).toBeInstanceOf(Function);
      expect(cursor.relations.orderBy()).toEqual([asc(fullNameSql), asc(table.id)]);
    });
  });
});
