import { Cursor, generateCursor } from "../src";
import { and, asc, desc, eq, gt, lt, or } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { e } from "vitest/dist/reporters-cb94c88b";

const table = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name"),
  middleName: text("middle_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  email: text("email"),
});

describe("index", () => {
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
          expect(
            generateCursor({ primaryCursor: primaryCursorDefault })
          ).to.deep.equal({
            orderBy: [asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorASC", () => {
          expect(
            generateCursor({ primaryCursor: primaryCursorASC })
          ).to.deep.equal({
            orderBy: [asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorDESC", () => {
          expect(
            generateCursor({ primaryCursor: primaryCursorDESC })
          ).to.deep.equal({
            orderBy: [desc(table.id)],
            where: undefined,
          });
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
          expect(
            generateCursor(
              { primaryCursor: primaryCursorDefault },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.id)],
            where: and(or(gt(table.id, previousData.id))),
          });
        });

        test("with primaryCursorASC", () => {
          expect(
            generateCursor({ primaryCursor: primaryCursorASC }, previousData)
          ).to.deep.equal({
            orderBy: [asc(table.id)],
            where: and(or(gt(table.id, previousData.id))),
          });
        });

        test("with primaryCursorDESC", () => {
          expect(
            generateCursor({ primaryCursor: primaryCursorDESC }, previousData)
          ).to.deep.equal({
            orderBy: [desc(table.id)],
            where: and(or(lt(table.id, previousData.id))),
          });
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
          expect(
            generateCursor({
              primaryCursor: primaryCursorDefault,
              cursors: [cursorDefault],
            })
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorDefault and cursorASC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDefault,
              cursors: [cursorASC],
            })
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorDefault and cursorDESC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDefault,
              cursors: [cursorDESC],
            })
          ).to.deep.equal({
            orderBy: [desc(table.lastName), asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorASC and cursorDefault", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorASC,
              cursors: [cursorDefault],
            })
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorASC and cursorASC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorASC,
              cursors: [cursorASC],
            })
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorASC and cursorDESC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorASC,
              cursors: [cursorDESC],
            })
          ).to.deep.equal({
            orderBy: [desc(table.lastName), asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorDESC and cursorDefault", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDESC,
              cursors: [cursorDefault],
            })
          ).to.deep.equal({
            orderBy: [asc(table.lastName), desc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorDESC and cursorASC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDESC,
              cursors: [cursorASC],
            })
          ).to.deep.equal({
            orderBy: [asc(table.lastName), desc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorDESC and cursorDESC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDESC,
              cursors: [cursorDESC],
            })
          ).to.deep.equal({
            orderBy: [desc(table.lastName), desc(table.id)],
            where: undefined,
          });
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
          expect(
            generateCursor(
              { primaryCursor: primaryCursorDefault, cursors: [cursorDefault] },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.id)],
            where: or(
              and(gt(table.lastName, previousData.lastName)),
              and(
                eq(table.lastName, previousData.lastName),
                gt(table.id, previousData.id)
              )
            ),
          });
        });

        test("with primaryCursorDefault and cursorASC", () => {
          expect(
            generateCursor(
              { primaryCursor: primaryCursorDefault, cursors: [cursorASC] },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.id)],
            where: or(
              and(gt(table.lastName, previousData.lastName)),
              and(
                eq(table.lastName, previousData.lastName),
                gt(table.id, previousData.id)
              )
            ),
          });
        });

        test("with primaryCursorDefault and cursorDESC", () => {
          expect(
            generateCursor(
              { primaryCursor: primaryCursorDefault, cursors: [cursorDESC] },
              previousData
            )
          ).to.deep.equal({
            orderBy: [desc(table.lastName), asc(table.id)],
            where: or(
              and(lt(table.lastName, previousData.lastName)),
              and(
                eq(table.lastName, previousData.lastName),
                gt(table.id, previousData.id)
              )
            ),
          });
        });

        test("with primaryCursorASC and cursorDefault", () => {
          expect(
            generateCursor(
              { primaryCursor: primaryCursorASC, cursors: [cursorDefault] },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.id)],
            where: or(
              and(gt(table.lastName, previousData.lastName)),
              and(
                eq(table.lastName, previousData.lastName),
                gt(table.id, previousData.id)
              )
            ),
          });
        });

        test("with primaryCursorASC and cursorASC", () => {
          expect(
            generateCursor(
              { primaryCursor: primaryCursorASC, cursors: [cursorASC] },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.id)],
            where: or(
              and(gt(table.lastName, previousData.lastName)),
              and(
                eq(table.lastName, previousData.lastName),
                gt(table.id, previousData.id)
              )
            ),
          });
        });

        test("with primaryCursorASC and cursorDESC", () => {
          expect(
            generateCursor(
              { primaryCursor: primaryCursorASC, cursors: [cursorDESC] },
              previousData
            )
          ).to.deep.equal({
            orderBy: [desc(table.lastName), asc(table.id)],
            where: or(
              and(lt(table.lastName, previousData.lastName)),
              and(
                eq(table.lastName, previousData.lastName),
                gt(table.id, previousData.id)
              )
            ),
          });
        });

        test("with primaryCursorDESC and cursorDefault", () => {
          expect(
            generateCursor(
              { primaryCursor: primaryCursorDESC, cursors: [cursorDefault] },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.lastName), desc(table.id)],
            where: or(
              and(gt(table.lastName, previousData.lastName)),
              and(
                eq(table.lastName, previousData.lastName),
                lt(table.id, previousData.id)
              )
            ),
          });
        });

        test("with primaryCursorDESC and cursorASC", () => {
          expect(
            generateCursor(
              { primaryCursor: primaryCursorDESC, cursors: [cursorASC] },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.lastName), desc(table.id)],
            where: or(
              and(gt(table.lastName, previousData.lastName)),
              and(
                eq(table.lastName, previousData.lastName),
                lt(table.id, previousData.id)
              )
            ),
          });
        });

        test("with primaryCursorDESC and cursorDESC", () => {
          expect(
            generateCursor(
              { primaryCursor: primaryCursorDESC, cursors: [cursorDESC] },
              previousData
            )
          ).to.deep.equal({
            orderBy: [desc(table.lastName), desc(table.id)],
            where: or(
              and(lt(table.lastName, previousData.lastName)),
              and(
                eq(table.lastName, previousData.lastName),
                lt(table.id, previousData.id)
              )
            ),
          });
        });

        //-----------------
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
          expect(
            generateCursor({
              primaryCursor: primaryCursorDefault,
              cursors: [cursorDefault, cursor2Default],
            })
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorDefault and cursorDefault and cursor2ASC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDefault,
              cursors: [cursorDefault, cursor2ASC],
            })
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorDefault and cursorDefault and cursor2DESC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDefault,
              cursors: [cursorDefault, cursor2DESC],
            })
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              desc(table.firstName),
              asc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorDefault and cursorASC and cursor2Default", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDefault,
              cursors: [cursorASC, cursor2Default],
            })
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorDefault and cursorASC and cursor2ASC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDefault,
              cursors: [cursorASC, cursor2ASC],
            })
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorDefault and cursorASC and cursor2DESC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDefault,
              cursors: [cursorASC, cursor2DESC],
            })
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              desc(table.firstName),
              asc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorDefault and cursorDESC and cursor2Default", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDefault,
              cursors: [cursorDESC, cursor2Default],
            })
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              asc(table.firstName),
              asc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorDefault and cursorDESC and cursor2ASC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDefault,
              cursors: [cursorDESC, cursor2ASC],
            })
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              asc(table.firstName),
              asc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorDefault and cursorDESC and cursor2DESC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDefault,
              cursors: [cursorDESC, cursor2DESC],
            })
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              desc(table.firstName),
              asc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorASC and cursorDefault and cursor2Default", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorASC,
              cursors: [cursorDefault, cursor2Default],
            })
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorASC and cursorDefault and cursor2ASC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorASC,
              cursors: [cursorDefault, cursor2ASC],
            })
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorASC and cursorDefault and cursor2DESC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorASC,
              cursors: [cursorDefault, cursor2DESC],
            })
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              desc(table.firstName),
              asc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorASC and cursorASC and cursor2Default", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorASC,
              cursors: [cursorASC, cursor2Default],
            })
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorASC and cursorASC and cursor2ASC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorASC,
              cursors: [cursorASC, cursor2ASC],
            })
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: undefined,
          });
        });

        test("with primaryCursorASC and cursorASC and cursor2DESC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorASC,
              cursors: [cursorASC, cursor2DESC],
            })
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              desc(table.firstName),
              asc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorASC and cursorDESC and cursor2Default", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorASC,
              cursors: [cursorDESC, cursor2Default],
            })
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              asc(table.firstName),
              asc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorASC and cursorDESC and cursor2ASC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorASC,
              cursors: [cursorDESC, cursor2ASC],
            })
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              asc(table.firstName),
              asc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorASC and cursorDESC and cursor2DESC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorASC,
              cursors: [cursorDESC, cursor2DESC],
            })
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              desc(table.firstName),
              asc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorDESC and cursorDefault and cursor2Default", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDESC,
              cursors: [cursorDefault, cursor2Default],
            })
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              asc(table.firstName),
              desc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorDESC and cursorDefault and cursor2ASC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDESC,
              cursors: [cursorDefault, cursor2ASC],
            })
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              asc(table.firstName),
              desc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorDESC and cursorDefault and cursor2DESC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDESC,
              cursors: [cursorDefault, cursor2DESC],
            })
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              desc(table.firstName),
              desc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorDESC and cursorASC and cursor2Default", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDESC,
              cursors: [cursorASC, cursor2Default],
            })
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              asc(table.firstName),
              desc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorDESC and cursorASC and cursor2ASC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDESC,
              cursors: [cursorASC, cursor2ASC],
            })
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              asc(table.firstName),
              desc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorDESC and cursorASC and cursor2DESC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDESC,
              cursors: [cursorASC, cursor2DESC],
            })
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              desc(table.firstName),
              desc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorDESC and cursorDESC and cursor2Default", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDESC,
              cursors: [cursorDESC, cursor2Default],
            })
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              asc(table.firstName),
              desc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorDESC and cursorDESC and cursor2ASC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDESC,
              cursors: [cursorDESC, cursor2ASC],
            })
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              asc(table.firstName),
              desc(table.id),
            ],
            where: undefined,
          });
        });

        test("with primaryCursorDESC and cursorDESC and cursor2DESC", () => {
          expect(
            generateCursor({
              primaryCursor: primaryCursorDESC,
              cursors: [cursorDESC, cursor2DESC],
            })
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              desc(table.firstName),
              desc(table.id),
            ],
            where: undefined,
          });
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
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDefault,
                cursors: [cursorDefault, cursor2Default],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDefault and cursorDefault and cursor2ASC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDefault,
                cursors: [cursorDefault, cursor2ASC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDefault and cursorDefault and cursor2DESC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDefault,
                cursors: [cursorDefault, cursor2DESC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              desc(table.firstName),
              asc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDefault and cursorASC and cursor2Default", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDefault,
                cursors: [cursorASC, cursor2Default],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDefault and cursorASC and cursor2ASC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDefault,
                cursors: [cursorASC, cursor2ASC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDefault and cursorASC and cursor2DESC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDefault,
                cursors: [cursorASC, cursor2DESC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              desc(table.firstName),
              asc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDefault and cursorDESC and cursor2Default", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDefault,
                cursors: [cursorDESC, cursor2Default],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              asc(table.firstName),
              asc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDefault and cursorDESC and cursor2ASC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDefault,
                cursors: [cursorDESC, cursor2ASC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              asc(table.firstName),
              asc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDefault and cursorDESC and cursor2DESC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDefault,
                cursors: [cursorDESC, cursor2DESC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              desc(table.firstName),
              asc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorASC and cursorDefault and cursor2Default", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorASC,
                cursors: [cursorDefault, cursor2Default],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorASC and cursorDefault and cursor2ASC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorASC,
                cursors: [cursorDefault, cursor2ASC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorASC and cursorDefault and cursor2DESC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorASC,
                cursors: [cursorDefault, cursor2DESC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              desc(table.firstName),
              asc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorASC and cursorASC and cursor2Default", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorASC,
                cursors: [cursorASC, cursor2Default],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorASC and cursorASC and cursor2ASC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorASC,
                cursors: [cursorASC, cursor2ASC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [asc(table.lastName), asc(table.firstName), asc(table.id)],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorASC and cursorASC and cursor2DESC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorASC,
                cursors: [cursorASC, cursor2DESC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              desc(table.firstName),
              asc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorASC and cursorDESC and cursor2Default", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorASC,
                cursors: [cursorDESC, cursor2Default],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              asc(table.firstName),
              asc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorASC and cursorDESC and cursor2ASC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorASC,
                cursors: [cursorDESC, cursor2ASC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              asc(table.firstName),
              asc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorASC and cursorDESC and cursor2DESC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorASC,
                cursors: [cursorDESC, cursor2DESC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              desc(table.firstName),
              asc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDESC and cursorDefault and cursor2Default", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDESC,
                cursors: [cursorDefault, cursor2Default],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              asc(table.firstName),
              desc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDESC and cursorDefault and cursor2ASC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDESC,
                cursors: [cursorDefault, cursor2ASC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              asc(table.firstName),
              desc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDESC and cursorDefault and cursor2DESC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDESC,
                cursors: [cursorDefault, cursor2DESC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              desc(table.firstName),
              desc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDESC and cursorASC and cursor2Default", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDESC,
                cursors: [cursorASC, cursor2Default],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              asc(table.firstName),
              desc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDESC and cursorASC and cursor2ASC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDESC,
                cursors: [cursorASC, cursor2ASC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              asc(table.firstName),
              desc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDESC and cursorASC and cursor2DESC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDESC,
                cursors: [cursorASC, cursor2DESC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              asc(table.lastName),
              desc(table.firstName),
              desc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDESC and cursorDESC and cursor2Default", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDESC,
                cursors: [cursorDESC, cursor2Default],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              asc(table.firstName),
              desc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDESC and cursorDESC and cursor2ASC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDESC,
                cursors: [cursorDESC, cursor2ASC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              asc(table.firstName),
              desc(table.id),
            ],
            where: or(
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
            ),
          });
        });

        test("with primaryCursorDESC and cursorDESC and cursor2DESC", () => {
          expect(
            generateCursor(
              {
                primaryCursor: primaryCursorDESC,
                cursors: [cursorDESC, cursor2DESC],
              },
              previousData
            )
          ).to.deep.equal({
            orderBy: [
              desc(table.lastName),
              desc(table.firstName),
              desc(table.id),
            ],
            where: or(
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
            ),
          });
        });
      });
    });

    describe("with multiple cursors", () => {
      test("with three cursors and no previous data", () => {
        expect(
          generateCursor({
            primaryCursor: { key: "id", schema: table.id, order: "DESC" },
            cursors: [
              { key: "firstName", schema: table.firstName },
              { key: "lastName", schema: table.lastName, order: "DESC" },
              { key: "middleName", schema: table.middleName },
            ],
          })
        ).to.deep.equal({
          orderBy: [
            asc(table.firstName),
            desc(table.lastName),
            asc(table.middleName),
            desc(table.id),
          ],
          where: undefined,
        });
      });

      test("with three cursors and previous data", () => {
        expect(
          generateCursor(
            {
              cursors: [
                { key: "firstName", schema: table.firstName, order: "DESC" },
                { key: "lastName", schema: table.lastName },
                { key: "middleName", schema: table.middleName, order: "DESC" },
              ],
              primaryCursor: { key: "id", schema: table.id, order: "ASC" },
            },
            {
              id: 1,
              firstName: "John",
              middleName: "Doe",
              lastName: "Smith",
              phone: "123456789",
              email: "johndoe",
            }
          )
        ).to.deep.equal({
          orderBy: [
            desc(table.firstName),
            asc(table.lastName),
            desc(table.middleName),
            asc(table.id),
          ],
          where: or(
            and(lt(table.firstName, "John")),
            and(eq(table.firstName, "John"), gt(table.lastName, "Smith")),
            and(
              eq(table.firstName, "John"),
              eq(table.lastName, "Smith"),
              lt(table.middleName, "Doe")
            ),
            and(
              eq(table.firstName, "John"),
              eq(table.lastName, "Smith"),
              eq(table.middleName, "Doe"),
              gt(table.id, 1)
            )
          ),
        });
      });
    });
  });
});
