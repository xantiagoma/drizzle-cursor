import { CursorConfig, generateCursor } from "../src";
import { db, schema } from "./db";

const page_size = 10;

const cursorConfig: CursorConfig = {
  cursors: [
    { order: "ASC", key: "lastName", schema: schema.users.lastName },
    { order: "ASC", key: "firstName", schema: schema.users.firstName },
    { order: "ASC", key: "middleName", schema: schema.users.middleName },
  ],
  primaryCursor: { order: "ASC", key: "id", schema: schema.users.id },
};

async function main() {
  const cursor = generateCursor(cursorConfig);

  const data1 = await db
    .select({
      lastName: schema.users.lastName,
      firstName: schema.users.firstName,
      middleName: schema.users.middleName,
      id: schema.users.id,
    })
    .from(schema.users)
    .orderBy(...cursor.orderBy)
    .where(cursor.where())
    .limit(page_size);

  const last1 = data1.at(-1);

  if (!last1) {
    return;
  }

  console.log(data1);

  const data2 = await db
    .select({
      lastName: schema.users.lastName,
      firstName: schema.users.firstName,
      middleName: schema.users.middleName,
      id: schema.users.id,
    })
    .from(schema.users)
    .orderBy(...cursor.orderBy)
    .where(cursor.where(last1))
    .limit(page_size);

  const last2 = data2.at(-1);

  if (!last2) {
    return;
  }

  console.log("-- 2 --");
  console.log(data2);

  const data3 = await db.query.users.findMany({
    columns: {
      lastName: true,
      firstName: true,
      middleName: true,
      id: true,
    },
    orderBy: cursor.orderBy,
    where: cursor.where(last2),
    limit: page_size,
  });

  const last3 = data3.at(-1);

  if (!last3) {
    return;
  }

  console.log("-- 3 --");
  console.log(data3);

  const last3CursorString = cursor.serialize(last3);
  const data4 = await db
    .select({
      lastName: schema.users.lastName,
      firstName: schema.users.firstName,
      middleName: schema.users.middleName,
      id: schema.users.id,
    })
    .from(schema.users)
    .orderBy(...cursor.orderBy)
    .where(cursor.where(last3CursorString))
    .limit(page_size);

  const last4 = data4.at(-1);

  if (!last4) {
    return;
  }

  console.log("-- 4 --");
  console.log({ last3CursorString });
  console.log(data4);
}

main();
