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

### npm authentication (trusted publishing)

Publishing uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC) — there is
**no `NPM_TOKEN` secret**. GitHub Actions mints a short-lived OIDC token, so nothing can expire.

One-time setup on npm (already done; needed again only if the repo or workflow file is renamed):

```sh
npm trust github drizzle-cursor --repo xantiagoma/drizzle-cursor --file publish.yml
```

or via npmjs.com → the `drizzle-cursor` package → **Settings** → **Trusted Publisher** → GitHub Actions
(repo `xantiagoma/drizzle-cursor`, workflow `publish.yml`). This needs npm >= 11.5.1, which Node 24 ships
(the workflow runs on Node 24).

### Re-publish an existing tag

If a publish run fails after the tag was already pushed, re-run it without re-tagging:

```sh
gh workflow run publish.yml -f tag=v0.7.2
```

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
