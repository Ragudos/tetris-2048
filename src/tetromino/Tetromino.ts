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
import TetrominoBody from "./TetrominoBody";
import Grid from "@/Grid";
import { collidesLeft, collidesRight } from "@/lib/phys/collisions";

export default class Tetromino implements Cloneable<Tetromino> {
  private name: TetrominoNames;
  private color: string;
  private tetrominoBody: TetrominoBody;

  constructor(
    name: TetrominoNames,
    color: string,
    tetrominoBody: TetrominoBody
  ) {
    this.name = name;
    this.color = color;
    this.tetrominoBody = tetrominoBody;
  }

  static createTetromino(
    name: TetrominoNames,
    initialPosition: Point,
    color: string
  ): Tetromino {
    return new Tetromino(
      name,
      color,
      new TetrominoBody(
        0,
        TETROMINO_DEFAULT_ROTATIONS[
          Config.getInstance().getGameplayConfig().getKickDataKey()
        ][name].map((row) => row.slice()),
        initialPosition.clone()
      )
    );
  }

  moveLeft(grid: Grid<Tetromino>): void {
    const position = this.tetrominoBody.getPosition();
    const shape = this.tetrominoBody.getShape();

    if (collidesLeft(grid, position, shape, 1)) {
      return;
    }

    this.tetrominoBody
      .getPosition()
      .setX(this.tetrominoBody.getPosition().getX() - 1);
  }

  moveRight(grid: Grid<Tetromino>): void {
    const position = this.tetrominoBody.getPosition();
    const shape = this.tetrominoBody.getShape();

    if (collidesRight(grid, position, shape, 1)) {
      return;
    }

    this.tetrominoBody
      .getPosition()
      .setX(this.tetrominoBody.getPosition().getX() + 1);
  }

  clone(): Tetromino {
    return new Tetromino(this.name, this.color, this.tetrominoBody.clone());
  }

  getColor(): string {
    return this.color;
  }

  getName(): TetrominoNames {
    return this.name;
  }

  getTetrominoBody(): TetrominoBody {
    return this.tetrominoBody;
  }
}
