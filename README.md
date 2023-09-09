# drizzle-cursor

Utils to generate cursor based pagination on Drizzle ORM

Check example at: [test/example.ts](./test/example.ts)

Use like:

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

const page2 = await db
  .select() // .select() can vary while includes the needed data to create next curso (the same as the tables listed in primaryCursor and cursors)
  .from(schema.users)
  .orderBy(...cursor.orderBy)
  .where(cursor.where(page1.at(-1))) // last record of previous query (or any record "before: the one you want to start with)
  .limit(page_size);

const lastToken = cursor.serialize(page2.at(-1)); // use serialize method/function to send tokens to your FE
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