# drizzle-cursor

Cursor-based pagination library for Drizzle ORM.

## Tooling

- **Package manager**: pnpm
- **Build**: tsup (CJS + ESM + DTS)
- **Test**: vitest
- **Lint**: tsc (type checking only)
- **Versioning**: changelogen (conventional commits)

## Scripts

- `pnpm run test` — run tests (vitest)
- `pnpm run lint` — type check (tsc)
- `pnpm run build` — build library (tsup)
- `pnpm run release` — bump version, update changelog, build, publish
- `pnpm run changelog` — preview changelog from commits

## Publishing

Uses changelogen + tag-based CI publish:

```sh
# Quick release
pnpm run lint && pnpm run test && pnpx changelogen --release --push
```

This will:
1. Bump version in package.json based on conventional commits
2. Update CHANGELOG.md
3. Create a git commit + tag (e.g. v0.7.1)
4. Push to main with tag
5. CI publish.yml triggers on v* tag → builds and publishes to npm

## Commit Convention

```
feat: new feature        → minor bump
fix: bug fix             → patch bump
feat!: breaking change   → major bump (minor in 0.x)
chore: maintenance       → no bump but in changelog
```

## Project Structure

```
src/
  index.ts               — barrel export
  generateCursor.ts      — main cursor generation logic
  types.ts               — TypeScript types
  parse.ts               — cursor parsing
  serialize.ts           — cursor serialization
  utils.ts               — encoder/decoder/parser/serializer
test/
  generateCursor.test.ts — main tests
  relations-helper.test.ts
test-fixtures/
  drizzle-v0/            — compatibility tests with drizzle 0.x
  drizzle-v1/            — compatibility tests with drizzle 1.x
```

## Key Patterns

- `generateCursor(config, options?)` returns cursor with `.where()`, `.orderBy`, `.serialize()`, `.parse()`
- Supports query-builder, RQB v1, and RQB v2 APIs
- Custom serialization via parser/serializer/encoder/decoder options
- SQL expression cursors via `sql` field instead of `schema`
- `drizzle-orm >= 0.33.0 < 2` as peer dependency
