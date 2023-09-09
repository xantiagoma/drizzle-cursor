import "@total-typescript/ts-reset";

import type { CursorConfig } from "./types";

export function serialize<
  T extends Record<string, unknown> = Record<string, unknown>
>(
  { primaryCursor, cursors = [] }: CursorConfig,
  data?: T | null
): string | null {
  if (!data) {
    return null;
  }

  const keys = [primaryCursor, ...cursors].map((cursor) => cursor.key);
  const item = keys.reduce((acc, key) => {
    const value = data[key];
    acc[key] = value;
    return acc;
  }, {} as Record<string, unknown>);

  return btoa(JSON.stringify(item));
}

export default serialize;
