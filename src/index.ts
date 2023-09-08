import { AnyColumn, SQL, and, asc, desc, eq, gt, lt, or } from "drizzle-orm";

import { generateSubArrays } from "./utils";

export type Cursor = { order?: "ASC" | "DESC"; key: string; schema: AnyColumn };

export type CursorConfig = {
  primaryCursor: Cursor;
  cursors?: Array<Cursor>;
};

export const generateCursor = (
  { cursors = [], primaryCursor }: CursorConfig,
  lastPreviousItemData?: Record<string, any>
) => {
  const orderBy: Array<SQL> = [];
  for (const { order, schema } of [...cursors, primaryCursor]) {
    const fn = order === "ASC" ? asc : desc;
    const sql = fn(schema);
    orderBy.push(sql);
  }

  if (!lastPreviousItemData) {
    return {
      orderBy,
      where: undefined,
    };
  }

  const matrix = generateSubArrays([...cursors, primaryCursor]);

  const ors: Array<SQL> = [];
  for (const posibilities of matrix) {
    const ands: Array<SQL> = [];
    for (const cursor of posibilities) {
      const lastValue = cursor === posibilities?.at(-1);
      const { order, schema, key } = cursor;
      const fn = order === "ASC" ? gt : lt;
      const sql = !lastValue
        ? eq(schema, lastPreviousItemData[key])
        : fn(schema, lastPreviousItemData[key]);
      ands.push(sql);
    }
    const _and = and(...ands);
    if (!_and) {
      continue;
    }
    ors.push(_and);
  }
  const where = or(...ors);
  return {
    orderBy,
    where,
  };
};
