import { generateCursor } from "../../src";
import { describe, expect, test } from "vitest";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { stringify, parse } from "superjson";

const table = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	firstName: text("first_name"),
	middleName: text("middle_name"),
	lastName: text("last_name"),
	phone: text("phone"),
	email: text("email"),
});

const prefix = "cur_";

describe("Custom parser and serializer", () => {
	test("superjson", () => {
		const item = {
			id: 1,
			firstName: "John",
			middleName: "Doe",
			lastName: "Smith",
			phone: "123456789",
			email: "johndoe",
		};

		const cursor = generateCursor(
			{
				cursors: [
					{ key: "firstName", schema: table.firstName, order: "DESC" },
					{ key: "lastName", schema: table.lastName },
					{ key: "middleName", schema: table.middleName, order: "DESC" },
				],
				primaryCursor: { key: "id", schema: table.id, order: "ASC" },
			},
			{
				parser: (text) => {
					return parse(text.slice(prefix.length));
				},
				serializer: (value) => {
					return prefix + stringify(value);
				},
			},
		);

		const cur = cursor.serialize(item);
		const parsed = cursor.parse(cur);
		expect(parsed?.id).toEqual(item.id);
		expect(parsed?.firstName).toEqual(item.firstName);
	});
});
