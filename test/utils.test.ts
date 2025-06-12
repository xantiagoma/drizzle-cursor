import { describe, expect, test, it } from "vitest";

import { generateSubArrays, isValidDateOrDateTimeString } from "../src/utils";

describe("generateSubArrays", () => {
	test("empty array generates empty", () => {
		expect(generateSubArrays([])).to.have.length(0);
	});
	test("single element generates array of array with one element", () => {
		expect(generateSubArrays([1])).to.have.length(1);
		expect(generateSubArrays([1])).to.deep.equal([[1]]);
	});
	test("two elements generates array of array with two elements", () => {
		expect(generateSubArrays([1, 2])).to.have.length(2);
		expect(generateSubArrays([1, 2])).to.deep.equal([[1], [1, 2]]);
	});
	test("three elements generates array of array with three elements", () => {
		expect(generateSubArrays([1, 2, 3])).to.have.length(3);
		expect(generateSubArrays([1, 2, 3])).to.deep.equal([
			[1],
			[1, 2],
			[1, 2, 3],
		]);
	});
	test("works also with complex objects", () => {
		const obj1 = { a: 1 };
		const obj2 = { b: 2 };
		const obj3 = { c: 3 };
		expect(generateSubArrays([obj1, obj2, obj3])).to.have.length(3);
		expect(generateSubArrays([obj1, obj2, obj3])).to.deep.equal([
			[obj1],
			[obj1, obj2],
			[obj1, obj2, obj3],
		]);
	});
});

/* ────────────────────────────────────────────────────────────
   VALID SAMPLES
   ───────────────────────────────────────────────────────── */

const valid: string[] = [
	/* plain dates */
	"1970-01-01",
	"2000-02-29", // leap: divisible by 400
	"2024-02-29", // leap: typical quad-year
	"9999-12-31",

	/* local date-time (T) */
	"2022-03-29T00:00",
	"2022-03-29T23:59",
	"2022-03-29T23:59:59",
	"2022-03-29T23:59:59.9",
	"2022-03-29T23:59:59.99",
	"2022-03-29T23:59:59.999",

	/* Zulu */
	"2022-03-29T12:30Z",
	"2022-03-29T12:30:45Z",
	"2022-03-29T12:30:45.123Z",

	/* numeric offsets – positive */
	"2022-03-29T12:30+00:00",
	"2022-03-29T12:30+05:30",
	"2022-03-29T12:30:45+05:30",
	"2022-03-29T12:30:45.123+05:30",
	"2022-03-29T12:30+14:00",

	/* numeric offsets – negative */
	"2022-03-29T12:30-00:00",
	"2022-03-29T12:30-05:00",
	"2022-03-29T12:30:45.1-05:15",
	"2022-03-29T12:30:45.12-05:45",
	"2022-03-29T12:30:45.123-14:00",

	/* last millisecond of year */
	"2022-12-31T23:59:59.999Z",

	/* ─── Separator = single space (if host understands it) ─── */
	"2022-03-29 12:30",
	"2022-03-29 12:30:45",
	"2022-03-29 12:30:45.123",
	"2022-03-29 12:30Z",
	"2022-03-29 12:30+05:00",
	"2022-03-29 12:30:45+05:30",
];

/* ────────────────────────────────────────────────────────────
   INVALID SAMPLES
   ───────────────────────────────────────────────────────── */

const invalid: string[] = [
	/* missing pieces / wrong structure */
	"",
	"2022",
	"2022-03",
	"20220329",
	"2022-03-29T", // dangling T
	"2022-03-29T12", // HH only
	"2022-03-29T12:30:", // dangling :
	"2022-03-29T12:30:45.", // dangling .
	"2022-03-29T12:30:45Z ", // trailing space
	"2022-03-29\t12:30", // tab separator
	"2022-03-29\n12:30", // newline separator
	"2022-03-29 12:30 ", // trailing space

	/* wrong delimiters */
	"2022/03/29",

	/* impossible dates */
	"2022-02-29", // not leap
	"2022-04-31",
	"2022-00-10",
	"2022-13-01",
	"2022-01-00",
	"2022-01-32",

	/* impossible times */
	"2022-03-29T24:00",
	"2022-03-29T12:60",
	"2022-03-29T12:30:60",
	"2022-03-29T12:30:45.1234",

	/* impossible offsets */
	"2022-03-29T12:30+24:00",
	"2022-03-29T12:30+14:01",
	"2022-03-29T12:30+05:60",
	"2022-03-29T12:30-14:30",

	/* out of JS safe range */
	"100000-01-01",
	"-100000-01-01",
];

describe("isValidDateOrDateTimeString", () => {
	it.each(valid)("accepts %s", (s) =>
		expect(isValidDateOrDateTimeString(s)).toBe(true),
	);
	it.each(invalid)("rejects %s", (s) =>
		expect(isValidDateOrDateTimeString(s)).toBe(false),
	);
});
