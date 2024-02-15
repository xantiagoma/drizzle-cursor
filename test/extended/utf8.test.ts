import { describe, test, expect } from "vitest";
import { atob as customAtoB, btoa as customBtoA} from "../../src/utils";
const {atob: globalAtoB, btoa: globalBtoA } = global;

describe("utf8", () => {
    describe("atob", () => {
        test("custom", () => {
            expect(customAtoB("aGVsbG8gd29ybGQ=")).toBe("hello world");
        });
        test("global", () => {
            expect(globalAtoB("aGVsbG8gd29ybGQ=")).toBe("hello world");
        });

        test("custom with japanese", () => {
            expect(customAtoB("aGV5LCDjgZPjgpPjgavjgaHjga/kuJbnlYw=")).toBe("hey, こんにちは世界");
        });

        test("global with japanese", () => {
            expect(globalAtoB("aGV5LCDjgZPjgpPjgavjgaHjga/kuJbnlYw=")).not.toBe("hey, こんにちは世界");
        });
    });

    describe("btoa", () => {
        test("custom", () => {
            expect(customBtoA("hello world")).toBe("aGVsbG8gd29ybGQ=");
        });
        test("global", () => {
            expect(globalBtoA("hello world")).toBe("aGVsbG8gd29ybGQ=");
        });

        test("custom with japanese", () => {
            expect(customBtoA("hey, こんにちは世界")).toBe("aGV5LCDjgZPjgpPjgavjgaHjga/kuJbnlYw=");
        });

        test("global with japanese", () => {
            expect(() => globalBtoA("hey, こんにちは世界")).not.toBe("aGV5LCDjgZPjgpPjgavjgaHjga/kuJbnlYw=");
        });
    });
});
