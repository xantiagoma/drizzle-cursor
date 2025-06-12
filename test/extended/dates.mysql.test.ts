import { generateCursor } from "../../src";
import { and, asc, desc, eq, gt, lt, or } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import {
	serial,
	mysqlTable,
	text,
	time,
	timestamp,
	date,
	datetime,
	year,
} from "drizzle-orm/mysql-core";

const table = mysqlTable("users", {
	id: serial("id").primaryKey(),
	firstName: text("first_name").notNull(),
	middleName: text("middle_name").notNull(),
	lastName: text("last_name").notNull(),
	date1: date("date_1").notNull(),
	date2: date("date_2", { mode: "string" }).notNull(),
	date3: date("date_3", { mode: "date" }).notNull(),
	datetime1: datetime("datetime_1").notNull(),
	datetime2: datetime("datetime_2", { mode: "string" }).notNull(),
	datetime3: datetime("datetime_3", { mode: "date" }).notNull(),
	datetime4: datetime("datetime_4", { mode: "string", fsp: 3 }).notNull(),
	datetime5: datetime("datetime_5", { mode: "date", fsp: 3 }).notNull(),
	time1: time("time_1").notNull(),
	time2: time("time_2", { fsp: 3 }).notNull(),
	year1: year("year_1").notNull(),
	timestamp1: timestamp("timestamp_1").notNull(),
	timestamp2: timestamp("timestamp_2", { mode: "string" }).notNull(),
	timestamp3: timestamp("timestamp_3", { mode: "date" }).notNull(),
	timestamp4: timestamp("timestamp_4", { mode: "string", fsp: 3 }).notNull(),
	timestamp5: timestamp("timestamp_5", { mode: "date", fsp: 3 }).notNull(),
});

describe("dates", () => {
	test("mysql", () => {
		const now = new Date();
		const item: typeof table.$inferSelect = {
			id: 1,
			firstName: "John",
			lastName: "Doe",
			middleName: "Smith",
			date1: now,
			date2: now.toISOString(),
			date3: now,
			datetime1: now,
			datetime2: now.toISOString(),
			datetime3: now,
			datetime4: now.toISOString(),
			datetime5: now,
			time1: "12:00:00",
			time2: "12:00:00.000",
			year1: 2021,
			timestamp1: now,
			timestamp2: now.toISOString(),
			timestamp3: now,
			timestamp4: now.toISOString(),
			timestamp5: now,
		};

		const cursor = generateCursor({
			cursors: [
				{ key: "date1", schema: table.date1, order: "DESC" },
				{ key: "datetime1", schema: table.datetime1 },
				{ key: "timestamp1", schema: table.timestamp1, order: "DESC" },
			],
			primaryCursor: { key: "id", schema: table.id, order: "ASC" },
		});

		expect(cursor.orderBy).toEqual([
			desc(table.date1),
			asc(table.datetime1),
			desc(table.timestamp1),
			asc(table.id),
		]);
		expect(cursor.where(item)).toEqual(
			or(
				and(lt(table.date1, item.date1)),
				and(eq(table.date1, item.date1), gt(table.datetime1, item.datetime1)),
				and(
					eq(table.date1, item.date1),
					eq(table.datetime1, item.datetime1),
					lt(table.timestamp1, item.timestamp1),
				),
				and(
					eq(table.date1, item.date1),
					eq(table.datetime1, item.datetime1),
					eq(table.timestamp1, item.timestamp1),
					gt(table.id, item.id),
				),
			),
		);
	});
});
