import { generateCursor } from "../../src";
import { describe, expect, test } from "vitest";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import BaseX from "base-x";
import * as crypto from "node:crypto";

const table = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	firstName: text("first_name"),
	middleName: text("middle_name"),
	lastName: text("last_name"),
	phone: text("phone"),
	email: text("email"),
});

const prefix = "cur_";
const salt = "this_salt";

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text: string): string {
	const cipher = crypto.createCipheriv(algorithm, key, iv);
	let encrypted = cipher.update(salt + text, "utf-8", "hex");
	encrypted += cipher.final("hex");
	return prefix + encrypted;
}

function decrypt(encryptedText: string): string {
	if (!encryptedText.startsWith(prefix)) {
		throw new Error("Invalid token");
	}
	const encryptedContent = encryptedText.slice(prefix.length);
	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	let decrypted = decipher.update(encryptedContent, "hex", "utf-8");
	decrypted += decipher.final("utf-8");
	decrypted = decrypted.slice(salt.length);
	return decrypted;
}

describe("Custom decoder and encoder", () => {
	test("crypto", () => {
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
				decoder: (data) => {
					return decrypt(data);
				},
				encoder: (data) => {
					return encrypt(data);
				},
			},
		);

		const cur = cursor.serialize(item);
		expect(cur).toMatch(new RegExp(`^${prefix}`));
		const parsed = cursor.parse(cur);
		expect(parsed?.id).toEqual(item.id);
		expect(parsed?.firstName).toEqual(item.firstName);
	});

	test("base-x (base-67)", () => {
		const BASE67_Alphabet =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~";
		const base67 = BaseX(BASE67_Alphabet);

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
				decoder: (data) => {
					const slicedData = data.slice(prefix.length);
					const uintA = base67.decode(slicedData);
					let string = new TextDecoder().decode(uintA);
					string = string.slice(salt.length);
					return string;
				},
				encoder: (data) => {
					const uintA = new TextEncoder().encode(salt + data);
					const string = base67.encode(uintA);
					return prefix + string;
				},
			},
		);

		const cur = cursor.serialize(item);
		expect(cur).toMatch(new RegExp(`^${prefix}`));
		const parsed = cursor.parse(cur);
		expect(parsed?.id).toEqual(item.id);
		expect(parsed?.firstName).toEqual(item.firstName);
	});
});
