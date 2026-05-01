import { SQL, and, asc, desc, eq, gt, lt, or } from "drizzle-orm";

import type { CursorConfig, RelationalOrderBy, RelationalWhere } from "./types";
import {
  generateSubArrays,
  decoder as _decoder,
  encoder as _encoder,
  parser as _parser,
  serializer as _serializer,
} from "./utils";
import { parse as _parse } from "./parse";
import { serialize as _serialize } from "./serialize";

export const generateCursor = (
  config: CursorConfig,
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
  const relationalOrderBy: RelationalOrderBy = {};

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

  for (const { order = "ASC", key, schema } of allCursors) {
    const fn = order === "ASC" ? asc : desc;
    orderBy.push(fn(assertColumn(schema, key)));
    relationalOrderBy[key] = order === "ASC" ? "asc" : "desc";
  }

  const relations: { orderBy: RelationalOrderBy; where: (lastPreviousItemData?: Record<string, unknown> | string | null) => RelationalWhere | { OR: RelationalWhere[] } | undefined } = {
    orderBy: relationalOrderBy,
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

      const ors: Array<RelationalWhere> = [];

      for (const possibilities of matrix) {
        const clause: RelationalWhere = {};
        for (const cursor of possibilities) {
          const lastValue = cursor === possibilities?.at(-1);
          const { order = "ASC", key } = cursor;
          clause[key] = lastValue
            ? { [order === "ASC" ? "gt" : "lt"]: data[key] }
            : { eq: data[key] };
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
          const { order = "ASC", schema, key } = cursor;
          const fn = order === "ASC" ? gt : lt;
          const whereSql = !lastValue
            ? eq(assertColumn(schema, key), data[key])
            : fn(assertColumn(schema, key), data[key]);
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
