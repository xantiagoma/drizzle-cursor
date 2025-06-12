import "@total-typescript/ts-reset";

export function generateSubArrays<T>(arr: ReadonlyArray<T>): T[][] {
	const subArrays: T[][] = [];
	for (let i = 0; i < arr.length; i++) {
		subArrays.push([...arr.slice(0, i + 1)]);
	}
	return subArrays;
}

/**
 * decoder: similar to `atob()` but compatible with UTF-8 strings
 * converts a base64 encoded string to a UTF-8 string
 * @link https://developer.mozilla.org/en-US/docs/Web/API/atob
 */
export const decoder = (data: string) =>
	Buffer.from(data, "base64").toString("utf-8");

/**
 * encoder: similar to `btoa()` but compatible with UTF-8 strings
 * converts a UTF-8 string to a base64 encoded string
 * @link https://developer.mozilla.org/en-US/docs/Web/API/btoa
 */
export const encoder = (str: string) =>
	Buffer.from(str, "utf-8").toString("base64");

/**
 * parser: similar to `JSON.parse()`
 * converts a JSON string to a JavaScript object
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
 */
export const parser = JSON.parse;

/**
 * serializer: similar to `JSON.stringify()`
 * converts a JavaScript object to a JSON string
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
 */
export const serializer = JSON.stringify;

/* ────────────────────────────────────────────────────────────────────
   ISO-8601 full-date / date-time validator
   • Date………………  YYYY-MM-DD
   • Local time……  YYYY-MM-DD[T ]HH:mm[:ss[.sss]]
   • ‘Z’ or numeric offset ±HH:mm
   • Separator may be “T” or a single space.
   • Final check     → let the host parse the original string: if the
                       engine considers it invalid (e.g. Safari with the
                       space variant) we also reject it.
───────────────────────────────────────────────────────────────────── */

export const ISO_DATE_TIME_REGEX =
	/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(?:Z|([+-])(\d{2}):(\d{2}))?)?$/;

export function isValidDateOrDateTimeString(value: string): boolean {
	if (typeof value !== "string") {
		return false;
	}

	const m = ISO_DATE_TIME_REGEX.exec(value);
	if (!m) return false;

	const [
		,
		y,
		mo,
		d,
		hh = "00",
		mm = "00",
		ss = "00",
		sss = "0",
		tzSign,
		tzH = "00",
		tzM = "00",
	] = m;

	/* ---------- numeric conversion -------------------------------- */
	const year = Number(y);
	const month = Number(mo) - 1; // JS 0–11
	const day = Number(d);
	const hour = Number(hh);
	const minute = Number(mm);
	const sec = Number(ss);
	const milli = Number(sss.padEnd(3, "0")); // “7” → 700
	const offH = Number(tzH);
	const offM = Number(tzM);

	/* ---------- bounded fields ------------------------------------ */
	if (hour > 23 || minute > 59 || sec > 59) return false;
	if (tzSign) {
		if (offH > 14) return false;
		if (offM > 59) return false;
		if (offH === 14 && offM !== 0) return false; // only ±14:00 allowed
	}

	/* ---------- build UTC date & round-trip ----------------------- */
	let date = new Date(Date.UTC(year, month, day, hour, minute, sec, milli));

	if (
		Number.isNaN(date.getTime()) ||
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== month ||
		date.getUTCDate() !== day ||
		date.getUTCHours() !== hour ||
		date.getUTCMinutes() !== minute ||
		date.getUTCSeconds() !== sec ||
		date.getUTCMilliseconds() !== milli
	)
		return false;

	/* ---------- apply numeric offset ------------------------------ */
	if (tzSign) {
		const offsetMin = offH * 60 + offM;
		const sign = tzSign === "+" ? -1 : 1; // invert for Date
		date = new Date(date.getTime() + sign * offsetMin * 60_000);
	}

	/* ---------- honour host-engine parsing behaviour -------------- */
	const hostParsed = new Date(value);
	if (Number.isNaN(hostParsed.getTime())) return false;

	return true;
}

/* optional type-guard */
export function assertDateOrDateTime(v: string): asserts v is string {
	if (!isValidDateOrDateTimeString(v)) {
		throw new TypeError(`“${v}” is not a valid ISO-8601 date/time`);
	}
}
