import { describe, it, expect } from "vitest";
import { isSquareMatrix, rotateMatrix } from "@util/matrix";
import { ROTATION } from "@/constants";

describe("MatrixUtils", () => {
  describe("isSquareMatrix", () => {
    it("returns true for a square matrix", () => {
      const matrix = [
        [1, 2],
        [3, 4],
      ];
      expect(isSquareMatrix(matrix)).toBe(true);
    });

    it("returns false for a non-square matrix", () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      expect(isSquareMatrix(matrix)).toBe(false);
    });

    it("returns true for empty matrix", () => {
      expect(isSquareMatrix([])).toBe(true);
    });

    it("returns false if rows have different lengths", () => {
      const matrix = [[1, 2], [3]];
      expect(isSquareMatrix(matrix)).toBe(false);
    });
  });

  describe("rotateMatrix", () => {
    it("rotates a 2x2 matrix clockwise", () => {
      const matrix = [
        [1, 2],
        [3, 4],
      ];
      const expected = [
        [3, 1],
        [4, 2],
      ];
      expect(rotateMatrix(ROTATION.CLOCKWISE, matrix)).toEqual(expected);
    });

    it("rotates a 2x2 matrix counter-clockwise", () => {
      const matrix = [
        [1, 2],
        [3, 4],
      ];
      const expected = [
        [2, 4],
        [1, 3],
      ];
      expect(rotateMatrix(ROTATION.COUNTER_CLOCKWISE, matrix)).toEqual(
        expected
      );
    });

    it("rotates a 3x3 matrix clockwise", () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const expected = [
        [7, 4, 1],
        [8, 5, 2],
        [9, 6, 3],
      ];
      expect(rotateMatrix(ROTATION.CLOCKWISE, matrix)).toEqual(expected);
    });

    it("rotates a 3x3 matrix counter-clockwise", () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const expected = [
        [3, 6, 9],
        [2, 5, 8],
        [1, 4, 7],
      ];
      expect(rotateMatrix(ROTATION.COUNTER_CLOCKWISE, matrix)).toEqual(
        expected
      );
    });

    it("throws an error if matrix is not square", () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      expect(() => rotateMatrix(ROTATION.CLOCKWISE, matrix)).toThrow(
        "matrix must be square"
      );
    });
  });
});
