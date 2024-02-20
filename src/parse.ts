import "@total-typescript/ts-reset";

import type { CursorConfig } from "./types";
import { decoder as _decoder, parser as _parser } from "./utils";

/**
 * parse:
 * takes a cursor and returns a JavaScript object
 * useful to retrive object from the FE client token
 */
export function parse<
  T extends Record<string, unknown> = Record<string, unknown>
>(
  { primaryCursor, cursors = [] }: CursorConfig,
  cursor?: string | null,
  decoder = _decoder,
  parser = _parser
): T | null {
  if (!cursor) {
    return null;
  }

  const keys = [primaryCursor, ...cursors].map((cursor) => cursor.key);
  const data = parser(decoder(cursor)) as T;

  const item = keys.reduce((acc, key) => {
    const value = data[key];
    acc[key] = value;
    return acc;
  }, {} as Record<string, unknown>);
  return item as T;
}

export default parse;
