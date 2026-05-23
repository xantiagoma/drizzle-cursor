# Contributing

Thanks for contributing to `drizzle-cursor`.

## Issues and PRs

- Submit issues with a minimal reproducible example
- PRs are welcome

## Release workflow

Uses [changelogen](https://github.com/unjs/changelogen) — auto-generates changelog from conventional commits.

### Publish a release

```sh
# 1. Make sure everything passes
pnpm run lint && pnpm run test && pnpm run build

# 2. Release (bumps version, updates CHANGELOG.md, creates git tag)
pnpm run release

# 3. Push to trigger CI publish
git push origin main --follow-tags
```

The `publish.yml` workflow triggers on `v*` tags and publishes to npm.

### Quick one-liner

```sh
pnpm run lint && pnpm run test && pnpm run release && git push origin main --follow-tags
```

### Commit message format

```
feat: add feature        → minor bump
fix: fix bug             → patch bump
feat!: breaking change   → major bump (or minor in 0.x)
```
