# drizzle-cursor

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
