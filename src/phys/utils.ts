import Vec2D from "./Vec2D";

export function getCoordsFrom1D(
  totalCells: number,
  columns: number,
  index: number
): Vec2D {
  if (index < 0) {
    index = Math.abs(totalCells + index);
  }

  return new Vec2D(index % columns, Math.floor(index / columns));
}

export function get1DFromCoords(x: number, y: number, columns: number): number {
  return y * columns + x;
}
