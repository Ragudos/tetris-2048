import Cloneable from "@/common/Cloneable";
import Point from "@/common/Point";
import { MAX_TETROMINO_ROTATIONS, ROTATION, Rotation } from "@/constants";
import { rotateMatrix } from "@/lib/util/matrix";

export default class TetrominoBody implements Cloneable<TetrominoBody> {
  private amountOfRotations: number;
  private shape: number[][];
  private position: Point;

  constructor(amountOfRotations: number, shape: number[][], position: Point) {
    this.amountOfRotations = amountOfRotations;
    this.shape = shape;
    this.position = position;
  }

  clone(): TetrominoBody {
    return new TetrominoBody(
      this.amountOfRotations,
      this.shape.map((row) => row.slice()),
      this.position.clone()
    );
  }

  cloneShape(): number[][] {
    return this.shape.map((row) => row.slice());
  }

  rotate(rotation: Rotation): void {
    rotateMatrix(rotation, this.shape);

    this.amountOfRotations =
      (Math.abs(this.amountOfRotations + rotation) % MAX_TETROMINO_ROTATIONS) *
      rotation;
  }

  resetRotation(): void {
    if (this.amountOfRotations < 0) {
      for (let rotation = this.amountOfRotations; rotation < 0; ++rotation) {
        this.rotate(ROTATION.CLOCKWISE);
      }
    } else if (this.amountOfRotations > 0) {
      for (let rotation = this.amountOfRotations; rotation > 0; --rotation) {
        this.rotate(ROTATION.COUNTER_CLOCKWISE);
      }
    }
  }

  getShape(): number[][] {
    return this.shape;
  }

  getPosition(): Point {
    return this.position;
  }

  getAmountOfRotations(): number {
    return this.amountOfRotations;
  }
}
