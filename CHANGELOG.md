# drizzle-cursor

## v0.7.1

[compare changes](https://github.com/xantiagoma/drizzle-cursor/compare/drizzle-cursor@0.7.0...v0.7.1)

### 🏡 Chore

- Add logo, badges, and See Also section to README ([a9dfff8](https://github.com/xantiagoma/drizzle-cursor/commit/a9dfff8))
- Add changeset for logo/badges patch ([f325330](https://github.com/xantiagoma/drizzle-cursor/commit/f325330))
- Replace changesets with changelogen ([001b9ce](https://github.com/xantiagoma/drizzle-cursor/commit/001b9ce))

### ❤️ Contributors

- Santiago Montoya ([@xantiagoma](https://github.com/xantiagoma))

## 0.7.0

### Minor Changes

- Add SQL expression cursor support

  Allow raw Drizzle `sql` expressions as cursor values alongside table columns, enabling pagination by computed fields (e.g. `upper(name)`, concatenated strings, or any DB-evaluable expression).

  - `Cursor` is now a discriminated union of `TableCursor` (schema) and `SQLCursor` (sql) — both exported as named types
  - `CursorConfig<C>` is generic; cursor types are fully inferred at call sites with no manual annotations
  - `cursor.relations.orderBy` returns `() => SQL[]` when any cursor uses `sql`, automatically inferred via `ConfigHasSqlCursor<C>` conditional type
  - `cursor.relations.where()` builds `{ RAW: () => SQL }` conditions for SQL expression cursors

## 0.6.0

### Minor Changes

- 443e792: Add Drizzle v1 beta compatibility groundwork with dual-version test coverage, workspace fixtures, and CI matrix validation.

## 0.5.3

### Patch Changes

- Parse for Date/DateTime string

## 0.5.2

### Patch Changes

- Validate for Date/DateTime string

## 0.5.1

### Patch Changes

- fix null on date column (try 1)

## 0.5.0

### Minor Changes

- Update drizzle peer version and add pg test

## 0.4.1

### Patch Changes

- Update peerDependency to allow drizzle v0.30.x

## 0.4.0

### Minor Changes

- Add `options` to `generateCursor` so `decoder`, `encoder`, `parser`, `serializer`, `parse` and `serialize` can be customized enabling custom cursor tokens.

## 0.3.2

### Patch Changes

- add Licence to README

## 0.3.1

### Patch Changes

- Add documentation on README

## 0.3.0

### Minor Changes

- change parse/serialize to encode/decode Base UTF-8 with `Buffer` instead of built-in atob/btoa

## 0.2.1

### Patch Changes

- Add docs and date tests

## 0.2.0

### Minor Changes

- Update drizzle-orm and devDependencies, also add `db:seed` and fix test example.

## 0.1.0

### Minor Changes

- - Add `parse()`/`serialize()` function and `config.parse()`/`config.serialize()` methods to handle base64 tokens

  - Refactor `config.where` so intead of being an object is a clousure function which enables to use the same instance of `generateCursor()` accross multiple calls calling `.where()` without and with arguments.
  - Remove second argument from `generateCursor()` which is now used as the argument of `.where()`

## 0.0.3

### Patch Changes

- set "ASC" as default for Cursor.order

## 0.0.2

### Patch Changes

- Move drizzle-orm from dependencies to peerDependencies
