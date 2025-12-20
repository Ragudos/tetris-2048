/**
 * @file general.spec.ts
 * @module src/modules/util/general
 * @description
 * BDD-style tests for general utility functions:
 * - `range`: generates a random number between start and end
 * - `getErrorMsg`: converts unknown errors into strings
 * - `mergeDefaults`: recursively merges a partial object into defaults
 */

import { describe, expect, it } from "vitest";
import { getErrorMsg, mergeDefaults, range } from "@/modules/util/general";
import type { DeepPartial } from "@/types/DeepPartial";

describe("general utilities", () => {
  describe("range()", () => {
    it("should return a number within the inclusive range", () => {
      for (let i = 0; i < 100; i++) {
        const val = range(5, 10);
        expect(val).toBeGreaterThanOrEqual(5);
        expect(val).toBeLessThanOrEqual(10);
      }
    });

    it("should return the start value when start === end", () => {
      const val = range(7, 7);
      expect(val).toBe(7);
    });
  });

  describe("getErrorMsg()", () => {
    it("should return the message from an Error object", () => {
      const err = new Error("Test error");
      expect(getErrorMsg(err)).toBe("Test error");
    });

    it("should return a string as-is if a string is provided", () => {
      expect(getErrorMsg("Custom error")).toBe("Custom error");
    });

    it("should return a default message for unknown types", () => {
      expect(getErrorMsg(42)).toBe("Something went wrong: 42");
      expect(getErrorMsg({ code: 500 })).toBe("Something went wrong: [object Object]");
      expect(getErrorMsg(null)).toBe("Something went wrong: null");
    });
  });

  describe("mergeDefaults()", () => {
    it("should return defaults if partial is undefined", () => {
      const defaults = { a: 1, b: 2 };
      expect(mergeDefaults(defaults)).toEqual(defaults);
    });

    it("should overwrite top-level properties with partial values", () => {
      const defaults = { a: 1, b: 2 };
      const partial = { b: 3 };
      const merged = mergeDefaults(defaults, partial);
      expect(merged).toEqual({ a: 1, b: 3 });
    });

    it("should recursively merge nested objects", () => {
      const defaults = { a: 1, b: { x: 10, y: 20 } };
      const partial = { b: { y: 30 } };
      const merged = mergeDefaults(defaults, partial);
      expect(merged).toEqual({ a: 1, b: { x: 10, y: 30 } });
    });

    it("should not mutate the original defaults object", () => {
      const defaults = { a: 1, b: { x: 10 } };
      const partial = { b: { x: 20 } };
      const merged = mergeDefaults(defaults, partial);
      expect(defaults.b.x).toBe(10);
      expect(merged.b.x).toBe(20);
    });

    it("should replace non-object properties", () => {
      const defaults = { a: 1, b: { x: 10 } };
      const partial = { b: 42 } as DeepPartial<typeof defaults>;
      const merged = mergeDefaults(defaults, partial);
      expect(merged).toEqual({ a: 1, b: 42 });
    });
  });
});
