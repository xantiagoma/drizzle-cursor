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
