import { SQL, and, asc, desc, eq, gt, lt, or } from "drizzle-orm";

import type { Cursor, CursorConfig, RelationsOrderBy, RelationsWhere, SQLCursor } from "./types";
import {
  generateSubArrays,
  decoder as _decoder,
  encoder as _encoder,
  parser as _parser,
  serializer as _serializer,
} from "./utils";
import { parse as _parse } from "./parse";
import { serialize as _serialize } from "./serialize";

// ---------------------------------------------------------------------------
// C is the full CursorConfig literal type (inferred by TypeScript).
// We inspect C["primaryCursor"] and C["cursors"][number] to decide whether
// any cursor in the config uses a SQL expression.
// ---------------------------------------------------------------------------

type CursorIsSql<C extends Cursor> = C extends SQLCursor ? true : false;

type ConfigHasSqlCursor<C extends CursorConfig> =
  true extends CursorIsSql<C["primaryCursor"]>
    ? true
    : C["cursors"] extends Array<Cursor>
      ? true extends CursorIsSql<C["cursors"][number]>
        ? true
        : false
      : false;

/**
 * When every cursor uses `schema`, `relations.orderBy` is a plain
 * `Record<string, "asc" | "desc">` (RQB v2 field-name form).
 *
 * When any cursor uses `sql`, it becomes `() => SQL[]` — pass it directly
 * as the RQB v2 `orderBy` callback so the SQL expression is evaluated.
 */
type RelationsOrderByFor<C extends CursorConfig> =
  ConfigHasSqlCursor<C> extends true ? () => Array<SQL> : RelationsOrderBy;

// ---------------------------------------------------------------------------

export const generateCursor = <C extends CursorConfig>(
  config: C,
  options?: {
    /**
     * decoder: similar to `atob()` but compatible with UTF-8 strings
     * converts a base64 encoded string to a UTF-8 string
     * @link https://developer.mozilla.org/en-US/docs/Web/API/atob
     */
    decoder?: typeof _decoder;

    /**
     * encoder: similar to `btoa()` but compatible with UTF-8 strings
     * converts a UTF-8 string to a base64 encoded string
     * @link https://developer.mozilla.org/en-US/docs/Web/API/btoa
     */
    encoder?: typeof _encoder;

    /**
     * parser: similar to `JSON.parse()`
     * converts a JSON string to a JavaScript object
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
     */
    parser?: typeof _parser;

    /**
     * serializer: similar to `JSON.stringify()`
     * converts a JavaScript object to a JSON string
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
     */
    serializer?: typeof _serializer;

    /**
     * parse:
     * takes a cursor and returns a JavaScript object
     * useful to retrive object from the FE client token
     */
    parse?: typeof _parse;

    /**
     * serialize:
     * takes a JavaScript object and returns a cursor
     * useful to generate token to the FE client
     */
    serialize?: typeof _serialize;
  }
) => {
  const { cursors = [], primaryCursor } = config;
  const {
    decoder = _decoder,
    encoder = _encoder,
    parser = _parser,
    serializer = _serializer,
    parse = _parse,
    serialize = _serialize,
  } = options ?? {};

  const allCursors = [...cursors, primaryCursor];
  const orderBy: Array<SQL> = [];
  const relationsOrderBy: RelationsOrderBy = {};

  const isColumn = (schema: unknown): schema is Parameters<typeof asc>[0] =>
    typeof schema === "object" && schema !== null;

  const assertColumn = (schema: unknown, key?: string) => {
    if (!isColumn(schema)) {
      throw new TypeError(
        `Invalid cursor schema for key "${key ?? "unknown"}": expected a Drizzle column instance`,
      );
    }
    return schema;
  };

  for (const cursor of allCursors) {
    const { order = "ASC", key } = cursor;
    const fn = order === "ASC" ? asc : desc;
    if ("sql" in cursor) {
      orderBy.push(fn(cursor.sql));
    } else {
      orderBy.push(fn(assertColumn(cursor.schema, key)));
    }
    relationsOrderBy[key] = order === "ASC" ? "asc" : "desc";
  }

  const hasSqlCursor = allCursors.some((c) => "sql" in c);

  const relations: {
    orderBy: RelationsOrderByFor<C>;
    where: (lastPreviousItemData?: Record<string, unknown> | string | null) => { OR: RelationsWhere[] } | undefined;
  } = {
    // Cast is safe: hasSqlCursor mirrors the compile-time ConfigHasSqlCursor<C> check
    orderBy: (hasSqlCursor ? (() => orderBy) : relationsOrderBy) as RelationsOrderByFor<C>,
    where: (lastPreviousItemData?: Record<string, unknown> | string | null) => {
      if (!lastPreviousItemData) {
        return undefined;
      }

      const data =
        typeof lastPreviousItemData === "string"
          ? parse(config, lastPreviousItemData, decoder, parser)
          : lastPreviousItemData;

      if (!data) {
        return undefined;
      }

      const matrix = generateSubArrays(allCursors);

      const ors: Array<RelationsWhere> = [];

      for (const possibilities of matrix) {
        const clause: RelationsWhere = {};
        const sqlConditions: Array<SQL> = [];

        for (const cursor of possibilities) {
          const lastValue = cursor === possibilities?.at(-1);
          const { order = "ASC", key } = cursor;

          if ("sql" in cursor) {
            const fn = order === "ASC" ? gt : lt;
            sqlConditions.push(
              lastValue ? fn(cursor.sql, data[key]) : eq(cursor.sql, data[key]),
            );
          } else {
            clause[key] = lastValue
              ? { [order === "ASC" ? "gt" : "lt"]: data[key] }
              : { eq: data[key] };
          }
        }

        if (sqlConditions.length > 0) {
          // Cast is safe: length > 0 guarantees at least one element
          const [first, ...rest] = sqlConditions as [SQL, ...SQL[]];
          const combined = rest.length === 0 ? first : (and(first, ...rest) as SQL);
          clause["RAW"] = (_table: unknown) => combined;
        }

        ors.push(clause);
      }

      return { OR: ors };
    },
  };

  return {
    orderBy,

    where: (lastPreviousItemData?: Record<string, unknown> | string | null) => {
      if (!lastPreviousItemData) {
        return undefined;
      }

      const data =
        typeof lastPreviousItemData === "string"
          ? parse(config, lastPreviousItemData, decoder, parser)
          : lastPreviousItemData;

      if (!data) {
        return undefined;
      }

      const matrix = generateSubArrays(allCursors);

      const ors: Array<SQL> = [];
      for (const posibilities of matrix) {
        const ands: Array<SQL> = [];
        for (const cursor of posibilities) {
          const lastValue = cursor === posibilities?.at(-1);
          const { order = "ASC", key } = cursor;
          const fn = order === "ASC" ? gt : lt;
          const col = "sql" in cursor ? cursor.sql : assertColumn(cursor.schema, key);
          const whereSql = !lastValue ? eq(col, data[key]) : fn(col, data[key]);
          ands.push(whereSql);
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

    relations,

    parse: (cursor: string | null) => parse(config, cursor, decoder, parser),

    serialize: (data?: Record<string, unknown> | null) =>
      serialize(config, data, encoder, serializer),
  };
};

export default generateCursor;
