import { SQL, and, asc, desc, eq, gt, lt, or } from "drizzle-orm";

import type { CursorConfig } from "./types";
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

  const orderBy: Array<SQL> = [];
  for (const cursor of [...cursors, primaryCursor]) {
    const { order = "ASC" } = cursor;
    const fn = order === "ASC" ? asc : desc;
    
    // Check if using SQL sorting
    if ("sql" in cursor) {
      // For SQL sorting, apply asc/desc directly to SQL expression
      const sql = fn(cursor.sql);
      orderBy.push(sql);
    } else {
      // Backward compatibility: use schema sorting
      const sql = fn(cursor.schema);
      orderBy.push(sql);
    }
  }

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

      const matrix = generateSubArrays([...cursors, primaryCursor]);

      const ors: Array<SQL> = [];
      for (const posibilities of matrix) {
        const ands: Array<SQL> = [];
        for (const cursor of posibilities) {
          const lastValue = cursor === posibilities?.at(-1);
          const { order = "ASC", key } = cursor;
          const fn = order === "ASC" ? gt : lt;
          
          // For SQL sorting, we need special handling
          if ("sql" in cursor) {
            // For SQL sorting, we can only use equality comparison or greater/less than comparison
            // Here we assume SQL expression can be directly compared with values
            const sql = !lastValue
              ? eq(cursor.sql, data[key])
              : fn(cursor.sql, data[key]);
            ands.push(sql);
          } else {
            // Backward compatibility: use schema sorting
            const sql = !lastValue
              ? eq(cursor.schema, data[key])
              : fn(cursor.schema, data[key]);
            ands.push(sql);
          }
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

    parse: (cursor: string | null) => parse(config, cursor, decoder, parser),

    serialize: (data?: Record<string, unknown> | null) =>
      serialize(config, data, encoder, serializer),
  };
};

export default generateCursor;
