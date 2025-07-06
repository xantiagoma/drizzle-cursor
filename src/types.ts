import type { AnyColumn, SQL } from "drizzle-orm";

export type Cursor = {
  order?: "ASC" | "DESC";
  key: string;
} & (
  | { schema: AnyColumn }
  | { sql: SQL }
);

export type CursorConfig = {
  primaryCursor: Cursor;
  cursors?: Array<Cursor>;
};
