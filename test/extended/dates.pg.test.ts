import { generateCursor } from "../../src";
import { and, asc, desc, eq, gt, lt, or } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import {
	serial,
	pgTable,
	text,
	time,
	timestamp,
	date,
} from "drizzle-orm/pg-core";

const table = pgTable("users", {
	id: serial("id").primaryKey(),
	firstName: text("first_name").notNull(),
	middleName: text("middle_name").notNull(),
	lastName: text("last_name").notNull(),
	time1: time("time_1").notNull(),
	time2: time("time_2", { withTimezone: true }).notNull(),
	time3: time("time_3", { precision: 3 }).notNull(),
	time4: time("time_4", { withTimezone: true, precision: 3 }).notNull(),
	timestamp1: timestamp("timestamp_1").notNull(),
	timestamp2: timestamp("timestamp_2", { withTimezone: true }).notNull(),
	timestamp3: timestamp("timestamp_3", { precision: 3 }).notNull(),
	timestamp4: timestamp("timestamp_4", {
		withTimezone: true,
		precision: 3,
	}).notNull(),
	date1: date("date_1").notNull(),
	date2: date("date_2", { mode: "string" }).notNull(),
	date3: date("date_3", { mode: "date" }).notNull(),
});

describe("dates", () => {
	test("pg", () => {
		const now = new Date();
		const item: typeof table.$inferSelect = {
			id: 1,
			firstName: "John",
			lastName: "Doe",
			middleName: "Smith",
			time1: "12:00:00",
			time2: "12:00:00",
			time3: "12:00:00",
			time4: "12:00:00",
			timestamp1: now,
			timestamp2: now,
			timestamp3: now,
			timestamp4: now,
			date1: now.toISOString(),
			date2: now.toISOString(),
			date3: now,
		};

		const cursor = generateCursor({
			cursors: [
				{ key: "time1", schema: table.time1, order: "DESC" },
				{ key: "timestamp1", schema: table.timestamp1 },
				{ key: "date1", schema: table.date1, order: "DESC" },
			],
			primaryCursor: { key: "id", schema: table.id, order: "ASC" },
		});

		expect(cursor.orderBy).toEqual([
			desc(table.time1),
			asc(table.timestamp1),
			desc(table.date1),
			asc(table.id),
		]);
		expect(cursor.where(item)).toEqual(
			or(
				and(lt(table.time1, item.time1)),
				and(eq(table.time1, item.time1), gt(table.timestamp1, item.timestamp1)),
				and(
					eq(table.time1, item.time1),
					eq(table.timestamp1, item.timestamp1),
					lt(table.date1, item.date1),
				),
				and(
					eq(table.time1, item.time1),
					eq(table.timestamp1, item.timestamp1),
					eq(table.date1, item.date1),
					gt(table.id, item.id),
				),
			),
		);
	});
});
