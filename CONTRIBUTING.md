# Contributing

Thanks for contributing to `drizzle-cursor`.

## Issues and PRs

- Submit issues with a minimal reproducible example
- PRs are welcome

## Release workflow

This repo uses 3 npm channels:

- `latest` (stable)
- `beta` (pre-release)
- `alpha` (early pre-release)

### High-level flow

```text
feature branch -> PR -> main -> CI -> stable publish (latest)
```

```text
prerelease/alpha/* branch push -> prerelease publish -> npm @alpha
prerelease/beta/* branch push -> prerelease publish -> npm @beta
```

### Workflows

- `.github/workflows/main.yml`
  - Runs lint/test/build on all pushes
  - Tests against Drizzle `0.45.2` and `beta`

- `.github/workflows/publish.yml`
  - Runs after CI success on `main`
  - Publishes stable releases through Changesets (`latest`)

- `.github/workflows/publish-prerelease.yml`
  - Publishes prereleases from `prerelease/alpha/*` and `prerelease/beta/*`
  - Also supports manual dispatch with channel input (`alpha` or `beta`)
  - Enforces:
    - branch contains latest `main`
    - lint/test/build pass before publish
  - Generates prerelease versions before publishing to avoid version collisions:
    - `alpha`: snapshot versions such as `0.0.0-alpha-20260501011439`
    - `beta`: target-version timestamps such as `0.6.0-beta.20260501011439`

### Branch naming convention for prereleases

- `prerelease/alpha/<topic>`
- `prerelease/beta/<topic>`

Operational rule:

- Keep one active beta stream at a time to avoid moving `@beta` between unrelated features
- Multiple alpha publishes are safe because snapshot versions are unique per run

Examples:

- `prerelease/alpha/drizzle-v1`
- `prerelease/beta/drizzle-v1`

### Install by channel

```sh
npm install drizzle-cursor
npm install drizzle-cursor@beta
npm install drizzle-cursor@alpha
```

### Maintainer playbook (sync + safety)

1. Create or update feature branch
2. Sync prerelease branch with feature branch
3. Push to `prerelease/alpha/<topic>` for early validation
4. Push to `prerelease/beta/<topic>` when ready for wider testing
5. Merge feature PR to `main` for stable release

## Drizzle v1 branch policy

- `drizzle-v1` is an integration branch.
- Do not push feature commits directly to `drizzle-v1`.
- Always use PRs from `feat/*` branches into `drizzle-v1`.
- Use `drizzle-v1 -> main` as the final umbrella PR when the initiative is ready.

Suggested git flow:

```sh
git checkout main
git pull
git checkout feature/drizzle-v1
git rebase main

git checkout -B prerelease/alpha/drizzle-v1
git push -u origin prerelease/alpha/drizzle-v1

git checkout -B prerelease/beta/drizzle-v1
git push -u origin prerelease/beta/drizzle-v1
```
