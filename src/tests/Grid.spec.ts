import { describe, it, expect } from "vitest";
import Grid from "@/Grid";
import { Point } from "pixi.js"; // or your own Point implementation

describe("Grid", () => {
  describe("basic dimension getters", () => {
    it("returns the correct rows and columns", () => {
      const grid = new Grid(20, 10);
      expect(grid.getRows()).toBe(20);
      expect(grid.getColumns()).toBe(10);
    });
  });

  describe("getTotalCells()", () => {
    it("returns rows * columns", () => {
      expect(new Grid(20, 10).getTotalCells()).toBe(200);
      expect(new Grid(1, 10).getTotalCells()).toBe(10);
      expect(new Grid(10, 1).getTotalCells()).toBe(10);
      expect(new Grid(1, 1).getTotalCells()).toBe(1);
    });
  });

  describe("getCoordsFrom1D()", () => {
    it("maps index 0 to (0,0)", () => {
      const grid = new Grid(20, 10);
      const pt = grid.getCoordsFrom1D(0);
      expect(pt.getX()).toBe(0);
      expect(pt.getY()).toBe(0);
    });

    it("maps last index to (columns-1, rows-1)", () => {
      const grid = new Grid(20, 10);
      const last = grid.getTotalCells() - 1; // 199
      const pt = grid.getCoordsFrom1D(last);
      expect(pt.getX()).toBe(9);
      expect(pt.getY()).toBe(19);
    });

    it("correctly maps positions on row boundaries", () => {
      const grid = new Grid(3, 4);
      // Index: 3 → (3,0)
      let p = grid.getCoordsFrom1D(3);
      expect(p).toEqual(new Point(3, 0));

      // Index: 4 → (0,1)
      p = grid.getCoordsFrom1D(4);
      expect(p).toEqual(new Point(0, 1));

      // Index: 7 → (3,1)
      p = grid.getCoordsFrom1D(7);
      expect(p).toEqual(new Point(3, 1));
    });

    it("correctly maps random valid indices", () => {
      const grid = new Grid(10, 10);

      expect(grid.getCoordsFrom1D(15)).toEqual(new Point(5, 1));
      expect(grid.getCoordsFrom1D(37)).toEqual(new Point(7, 3));
      expect(grid.getCoordsFrom1D(88)).toEqual(new Point(8, 8));
    });

    it("works with a single-row grid", () => {
      const grid = new Grid(1, 5);

      expect(grid.getCoordsFrom1D(0)).toEqual(new Point(0, 0));
      expect(grid.getCoordsFrom1D(4)).toEqual(new Point(4, 0));
    });

    it("works with a single-column grid", () => {
      const grid = new Grid(5, 1);

      expect(grid.getCoordsFrom1D(0)).toEqual(new Point(0, 0));
      expect(grid.getCoordsFrom1D(3)).toEqual(new Point(0, 3));
      expect(grid.getCoordsFrom1D(4)).toEqual(new Point(0, 4));
    });

    it("handles index exactly at the start of the last row", () => {
      const grid = new Grid(4, 3);
      // start of last row = row 3 at x=0 = index 3*3 = 9
      expect(grid.getCoordsFrom1D(9)).toEqual(new Point(0, 3));
    });

    it("throws an error for out-of-range positive index", () => {
      const grid = new Grid(4, 4);
      expect(() => grid.getCoordsFrom1D(100)).toThrow(RangeError);
      expect(() => grid.getCoordsFrom1D(16)).toThrow(RangeError);
      expect(() => grid.getCoordsFrom1D(20)).toThrow(RangeError);
    });

    it("wraps negative index from the end", () => {
      const grid = new Grid(4, 4);

      expect(grid.getCoordsFrom1D(-1)).toEqual(new Point(3, 3));
      expect(grid.getCoordsFrom1D(-2)).toEqual(new Point(2, 3));
      expect(grid.getCoordsFrom1D(-16)).toEqual(new Point(0, 0));
      expect(grid.getCoordsFrom1D(-17)).toEqual(new Point(1, 0));
    });
  });
});
