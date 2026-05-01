export type Cursor = { order?: "ASC" | "DESC"; key: string; schema: unknown };

export type RelationsOrderBy = Record<string, "asc" | "desc">;
export type RelationsWhere = Record<string, unknown>;

export type CursorConfig = {
  primaryCursor: Cursor;
  cursors?: Array<Cursor>;
};
