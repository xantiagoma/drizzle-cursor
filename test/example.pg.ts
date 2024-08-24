import {
	pgTable,
	text,
	serial,
	varchar,
	time,
	timestamp,
	date,
} from "drizzle-orm/pg-core";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import path from "node:path";
import { da, faker } from "@faker-js/faker";
import generateCursor from "../src";
import { sql } from "drizzle-orm";
import dayjs from "dayjs";

const usersTable = pgTable("users", {
	id: serial("id").primaryKey(),
	slug: varchar("slug").unique(),
	title: varchar("title"),
	content: text("content"),
	time1: time("time1"),
	time2: time("time2", { withTimezone: true }),
	time3: time("time3", { precision: 6 }),
	time4: time("time4", { precision: 6, withTimezone: true }),
	time5: time("time5").defaultNow(),
	timestamp1: timestamp("timestamp1"),
	timestamp2: timestamp("timestamp2", { withTimezone: true }),
	timestamp3: timestamp("timestamp3", { precision: 6 }),
	timestamp4: timestamp("timestamp4", { precision: 6, withTimezone: true }),
	timestamp5: timestamp("timestamp5").defaultNow(),
	date1: date("date1"),
	date2: date("date2", { mode: "string" }),
	date3: date("date3", { mode: "date" }),
	date4: date("date4").defaultNow(),
	date5: date("date5", { mode: "string" }).defaultNow(),
	date6: date("date6", { mode: "date" }).defaultNow(),
});

const schema = {
	users: usersTable,
} as const;

const client = new PGlite();

export const db = drizzle(client, { schema, logger: true });
const migrationsFolder = path.join(__dirname, "example.pg/migrations");

async function main() {
	await migrate(db, { migrationsFolder });

	await db.execute(sql`
	    CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY NOT NULL,
			slug TEXT UNIQUE,
			title TEXT,
			content TEXT,
			time1 TIME,
			time2 TIME WITH TIME ZONE,
			time3 TIME(6),
			time4 TIME(6) WITH TIME ZONE,
			time5 TIME DEFAULT NOW(),
			timestamp1 TIMESTAMP,
			timestamp2 TIMESTAMP WITH TIME ZONE,
			timestamp3 TIMESTAMP(6),
			timestamp4 TIMESTAMP(6) WITH TIME ZONE,
			timestamp5 TIMESTAMP DEFAULT NOW(),
			date1 DATE,
			date2 TEXT,
			date3 DATE,
			date4 DATE DEFAULT NOW(),
			date5 TEXT DEFAULT NOW(),
			date6 DATE DEFAULT NOW()
	    );
	`);

	const items: (typeof usersTable.$inferInsert)[] = Array.from(
		{ length: 100 },
		(_, k) => {
			return {
				slug: faker.lorem.slug(),
				title: faker.lorem.words(),
				content: faker.lorem.sentences(),
				time1: faker.datatype.boolean()
					? null
					: dayjs(faker.date.anytime()).format("HH:mm:ss.SSS"),
				time2: faker.datatype.boolean()
					? null
					: dayjs(faker.date.anytime()).format("HH:mm:ss.SSS"),
				time3: faker.datatype.boolean()
					? null
					: dayjs(faker.date.anytime()).format("HH:mm:ss.SSS"),
				time4: faker.datatype.boolean()
					? null
					: dayjs(faker.date.anytime()).format("HH:mm:ss.SSS"),
				time5: faker.datatype.boolean()
					? null
					: dayjs(faker.date.anytime()).format("HH:mm:ss.SSS"),
				timestamp1: faker.datatype.boolean()
					? null
					: faker.date.past({ years: 10 }),
				timestamp2: faker.datatype.boolean()
					? null
					: faker.date.past({ years: 10 }),
				timestamp3: faker.datatype.boolean()
					? null
					: faker.date.past({ years: 10 }),
				timestamp4: faker.datatype.boolean()
					? null
					: faker.date.past({ years: 10 }),
				timestamp5: faker.datatype.boolean()
					? null
					: faker.date.past({ years: 10 }),
				date1: faker.datatype.boolean()
					? null
					: dayjs(faker.date.past({ years: 10 })).format("YYYY-MM-DD"),
				date2: faker.datatype.boolean()
					? null
					: dayjs(faker.date.past({ years: 10 })).format("YYYY-MM-DD"),
				date3: faker.datatype.boolean() ? null : faker.date.past({ years: 10 }),
			};
		},
	);

	await db.insert(usersTable).values(items);

	// const allItems = await db.query.users.findMany();
	// console.table(allItems);

	const cursor = generateCursor({
		primaryCursor: { key: "id", schema: usersTable.id, order: "ASC" },
		cursors: [
			{ key: "time1", schema: usersTable.time1, order: "ASC" },
			{ key: "time2", schema: usersTable.time2, order: "ASC" },
			{ key: "time3", schema: usersTable.time3, order: "ASC" },
			{ key: "time4", schema: usersTable.time4, order: "ASC" },
			{ key: "time5", schema: usersTable.time5, order: "ASC" },
			{ key: "timestamp1", schema: usersTable.timestamp1, order: "ASC" },
			{ key: "timestamp2", schema: usersTable.timestamp2, order: "ASC" },
			{ key: "timestamp3", schema: usersTable.timestamp3, order: "ASC" },
			{ key: "timestamp4", schema: usersTable.timestamp4, order: "ASC" },
			{ key: "timestamp5", schema: usersTable.timestamp5, order: "ASC" },
			{ key: "date1", schema: usersTable.date1, order: "ASC" },
			{ key: "date2", schema: usersTable.date2, order: "ASC" },
			{ key: "date3", schema: usersTable.date3, order: "ASC" },
		],
	});

	const PAGE_SIZE = 10;

	const data1 = await db
		.select()
		.from(usersTable)
		.orderBy(...cursor.orderBy)
		.where(cursor.where())
		.limit(PAGE_SIZE);
	console.table(data1);

	const last1 = data1.at(-1);
	console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
	console.table(last1);
	console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

	const data2 = await db
		.select()
		.from(usersTable)
		.orderBy(...cursor.orderBy)
		.where(cursor.where(last1))
		.limit(PAGE_SIZE);

	console.table(data2);
}

main().catch((err) => {
	console.error("❌ test failed");
	console.error(err);
	process.exit(1);
});
