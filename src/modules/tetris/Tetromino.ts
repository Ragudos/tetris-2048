import Point from "@/modules/tetris/common/Point";
import Input from "../input/Input";
import Logger from "../log/Logger";
import { rotateMatrix } from "../util/matrix";
import { ControlAction } from "./ControlAction";
import type GameGrid from "./GameGrid";
import {
  collides,
  collidesBottom,
  collidesLeft,
  collidesRight,
} from "./physics/collisions";
import Offsets from "./physics/Offsets";
import {
  MAX_TETROMINO_ROTATIONS,
  ROTATION,
  Rotation,
  TETROMINO_SHAPES,
  TetrominoNames,
  WALL_KICKS,
} from "./constants";

export default class Tetromino {
  private logger: Logger;
  private name: TetrominoNames;
  /**
   * Max of 4
   */
  private currentRotation: number;
  private position: Point;
  private shape: number[][];
  actions = {
    collidingRight: false,
    collidingLeft: false,
    hardDrop: false,
    softDrop: false,
  };

  private dirty: boolean;

  constructor(
    name: TetrominoNames,
    currentRotation: number,
    position: Point,
    shape: number[][]
  ) {
    this.logger = Logger.createLogger(Tetromino.name);
    this.name = name;
    this.currentRotation = currentRotation;
    this.position = position;
    this.shape = shape;
    this.dirty = true;
  }

  /**
   * @returns true if at bottom
   */
  moveDown(grid: GameGrid, amount: number): boolean {
    if (amount < 1) {
      return false;
    }

    this.dirty = true;

    while (amount >= 1) {
      if (collidesBottom(grid, this.position, this.shape, 1)) {
        return true;
      }

      this.position.setY(this.position.getY() + 1);
      amount -= 1;
    }

    if (collidesBottom(grid, this.position, this.shape, 1)) {
      return true;
    }

    return false;
  }

  toBottom(grid: GameGrid): void {
    while (!collidesBottom(grid, this.position, this.shape, 1)) {
      this.position.setY(this.position.getY() + 1);
    }

    this.dirty = true;
  }

  resetDirty(): void {
    this.dirty = false;
  }

  rotate(rotation: Rotation): void {
    rotateMatrix(rotation, this.shape);

    this.currentRotation =
      (Math.abs(this.currentRotation + rotation) % MAX_TETROMINO_ROTATIONS) *
      rotation;

    this.dirty = true;
  }

  /**
   *
   * @param grid
   * @returns  true if movement is a success
   */
  handleMovement(grid: GameGrid): boolean {
    const actionProcessor = Input.getInstance();
    this.actions.collidingLeft = false;
    this.actions.collidingRight = false;

    if (
      actionProcessor.down(ControlAction.MOVE_LEFT) &&
      collidesLeft(grid, this.position, this.shape, 1)
    ) {
      this.actions.collidingLeft = true;
    }

    if (
      actionProcessor.down(ControlAction.MOVE_RIGHT) &&
      collidesRight(grid, this.position, this.shape, 1)
    ) {
      this.actions.collidingRight = true;
    }

    switch (
      actionProcessor.choose(ControlAction.MOVE_LEFT, ControlAction.MOVE_RIGHT)
    ) {
      case ControlAction.MOVE_LEFT: {
        if (collidesLeft(grid, this.position, this.shape, 1)) {
          return false;
        }

        this.position.setX(this.position.getX() - 1);

        this.dirty = true;

        return true;
      }
      case ControlAction.MOVE_RIGHT: {
        if (collidesRight(grid, this.position, this.shape, 1)) {
          return false;
        }

        this.position.setX(this.position.getX() + 1);

        this.dirty = true;

        return true;
      }
    }

    return false;
  }

  private tryRotate(grid: GameGrid, rotationDir: Rotation): boolean {
    const tmpShape = this.shape.map((val) => [...val]);
    const absNextRotation = Math.abs(this.currentRotation + rotationDir) % 4;
    const kickIdx =
      rotationDir === ROTATION.COUNTER_CLOCKWISE
        ? absNextRotation + 4
        : absNextRotation;

    rotateMatrix(rotationDir, tmpShape);

    const arr = WALL_KICKS.SRS[this.name === "I" ? "I" : "JLSZT"];

    for (let kick = 0; kick < arr[kickIdx].length; ++kick) {
      const [dx, dy] = arr[kickIdx][kick];
      const newPoint = new Point(
        this.position.getX() + dx,
        this.position.getY() + dy
      );

      if (
        collides(
          grid,
          newPoint,
          tmpShape,
          new Offsets(0, 0, 0, 0)
        ).collidesAny()
      ) {
        continue;
      }

      this.position.setX(newPoint.getX());
      this.position.setY(newPoint.getY());
      this.rotate(rotationDir);

      this.dirty = true;

      return true;
    }

    return false;
  }

  /**
   *
   * @returns true if rotation was a success
   */
  handleRotation(grid: GameGrid): boolean {
    const actionProcessor = Input.getInstance();

    if (actionProcessor.pressed(ControlAction.ROTATE_CCW)) {
      return this.tryRotate(grid, ROTATION.COUNTER_CLOCKWISE);
    }

    if (actionProcessor.pressed(ControlAction.ROTATE_CW)) {
      return this.tryRotate(grid, ROTATION.CLOCKWISE);
    }

    return false;
  }

  move(x: number, y: number): void {
    this.position.setX(x);
    this.position.setY(y);

    this.dirty = true;
  }

  /**
   *
   * Changes the tetromino type and
   * resets everything
   *
   * @param name
   */
  changeType(name: TetrominoNames) {
    this.name = name;

    this.reset();

    this.dirty = true;
  }

  reset(): void {
    this.currentRotation = 0;
    this.position.setX(3);
    this.position.setY(0);

    this.shape = TETROMINO_SHAPES[this.name].map((val) => [...val]);

    this.dirty = true;
  }

  getName(): TetrominoNames {
    return this.name;
  }

  getShape(): number[][] {
    return this.shape.map((val) => [...val]);
  }

  getCurrentRotation(): number {
    return this.currentRotation;
  }

  /**
   *
   * @returns cloned position
   */
  getPosition(): Point {
    return this.position.clone();
  }

  getDirty(): boolean {
    return this.dirty;
  }
}
