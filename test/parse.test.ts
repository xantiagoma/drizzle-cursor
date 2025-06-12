import { type CursorConfig, generateCursor, parse, serialize } from "../src";
import { and, asc, desc, eq, gt, lt, or } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

describe("cursors", () => {
	const table = sqliteTable("users", {
		id: integer("id").primaryKey({ autoIncrement: true }),
		firstName: text("first_name"),
		middleName: text("middle_name"),
		lastName: text("last_name"),
		phone: text("phone"),
		email: text("email"),
	});

	const config: CursorConfig = {
		cursors: [
			{ key: "firstName", schema: table.firstName, order: "DESC" },
			{ key: "lastName", schema: table.lastName },
			{ key: "middleName", schema: table.middleName, order: "DESC" },
		],
		primaryCursor: { key: "id", schema: table.id, order: "ASC" },
	};

	const data = {
		id: 1,
		firstName: "John",
		middleName: "Doe",
		lastName: "Smith",
		phone: "1234567890",
		email: "john@doe.com",
	};

	const cursorToken =
		"eyJpZCI6MSwiZmlyc3ROYW1lIjoiSm9obiIsImxhc3ROYW1lIjoiU21pdGgiLCJtaWRkbGVOYW1lIjoiRG9lIn0=";

	describe("parse", () => {
		test("parses a cursor", () => {
			expect(parse(config, cursorToken)).to.deep.equal({
				// Not email or phono in the cursor
				id: data.id,
				firstName: data.firstName,
				middleName: data.middleName,
				lastName: data.lastName,
			});
		});
	});

	describe("parse & serialize", () => {
		test("generates the same cursor", () => {
			expect(serialize(config, parse(config, cursorToken))).to.equal(
				cursorToken,
			);
		});
	});

	describe("parse & generateCursor", () => {
		test("generates cursor with parse", () => {
			const cursor = generateCursor(config);
			expect(cursor.orderBy).toEqual([
				desc(table.firstName),
				asc(table.lastName),
				desc(table.middleName),
				asc(table.id),
			]);

			expect(cursor.where(data)).toEqual(
				or(
					and(lt(table.firstName, data.firstName)),
					and(
						eq(table.firstName, data.firstName),
						gt(table.lastName, data.lastName),
					),
					and(
						eq(table.firstName, data.firstName),
						eq(table.lastName, data.lastName),
						lt(table.middleName, data.middleName),
					),
					and(
						eq(table.firstName, data.firstName),
						eq(table.lastName, data.lastName),
						eq(table.middleName, data.middleName),
						gt(table.id, data.id),
					),
				),
			);
		});

		test("generates cursor with token directly", () => {
			const _cursor = generateCursor(config);
			expect(_cursor.orderBy).toEqual([
				desc(table.firstName),
				asc(table.lastName),
				desc(table.middleName),
				asc(table.id),
			]);

			expect(_cursor.where()).toEqual(undefined);
			expect(_cursor.where(cursorToken)).toEqual(
				or(
					and(lt(table.firstName, "John")),
					and(eq(table.firstName, "John"), gt(table.lastName, "Smith")),
					and(
						eq(table.firstName, "John"),
						eq(table.lastName, "Smith"),
						lt(table.middleName, "Doe"),
					),
					and(
						eq(table.firstName, "John"),
						eq(table.lastName, "Smith"),
						eq(table.middleName, "Doe"),
						gt(table.id, 1),
					),
				),
			);
		});

		test("where with token or data object should generate the same cursor", () => {
			const cursor = generateCursor(config);
			expect(cursor.where(data)).toEqual(cursor.where(serialize(config, data)));
			expect(cursor.where(data)).toEqual(cursor.where(cursor.serialize(data)));
			expect(cursor.where(data)).toEqual(cursor.where(cursorToken));
		});
	});
});
