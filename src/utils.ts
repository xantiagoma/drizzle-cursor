export function generateSubArrays<T>(arr: ReadonlyArray<T>): T[][] {
  const subArrays: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    subArrays.push([...arr.slice(0, i + 1)]);
  }
  return subArrays;
}
