import type Grid from "./Grid";
import type { TetrominoShapeValue } from "./TetrominoShape";
import type Vec2D from "./Vec2D";

export class CollisionResult {
  constructor(
    readonly top: boolean,
    readonly left: boolean,
    readonly bottom: boolean,
    readonly right: boolean
  ) {}

  collidesVertical(): boolean {
    return this.top && this.bottom;
  }

  collidesHorizontal(): boolean {
    return this.left && this.right;
  }

  collidesAll(): boolean {
    return this.top && this.left && this.bottom && this.right;
  }

  collidesAny(): boolean {
    return this.top || this.left || this.bottom || this.right;
  }
}

export class Offsets {
  constructor(
    readonly top: number,
    readonly left: number,
    readonly bottom: number,
    readonly right: number
  ) {}
}

export function collidesBottom<T>(
  grid: Grid<T>,
  position: Vec2D,
  shape: TetrominoShapeValue,
  offset: number = 0
): boolean {
  for (let y = 0; y < shape.length; ++y) {
    const row = shape[y];
    const realY = position.y + y + offset;
    const yOverflow = realY >= grid.rows;

    for (let x = 0; x < row.length; ++x) {
      if (!row[x]) {
        continue;
      }

      if (yOverflow || grid.get(position.x + x, realY)) {
        return true;
      }
    }
  }

  return false;
}

export function collidesTop<T>(
  grid: Grid<T>,
  position: Vec2D,
  shape: TetrominoShapeValue,
  offset: number = 0
): boolean {
  for (let y = 0; y < shape.length; ++y) {
    const row = shape[y];
    const realY = position.y + y + offset;
    const yOverflow = realY < 0;

    for (let x = 0; x < row.length; ++x) {
      if (!row[x]) {
        continue;
      }

      if (yOverflow || grid.get(position.x + x, realY)) {
        return true;
      }
    }
  }

  return false;
}

export function collidesLeft<T>(
  grid: Grid<T>,
  position: Vec2D,
  shape: TetrominoShapeValue,
  offset: number = 0
): boolean {
  for (let y = 0; y < shape.length; ++y) {
    const row = shape[y];
    const realY = position.y + y;

    for (let x = 0; x < row.length; ++x) {
      if (!row[x]) {
        continue;
      }

      const realX = position.x + x - offset;

      if (realX < 0 || grid.get(realX, realY)) {
        return true;
      }
    }
  }

  return false;
}

export function collidesRight<T>(
  grid: Grid<T>,
  position: Vec2D,
  shape: TetrominoShapeValue,
  offset: number = 0
): boolean {
  for (let y = 0; y < shape.length; ++y) {
    const row = shape[y];
    const realY = position.y + y;

    for (let x = 0; x < row.length; ++x) {
      if (!row[x]) {
        continue;
      }

      const realX = position.x + x + offset;

      if (realX >= grid.columns || grid.get(realX, realY)) {
        return true;
      }
    }
  }

  return false;
}

export function collides<T>(
  grid: Grid<T>,
  position: Vec2D,
  shape: TetrominoShapeValue,
  offsets: Offsets = new Offsets(0, 0, 0, 0)
): CollisionResult {
  return new CollisionResult(
    collidesTop(grid, position, shape, offsets.top),
    collidesLeft(grid, position, shape, offsets.left),
    collidesBottom(grid, position, shape, offsets.bottom),
    collidesRight(grid, position, shape, offsets.right)
  );
}
