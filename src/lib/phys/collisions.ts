import Point from "@/common/Point";
import Grid from "@/Grid";

export function collidesBottom<T>(
  grid: Grid<T>,
  position: Point,
  shape: number[][],
  offset: number = 0
): boolean {
  for (let y = 0; y < shape.length; ++y) {
    const row = shape[y];
    const realY = position.getY() + y + offset;

    for (let x = 0; x < row.length; ++x) {
      if (!row[x]) {
        continue;
      }

      if (realY >= grid.getRows()) {
        return true;
      }

      const i = grid.get1DIndexFromCoords(x, realY);

      if (grid.getValue()[i] !== null) {
        return true;
      }
    }
  }

  return false;
}

export function collidesTop<T>(
  grid: Grid<T>,
  position: Point,
  shape: number[][],
  offset: number = 0
): boolean {
  for (let y = 0; y < shape.length; ++y) {
    const row = shape[y];
    const realY = position.getY() + y - offset;

    for (let x = 0; x < row.length; ++x) {
      if (!row[x]) {
        continue;
      }

      if (realY < 0) {
        return true;
      }

      const i = grid.get1DIndexFromCoords(x, realY);

      if (grid.getValue()[i] !== null) {
        return true;
      }
    }
  }

  return false;
}

export function collidesLeft<T>(
  grid: Grid<T>,
  position: Point,
  shape: number[][],
  offset: number = 0
): boolean {
  for (let y = 0; y < shape.length; ++y) {
    const row = shape[y];
    const realY = position.getY() + y;

    for (let x = 0; x < row.length; ++x) {
      if (!row[x]) {
        continue;
      }

      const realX = position.getX() + x - offset;

      if (
        realX < 0 ||
        grid.getValue()[grid.get1DIndexFromCoords(realX, realY)] !== null
      ) {
        return true;
      }
    }
  }

  return false;
}

export function collidesRight<T>(
  grid: Grid<T>,
  position: Point,
  shape: number[][],
  offset: number = 0
): boolean {
  for (let y = 0; y < shape.length; ++y) {
    const row = shape[y];
    const realY = position.getY() + y;

    for (let x = 0; x < row.length; ++x) {
      if (!row[x]) {
        continue;
      }

      const realX = position.getX() + x + offset;

      if (
        realX >= grid.getColumns() ||
        grid.getValue()[grid.get1DIndexFromCoords(realX, realY)] !== null
      ) {
        return true;
      }
    }
  }

  return false;
}

export class Offsets {
  private top: number;
  private left: number;
  private bottom: number;
  private right: number;

  constructor(top: number, left: number, bottom: number, right: number) {
    this.top = top;
    this.left = left;
    this.bottom = bottom;
    this.right = right;
  }

  getTop(): number {
    return this.top;
  }

  getLeft(): number {
    return this.left;
  }

  getBottom(): number {
    return this.bottom;
  }

  getRight(): number {
    return this.right;
  }
}

export class CollisionResult {
  private top: boolean;
  private left: boolean;
  private bottom: boolean;
  private right: boolean;

  constructor(top: boolean, left: boolean, bottom: boolean, right: boolean) {
    this.top = top;
    this.left = left;
    this.bottom = bottom;
    this.right = right;
  }

  getTop(): boolean {
    return this.top;
  }

  getLeft(): boolean {
    return this.left;
  }

  getBottom(): boolean {
    return this.bottom;
  }

  getRight(): boolean {
    return this.right;
  }

  collidesVertical(): boolean {
    return this.top && this.bottom;
  }

  collidesHorizontal(): boolean {
    return this.left && this.right;
  }

  collidesAll(): boolean {
    return this.top && this.left && this.bottom && this.right;
  }
}

export function collides<T>(
  grid: Grid<T>,
  position: Point,
  shape: number[][],
  offsets: Offsets = new Offsets(0, 0, 0, 0)
): CollisionResult {
  return new CollisionResult(
    collidesTop(grid, position, shape, offsets.getTop()),
    collidesLeft(grid, position, shape, offsets.getLeft()),
    collidesBottom(grid, position, shape, offsets.getBottom()),
    collidesRight(grid, position, shape, offsets.getRight())
  );
}
