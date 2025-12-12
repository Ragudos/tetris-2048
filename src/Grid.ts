import Point from "./common/Point";
import Tetromino from "./tetromino/Tetromino";

export default class Grid {
  private rows: number;
  private columns: number;
  private value: (Tetromino | null)[];

  constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.value = new Array(rows * columns).fill(null);
  }

  getRows(): number {
    return this.rows;
  }

  getColumns(): number {
    return this.columns;
  }

  getValue(): typeof this.value {
    return this.value;
  }

  /**
   *
   * @param x or column
   * @param y or row
   */
  get1DIndexFromCoords(x: number, y: number): number {
    return y * this.columns + x;
  }

  /**
   * Converts an index in a one-dimensional array into an (x, y)
   * coordinate in a two-dimensional array based on the latter's
   * columns/width.
   *
   * - If index is negative, wraps from the end.
   * - If index is too large, throws an error.
   *
   * @see https://stackoverflow.com/questions/5494974/convert-1d-array-index-to-2d-array-index
   *
   * @param index
   * @returns
   */
  getCoordsFrom1D(index: number): Point {
    const total = this.getTotalCells();

    if (index < 0) {
      index = Math.abs(total + index);
    }

    if (index >= total) {
      throw new RangeError(
        `Grid index ${index} is out of range (max ${total - 1}).`
      );
    }

    return new Point(index % this.columns, Math.floor(index / this.columns));
  }

  getTotalCells(): number {
    return this.rows * this.columns;
  }
}
