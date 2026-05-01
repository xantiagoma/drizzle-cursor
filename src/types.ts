export type Cursor = { order?: "ASC" | "DESC"; key: string; schema: unknown };

export type RelationalOrderBy = Record<string, "asc" | "desc">;
export type RelationalWhere = Record<string, unknown>;

export type CursorConfig = {
  primaryCursor: Cursor;
  cursors?: Array<Cursor>;
};
