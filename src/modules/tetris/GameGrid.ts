import Point from "@/modules/tetris/common/Point";
import type Tetromino from "./Tetromino";
import type { TetrominoNames } from "./constants";
import { is } from "zod/locales";

export default class GameGrid {
  private rows: number;
  private columns: number;
  private value: (TetrominoNames | undefined)[];
  private dirty: boolean;

  constructor(rows: number, columns: number) {
    this.value = new Array(rows * columns).fill(undefined);
    this.rows = rows;
    this.columns = columns;

    this.dirty = false;
  }

  resetDirty(): void {
    this.dirty = false;
  }

  taken(idx: number): boolean {
    if (idx >= this.value.length) {
      throw new RangeError("Invalid argument idx");
    }

    return this.value[idx] !== undefined;
  }

  occupyGrid(tetromino: Tetromino): void {
    const position = tetromino.getPosition();
    const shape = tetromino.getShape();

    for (let y = 0; y < shape.length; ++y) {
      for (let x = 0; x < shape.length; ++x) {
        if (!shape[y][x]) {
          continue;
        }

        this.value[
          this.get1DIndexFromCoords(x + position.getX(), y + position.getY())
        ] = tetromino.getName();
      }
    }

    this.dirty = true;
  }

  clearFullRows(): void {
    for (let y = 0; y < this.rows; ++y) {
      let isFull = true;

      for (let x = 0; x < this.columns; ++x) {
        const i = this.get1DIndexFromCoords(x, y);

        if (!this.value[i]) {
          isFull = false;
        }
      }

      if (isFull) {
        console.log(y);
        for (let sy = y; sy >= 0; --sy) {
          for (let x = 0; x < this.columns; ++x) {
            const i = this.get1DIndexFromCoords(x, sy);
            const i2 = this.get1DIndexFromCoords(x, sy - 1);

            this.value[i] = this.value[i2];
          }
        }
      }
    }

    this.dirty = true;
  }

  getTotalCells(): number {
    return this.rows * this.columns;
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

    return new Point(index % this.columns, Math.floor(index / this.columns));
  }

  getColumns(): number {
    return this.columns;
  }

  getRows(): number {
    return this.rows;
  }

  getValue(): typeof this.value {
    return this.value.map((val) => val);
  }

  getDirty(): boolean {
    return this.dirty;
  }
}
