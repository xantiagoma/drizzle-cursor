import "@total-typescript/ts-reset";

import type { CursorConfig } from "./types";
import { atob } from "./utils";

export function parse<
  T extends Record<string, unknown> = Record<string, unknown>
>(
  { primaryCursor, cursors = [] }: CursorConfig,
  cursor?: string | null
): T | null {
  if (!cursor) {
    return null;
  }

  const keys = [primaryCursor, ...cursors].map((cursor) => cursor.key);
  const data = JSON.parse(atob(cursor)) as T;

  const item = keys.reduce((acc, key) => {
    const value = data[key];
    acc[key] = value;
    return acc;
  }, {} as Record<string, unknown>);
  return item as T;
}

export default parse;
