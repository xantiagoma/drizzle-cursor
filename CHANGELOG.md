# drizzle-cursor

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
