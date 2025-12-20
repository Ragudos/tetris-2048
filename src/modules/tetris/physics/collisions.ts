import type Point from "@/modules/tetris/common/Point";
import type GameGrid from "../GameGrid";
import CollisionResult from "./CollisionResult";
import Offsets from "./Offsets";

export function collidesBottom(
  grid: GameGrid,
  position: Point,
  shape: number[][],
  offset: number = 0,
): boolean {
  for (let y = 0; y < shape.length; ++y) {
    const row = shape[y];
    const realY = position.getY() + y + offset;
    const yOverflow = realY >= grid.getRows();

    for (let x = 0; x < row.length; ++x) {
      if (!row[x]) {
        continue;
      }

      if (yOverflow) {
        return true;
      }

      const i = grid.get1DIndexFromCoords(position.getX() + x, realY);

      if (grid.getValue()[i]) {
        return true;
      }
    }
  }

  return false;
}

export function collidesTop(
  grid: GameGrid,
  position: Point,
  shape: number[][],
  offset: number = 0,
): boolean {
  for (let y = 0; y < shape.length; ++y) {
    const row = shape[y];
    const realY = position.getY() + y - offset;
    const yOverflow = realY < 0;

    for (let x = 0; x < row.length; ++x) {
      if (!row[x]) {
        continue;
      }

      if (yOverflow) {
        return true;
      }

      const i = grid.get1DIndexFromCoords(position.getX() + x, realY);

      if (grid.getValue()[i]) {
        return true;
      }
    }
  }

  return false;
}

export function collidesLeft(
  grid: GameGrid,
  position: Point,
  shape: number[][],
  offset: number = 0,
): boolean {
  for (let y = 0; y < shape.length; ++y) {
    const row = shape[y];
    const realY = position.getY() + y;

    for (let x = 0; x < row.length; ++x) {
      if (!row[x]) {
        continue;
      }

      const realX = position.getX() + x - offset;

      if (realX < 0 || grid.getValue()[grid.get1DIndexFromCoords(realX, realY)]) {
        return true;
      }
    }
  }

  return false;
}

export function collidesRight(
  grid: GameGrid,
  position: Point,
  shape: number[][],
  offset: number = 0,
): boolean {
  for (let y = 0; y < shape.length; ++y) {
    const row = shape[y];
    const realY = position.getY() + y;

    for (let x = 0; x < row.length; ++x) {
      if (!row[x]) {
        continue;
      }

      const realX = position.getX() + x + offset;

      if (realX >= grid.getColumns() || grid.getValue()[grid.get1DIndexFromCoords(realX, realY)]) {
        return true;
      }
    }
  }

  return false;
}

export function collides(
  grid: GameGrid,
  position: Point,
  shape: number[][],
  offsets: Offsets = new Offsets(0, 0, 0, 0),
): CollisionResult {
  return new CollisionResult(
    collidesTop(grid, position, shape, offsets.getTop()),
    collidesLeft(grid, position, shape, offsets.getLeft()),
    collidesBottom(grid, position, shape, offsets.getBottom()),
    collidesRight(grid, position, shape, offsets.getRight()),
  );
}
