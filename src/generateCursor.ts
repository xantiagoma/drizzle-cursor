import { SQL, and, asc, desc, eq, gt, lt, or } from "drizzle-orm";

import type { CursorConfig } from "./types";
import { generateSubArrays } from "./utils";
import { parse } from "./parse";
import { serialize } from "./serialize";

export const generateCursor = (config: CursorConfig) => {
  const { cursors = [], primaryCursor } = config;
  const orderBy: Array<SQL> = [];
  for (const { order = "ASC", schema } of [...cursors, primaryCursor]) {
    const fn = order === "ASC" ? asc : desc;
    const sql = fn(schema);
    orderBy.push(sql);
  }
  return {
    orderBy,
    where: (lastPreviousItemData?: Record<string, unknown> | string | null) => {
      if (!lastPreviousItemData) {
        return undefined;
      }

      const data =
        typeof lastPreviousItemData === "string"
          ? parse(config, lastPreviousItemData)
          : lastPreviousItemData;

      if (!data) {
        return undefined;
      }

      const matrix = generateSubArrays([...cursors, primaryCursor]);

      const ors: Array<SQL> = [];
      for (const posibilities of matrix) {
        const ands: Array<SQL> = [];
        for (const cursor of posibilities) {
          const lastValue = cursor === posibilities?.at(-1);
          const { order = "ASC", schema, key } = cursor;
          const fn = order === "ASC" ? gt : lt;
          const sql = !lastValue
            ? eq(schema, data[key])
            : fn(schema, data[key]);
          ands.push(sql);
        }
        const _and = and(...ands);
        if (!_and) {
          continue;
        }
        ors.push(_and);
      }
      const where = or(...ors);

      return where;
    },
    parse: (cursor: string) => parse(config, cursor),
    serialize: (data?: Record<string, unknown> | null) =>
      serialize(config, data),
  };
};

export default generateCursor;
