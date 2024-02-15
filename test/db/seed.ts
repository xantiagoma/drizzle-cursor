import "dotenv/config";

import{faker} from "@faker-js/faker";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

import Database from "better-sqlite3";
const seed = async () => {
  const sqlite = new Database("db.db");
  const db = drizzle(sqlite, { schema, logger: true });
  type User = typeof schema.users.$inferInsert
  const users: User[] = [];
  for (let i = 0; i < 100; i++) {
    users.push({
      firstName: faker.person.firstName(),
      middleName: faker.person.middleName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      postalZip: faker.location.zipCode(),
      region: faker.location.city(),
      country: faker.location.country(),
      list: faker.word.words({count: {min: 0, max: 10}}),
      text: faker.lorem.paragraph(),
      numberrange: faker.number.int({min: 0, max: 100}),
      currency: faker.finance.amount(),
      alphanumeric: faker.lorem.word(),
      bornDay: faker.date.between({from: new Date(1950, 1, 1), to: new Date(2000, 1, 1)}).toISOString(),
      maritalStatus: faker.helpers.arrayElement(["single", "married", "divorced", "widowed"]),
    });
  }

  const insertedUsers = await db.insert(schema.users).values(users).returning();

  console.log("Inserted users:", insertedUsers.length);
};

seed();
