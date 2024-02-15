# drizzle-cursor

Utils to generate cursor based pagination for [`drizzle-orm`](https://github.com/drizzle-team/drizzle-orm)

| :zap: Supports *any* number of cursors.  |
|------------------------------------------|

Check example at: [test/example.ts](./test/example.ts)

## Installation

```sh
npm install drizzle-cursor
```

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

Pass `...cursor.orderBy` to `.orderBy` and `cursor.where()` to `.where` on `db.select` chained methods (also works with `db.query`).

> [!IMPORTANT] 
>
> for the first batch of results `cursor.where()` is empty,
>

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

For the sub-sequent queries you can send the last previous record on `cursor.where`

```ts
const page2 = await db
  .select() // .select() can vary while includes the needed data to create next curso (the same as the tables listed in primaryCursor and cursors)
  .from(schema.users)
  .orderBy(...cursor.orderBy)
  .where(cursor.where(page1.at(-1))) // last record of previous query (or any record "before: the one you want to start with)
  .limit(page_size);
```

or the token of the item (useful to send/receive from the FE)

```ts
const lastToken = cursor.serialize(page2.at(-1)); // use serialize method/function to send tokens to your FE

// if you want to convert back the token to a object:
const lastItem = cursor.parse(lastToken); // use parse method/function to transform back in an object

const page3 = await db.query.users.findMany({
  // It also works with Relational Queries
  columns: {
    // Be sure to include the data needed to create the cursor if using columns
    lastName: true,
    firstName: true,
    middleName: true,
    id: true,
  },
  orderBy: cursor.orderBy, // no need to destructure here
  where: cursor.where(lastToken), // .where() also accepts the string token directly, no need to pre-parse it (at least you want to run extra validations)
  limit: page_size,
});

```

## Contributing

Submit an Issue with a minimal reproducible example.

> PRs are welcome

## License

MIT / Do whatever you want.