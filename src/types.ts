import type { AnyColumn } from "drizzle-orm";

export type Cursor = { order?: "ASC" | "DESC"; key: string; schema: AnyColumn };

export type CursorConfig = {
  primaryCursor: Cursor;
  cursors?: Array<Cursor>;
};
