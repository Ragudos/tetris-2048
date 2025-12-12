import Cloneable from "./Cloneable";

export default class Point implements Cloneable<Point> {
  private x: number;
  private y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  clone(): Point {
    return new Point(this.x, this.y);
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}
