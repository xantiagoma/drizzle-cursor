import "@total-typescript/ts-reset";

export function generateSubArrays<T>(arr: ReadonlyArray<T>): T[][] {
  const subArrays: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    subArrays.push([...arr.slice(0, i + 1)]);
  }
  return subArrays;
}

/**
 * Encodes a string of data using base-64 encoding.
 */
export const atob = (data: string) => Buffer.from(data, 'base64').toString('utf-8')


/**
 * Decodes a string of data which has been encoded using base-64 encoding.
 */
export const btoa = (str:string) => Buffer.from(str, 'utf-8').toString('base64')