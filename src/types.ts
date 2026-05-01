import type { SQL } from "drizzle-orm";

export type TableCursor = { order?: "ASC" | "DESC"; key: string; schema: unknown };
export type SQLCursor = { order?: "ASC" | "DESC"; key: string; sql: SQL };
export type Cursor = TableCursor | SQLCursor;

export type RelationsOrderBy = Record<string, "asc" | "desc">;
export type RelationsWhere = {
  RAW?: (table: unknown) => SQL;
  [key: string]: unknown;
};

/**
 * C is an optional parameter for user-facing type annotations
 * (e.g. `CursorConfig<SQLCursor>`).
 *
 * generateCursor uses the non-parameterised form `CursorConfig` (= CursorConfig<Cursor>)
 * as its constraint so TypeScript infers C as the full config literal type, not as a
 * unified cursor type — which would fail when different columns are used as cursors.
 */
export type CursorConfig<C extends Cursor = Cursor> = {
  primaryCursor: C;
  cursors?: Array<C>;
};
