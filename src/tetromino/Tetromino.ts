import Cloneable from "@/common/Cloneable";
import Point from "@/common/Point";
import {
  MAX_TETROMINO_ROTATIONS,
  ROTATION,
  Rotation,
  TETROMINO_DEFAULT_ROTATIONS,
  TetrominoNames,
} from "@/constants";
import Config from "@config/Config";
import { rotateMatrix } from "@util/matrix";

export default class Tetromino implements Cloneable<Tetromino> {
  private name: TetrominoNames;
  private rotation: number;
  private shape: number[][];
  private position: Point;
  private color: string;

  private constructor(
    name: TetrominoNames,
    rotation: number,
    shape: number[][],
    position: Point,
    color: string
  ) {
    this.name = name;
    this.rotation = rotation;
    this.shape = shape;
    this.position = position;
    this.color = color;
  }

  static createTetromino(
    name: TetrominoNames,
    initialPosition: Point,
    color: string
  ): Tetromino {
    return new Tetromino(
      name,
      0,
      TETROMINO_DEFAULT_ROTATIONS[
        Config.getInstance().getGameplayConfig().getKickDataKey()
      ][name].map((row) => row.slice()),
      initialPosition.clone(),
      color
    );
  }

  rotate(rotation: Rotation): void {
    rotateMatrix(rotation, this.shape);

    this.rotation =
      (Math.abs(this.rotation + rotation) % MAX_TETROMINO_ROTATIONS) * rotation;
  }

  resetRotation(): void {
    if (this.rotation < 0) {
      for (let rotation = this.rotation; rotation < 0; ++rotation) {
        this.rotate(ROTATION.CLOCKWISE);
      }
    } else if (this.rotation > 0) {
      for (let rotation = this.rotation; rotation > 0; --rotation) {
        this.rotate(ROTATION.COUNTER_CLOCKWISE);
      }
    }
  }

  clone(): Tetromino {
    return new Tetromino(
      this.name,
      this.rotation,
      this.cloneShape(),
      this.position.clone(),
      this.color
    );
  }

  cloneShape(): number[][] {
    return this.shape.map((row) => row.slice());
  }

  getRotation(): number {
    return this.rotation;
  }

  getColor(): string {
    return this.color;
  }

  getShape(): number[][] {
    return this.shape;
  }

  getName(): TetrominoNames {
    return this.name;
  }

  getPosition(): Point {
    return this.position;
  }
}
