import "@total-typescript/ts-reset";

import type { CursorConfig } from "./types";
import {
	encoder as _encoder,
	serializer as _serializer,
	isValidDateOrDateTimeString,
} from "./utils";

/**
 * serialize:
 * takes a JavaScript object and returns a cursor
 * useful to generate token to the FE client
 */
export function serialize<
	T extends Record<string, unknown> = Record<string, unknown>,
>(
	{ primaryCursor, cursors = [] }: CursorConfig,
	data?: T | null,
	encoder = _encoder,
	serializer = _serializer,
): string | null {
	if (!data) {
		return null;
	}

	const keys = [primaryCursor, ...cursors].map((cursor) => cursor.key);
	const item = keys.reduce(
		(acc, key) => {
			let value = data[key];
			// Handle Date objects
			if (typeof value === "string" && isValidDateOrDateTimeString(value)) {
				value = new Date(value).toISOString();
			}
			if (value instanceof Date) {
				value = value.toISOString();
			}
			acc[key] = value;
			return acc;
		},
		{} as Record<string, unknown>,
	);

	return encoder(serializer(item));
}

export default serialize;
