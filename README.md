# drizzle-cursor

Utils to generate cursor based pagination for [`drizzle-orm`](https://github.com/drizzle-team/drizzle-orm)

| :zap: Supports *any* number of cursors.  |
|------------------------------------------|

Check example at: [test/example.ts](./test/example.ts)

## Installation

```sh
npm install drizzle-cursor
```

## Compatibility

- Drizzle `0.x` query-builder: guaranteed
- Drizzle `0.x` relational query (RQB v1): `db.query` with SQL-compatible args
- Drizzle `1.0.0-beta.x` query-builder: guaranteed
- Drizzle `1.0.0-beta.x` RQB v1 (`db._query`) and RQB v2 (`db.query`): supported

Notes:

- Canonical cross-version path: query-builder
  (`db.select().from(...).where(cursor.where(...)).orderBy(...cursor.orderBy)`).
- `cursor.relations` is only for RQB v2 (`db.query`) and uses
  `cursor.key` names as relational keys.
- Nullable cursor columns remain discouraged due database and driver consistency differences.

> [!NOTE]
>
> Check types at [`TSDocs`](https://tsdocs.dev/docs/drizzle-cursor/latest/index.html)
>

## Usage

First create a cursor with `generateCursor` listing the Primary-key and the n-other cursors.

> [!WARNING]
>
> The order of the `cursors` matters because it's the way they are going to take in account on the generated SQL-query
>
> Is **not recommended** to use *nullable-columns* for your cursors, it depends on your RDBMS how it handles them.
>

```ts
const cursorConfig: CursorConfig = {
  cursors: [
    { order: "ASC", key: "lastName", schema: schema.users.lastName },
    { order: "ASC", key: "firstName", schema: schema.users.firstName },
    { order: "ASC", key: "middleName", schema: schema.users.middleName },
  ],
  primaryCursor: { order: "ASC", key: "id", schema: schema.users.id },
};

const cursor = generateCursor(cursorConfig);
```

Pass `...cursor.orderBy` to `.orderBy` and `cursor.where()` to `.where` on query-builder calls.

> [!IMPORTANT]
>
> for the first batch of results `cursor.where()` is empty,
>

## Querying

### Query Builder

```ts
const page1 = await db
  .select({
    lastName: schema.users.lastName,
    firstName: schema.users.firstName,
    middleName: schema.users.middleName,
    id: schema.users.id,
  })
  .from(schema.users)
  .orderBy(...cursor.orderBy) // Always include the order
  .where(cursor.where()) // .where() is called empty the first time, meaning "there's not previous records"
  .limit(page_size);
```

For the subsequent queries you can send the last previous record on `cursor.where`

```ts
const page2 = await db
  .select() // .select() can vary while it includes the needed data to create the cursor
  .from(schema.users)
  .orderBy(...cursor.orderBy)
  .where(cursor.where(page1.at(-1))) // last record of previous query (or any record "before: the one you want to start with)
  .limit(page_size);
```

or a token from the last item (useful to send to FE)

#### With token

```ts
const token = cursor.serialize(page2.at(-1)); // Send this string to FE
const pageFromToken = await db
  .select({
    lastName: schema.users.lastName,
    firstName: schema.users.firstName,
    middleName: schema.users.middleName,
    id: schema.users.id,
  })
  .from(schema.users)
  .orderBy(...cursor.orderBy)
  .where(cursor.where(token)) // parse() is already handled internally by cursor.where
  .limit(page_size);
```

### Query V1

#### Drizzle v0 (`db.query`)

```ts
const page1V0 = await db.query.users.findMany({
  columns: {
    lastName: true,
    firstName: true,
    middleName: true,
    id: true,
  },
  orderBy: cursor.orderBy,
  where: cursor.where(),
  limit: page_size,
});

const page2V0 = await db.query.users.findMany({
  columns: {
    lastName: true,
    firstName: true,
    middleName: true,
    id: true,
  },
  orderBy: cursor.orderBy,
  where: cursor.where(cursor.serialize(page1V0.at(-1))),
  limit: page_size,
});
```

#### Drizzle v1 (`db._query`) legacy

```ts
const page1V1 = await db._query.users.findMany({
  columns: {
    lastName: true,
    firstName: true,
    middleName: true,
    id: true,
  },
  orderBy: cursor.orderBy,
  where: cursor.where(),
  limit: page_size,
});

const page2V1 = await db._query.users.findMany({
  columns: {
    lastName: true,
    firstName: true,
    middleName: true,
    id: true,
  },
  orderBy: cursor.orderBy,
  where: cursor.where(cursor.serialize(page1V1.at(-1))),
  limit: page_size,
});
```

### Query V2

#### Drizzle v1 (`db.query`)

```ts
const page1V2 = await db.query.users.findMany({
  columns: {
    lastName: true,
    firstName: true,
    middleName: true,
    id: true,
  },
  orderBy: cursor.relations.orderBy,
  where: cursor.relations.where(),
  limit: page_size,
});

const page2V2 = await db.query.users.findMany({
  columns: {
    lastName: true,
    firstName: true,
    middleName: true,
    id: true,
  },
  orderBy: cursor.relations.orderBy,
  where: cursor.relations.where(cursor.serialize(page1V2.at(-1))),
  limit: page_size,
});
```

## where

`generateCursor` uses `cursor.where()` exactly for this rule:

- `cursor.where()` with **no args** means first page → returns `undefined`.
- `cursor.where(...)` with a **previous record** (`object`) or a **cursor string** (`token`) means next page.

Important: only keys in your cursor definition (`primaryCursor` + `cursors`) matter.  
Extra keys in rows are ignored.

```ts
const firstPage = await db
  .select({
    lastName: schema.users.lastName,
    firstName: schema.users.firstName,
    middleName: schema.users.middleName,
    id: schema.users.id,
  })
  .from(schema.users)
  .orderBy(...cursor.orderBy)
  .where(cursor.where()) // No args => first page.
  .limit(page_size);

const page2FromObject = await db
  .select({ id: schema.users.id })
  .from(schema.users)
  .orderBy(...cursor.orderBy)
  .where(cursor.where(firstPage.at(-1))) // Previous row object.
  .limit(page_size);

const token = cursor.serialize(firstPage.at(-1));

const page2FromToken = await db
  .select({ id: schema.users.id })
  .from(schema.users)
  .orderBy(...cursor.orderBy)
  .where(cursor.where(token)) // Token string from previous page - MOCK EXAMPLE you in reality would get from the API request.
  .limit(page_size);
```

## Custom parser + serializer

If the default `JSON.stringify/JSON.parse` pipeline is not enough, pass `parser` and `serializer` to `generateCursor`:

- `parser`: converts the decoded payload into a JavaScript object.
- `serializer`: converts your payload object into a string before encode.

Parser/serializer options (payload layer):

- [superjson](https://github.com/blitz-js/superjson)
- [devalue](https://github.com/sveltejs/devalue)
- [msgpackr](https://github.com/kriszyp/msgpackr)
- [flatted](https://github.com/WebReflection/flatted)
- [yaml](https://github.com/eemeli/yaml) / [js-yaml](https://github.com/nodeca/js-yaml)
- [toml](https://github.com/BinaryMuse/toml)
- [JSON5](https://github.com/json5/json5)
- [zipson](https://github.com/gregersrygg/zipson)
- [ZON](https://github.com/ZON-Format/zon-TS)
- [tron](https://tron-format.github.io/)
- [toon](https://github.com/toon-format/toon)
- [csv](https://github.com/adaltas/node-csv)
- etc (`serializer: (value: T) => string`, `parser: (value: string) => T`)

Example (from the extended tests):

```ts
import { generateCursor } from "drizzle-cursor";
import { parse, stringify } from "superjson";

const cursor = generateCursor(
  {
    primaryCursor: { key: "id", schema: users.id, order: "ASC" },
    cursors: [{ key: "slug", schema: users.slug, order: "ASC" }],
  },
  {
    serializer: (value) => `cur_${stringify(value)}`,
    parser: (value) => parse(value.slice(4)),
  },
);

const token = cursor.serialize({ id: 1, slug: "slug-01" });
const parsed = cursor.parse(token);
```

## Custom encoder + decoder

Use `encoder` and `decoder` when you need to post-process the full token string
(prefix, URL-safe base encoding, encryption, obfuscation, compression, etc.).

- `encoder`: transforms the serialized payload into the final token string.
- `decoder`: restores the serialized payload for `parser`.

Encoder/decoder options (token layer):

- `base64url` / `base-x` (`bun.toBase64`, `Buffer`, `base-x` alphabets).
- [base-x](https://github.com/cryptocoinjs/base-x)
- `AES` (`crypto.createCipheriv` / `createDecipheriv`).
- URL-safe wrappers and signatures (HMAC/JWT-like) to prevent tampering.
- custom prefixing/suffixing and checksums.
- [base64-js](https://github.com/beatgammit/base64-js)
- [base64url](https://github.com/joepie91/node-base64-url)
- [tweetnacl](https://github.com/dchest/tweetnacl-js) (for signing/encrypt-like workflows)
- etc (`encoder: (value: string) => string`, `decoder: (value: string) => string`)

`generateCursor` second argument shape (`options`):

```ts
type CursorRecord = Record<string, unknown>;

type CursorOptions<T extends CursorRecord = CursorRecord> = {
  decoder?: (value: string) => string;
  encoder?: (value: string) => string;
  parser?: (value: string) => T;
  serializer?: (value: T) => string;
  parse?: (cursor: string | null) => T | null;
  serialize?: (data?: T | null) => string | null;
};
```

Notes:

- `parser`, `serializer`, `encoder`, `decoder` are usually enough to customize the token pipeline.
- `parse` and `serialize` are advanced overrides (rarely needed) that replace the full internals:
  - `serialize`: build the full cursor token.
  - `parse`: read and validate the full cursor token.
- In 99% of cases, prefer `parser`/`serializer` (+ optional `encoder`/`decoder`) and keep `parse`/`serialize` as defaults.

```ts
import { generateCursor } from "drizzle-cursor";
import BaseX from "base-x";

const prefix = "cur_";
const baseX = BaseX("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");

const encoder = (value: string) => `${prefix}${baseX.encode(Buffer.from(value, "utf-8"))}`;
const decoder = (value: string) => {
  if (!value.startsWith(prefix)) {
    throw new Error("Invalid cursor token");
  }
  return Buffer.from(baseX.decode(value.slice(prefix.length))).toString("utf-8");
};

const cursor = generateCursor(
  {
    primaryCursor: { key: "id", schema: users.id, order: "ASC" },
    cursors: [{ key: "slug", schema: users.slug, order: "ASC" }],
  },
  { encoder, decoder },
);

const token = cursor.serialize({ id: 1, slug: "slug-01" });
const parsed = cursor.parse(token);
```

## SQL Expression Cursors

Instead of a table column (`schema`), you can use a raw Drizzle `sql` expression as a cursor. This is useful for sorting by computed or virtual values like case-insensitive names, concatenated fields, or any expression your database can evaluate.

```ts
import { sql } from "drizzle-orm";
import { generateCursor } from "drizzle-cursor";

const rankUpperName = sql<string>`${users.rank}::text || '-' || upper(${users.firstName})`;

const cursor = generateCursor({
  primaryCursor: { key: "id", schema: users.id, order: "ASC" },
  cursors: [
    { key: "rankUpperName", sql: rankUpperName, order: "ASC" },
  ],
});
```

The `key` must match a field in the result row so the token pipeline can read its value for pagination. Include the expression in your `select` to make it available:

```ts
const page1 = await db
  .select({
    id: users.id,
    firstName: users.firstName,
    rankUpperName, // same sql expression — makes it available in the row
  })
  .from(users)
  .orderBy(...cursor.orderBy)
  .where(cursor.where())
  .limit(page_size);

const page2 = await db
  .select({ id: users.id, firstName: users.firstName, rankUpperName })
  .from(users)
  .orderBy(...cursor.orderBy)
  .where(cursor.where(cursor.serialize(page1.at(-1))))
  .limit(page_size);
```

### SQL cursors with RQB v2 (`cursor.relations`)

When any cursor uses `sql`, `cursor.relations.orderBy` becomes a `() => SQL[]` callback instead of a plain `Record<string, "asc" | "desc">` — pass it directly to the RQB v2 `orderBy` option:

```ts
const page1 = await db.query.users.findMany({
  orderBy: cursor.relations.orderBy, // () => SQL[] when SQL cursors are present
  where: cursor.relations.where(),
  limit: page_size,
});
```

> [!NOTE]
>
> `cursor.relations.where()` with SQL expression cursors produces `{ RAW: ... }` conditions
> that work correctly in RQB v2 when the SQL expression does **not** reference the table through
> Drizzle's aliased context. For full portability across all query modes, prefer the query-builder
> path (`cursor.where()`) or RQB v1 (`db._query`) when paginating by SQL expressions.

### Named types

`TableCursor` and `SQLCursor` are exported for user-facing type annotations:

```ts
import type { CursorConfig, SQLCursor, TableCursor } from "drizzle-cursor";

const config: CursorConfig<SQLCursor> = {
  primaryCursor: { key: "id", sql: sql`${users.id}`, order: "ASC" },
};
```

## Contributing

Submit an Issue with a minimal reproducible example.

> PRs are welcome

Maintainers: release and prerelease workflow lives in `CONTRIBUTING.md`.

## License

MIT / Do whatever you want.
