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
  const cursorGenerated1 = generateCursor(cursorConfig);
  const data1 = await db
    .select({
      lastName: schema.users.lastName,
      firstName: schema.users.firstName,
      middleName: schema.users.middleName,
      id: schema.users.id,
    })
    .from(schema.users)
    .orderBy(...cursorGenerated1.orderBy)
    .where(cursorGenerated1.where)
    .limit(page_size);

  const last1 = data1.at(-1);

  if (!last1) {
    return;
  }

  console.log(data1);

  const cursorGenerated2 = generateCursor(cursorConfig, last1);
  const data2 = await db
    .select({
      lastName: schema.users.lastName,
      firstName: schema.users.firstName,
      middleName: schema.users.middleName,
      id: schema.users.id,
    })
    .from(schema.users)
    .orderBy(...cursorGenerated2.orderBy)
    .where(cursorGenerated2.where)
    .limit(page_size);

  const last2 = data2.at(-1);

  if (!last2) {
    return;
  }

  console.log("-- 2 --");
  console.log(data2);

  const cursorGenerated3 = generateCursor(cursorConfig, last2);
  const data3 = await db.query.users.findMany({
    columns: {
      lastName: true,
      firstName: true,
      middleName: true,
      id: true,
    },
    orderBy: cursorGenerated3.orderBy,
    where: cursorGenerated3.where,
    limit: page_size,
  });

  const last3 = data3.at(-1);

  if (!last3) {
    return;
  }

  console.log("-- 3 --");
  console.log(data3);
}

main();
