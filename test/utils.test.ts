import { describe, expect, test } from "vitest";

import { generateSubArrays } from "../src/utils";

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
