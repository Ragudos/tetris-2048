import Grid from "../../Grid";
import Config from "../config/Config";
import Tetromino from "../../tetromino/Tetromino";
import TetrominoBag from "../../tetromino/TetrominoBag";
import TetrominoGhost from "../../tetromino/TetrominoGhost";
import GravityState from "./GravityState";
import { triangulateWithHoles, type Ticker } from "pixi.js";
import LockState from "./LockState";
import GlobalAction from "../input/GlobalAction";
import { collides, collidesBottom, collidesTop } from "../phys/collisions";
import Initializeable from "@/common/Initializeable";
import Logger from "../log/Logger";
import { ControlAction } from "../input/ControlAction";
import { KICK_DATA, Rotation, ROTATION, SRS_KICK_DATA } from "@/constants";
import { rotateMatrix } from "../util/matrix";
import Point from "@/common/Point";
import Offsets from "../phys/Offsets";

export default class GameState implements Initializeable {
  private logger: Logger;
  private tetrominoGhost: TetrominoGhost;
  private tetrominoBag: TetrominoBag;
  private grid: Grid<Tetromino>;
  private gravityState: GravityState;
  private lockState: LockState;

  private firstFrame: boolean;

  private didGoNext: boolean;
  private didChangeOrientation: boolean;

  constructor() {
    const screenConfig = Config.getInstance().getScreenConfig();

    this.logger = Logger.createLogger("GameState");
    this.tetrominoBag = new TetrominoBag();
    this.tetrominoGhost = new TetrominoGhost();
    this.grid = new Grid(screenConfig.getRows(), screenConfig.getColumns());
    this.gravityState = new GravityState();
    this.lockState = new LockState();
    this.firstFrame = true;
    this.didGoNext = false;
    this.didChangeOrientation = false;
  }

  async initialize(): Promise<void> {
    await this.tetrominoBag.initialize();
  }

  getTetrominoGhost(): TetrominoGhost {
    return this.tetrominoGhost;
  }

  getTetrominoBag(): TetrominoBag {
    return this.tetrominoBag;
  }

  getGrid(): Grid<Tetromino> {
    return this.grid;
  }

  getGravityState(): GravityState {
    return this.gravityState;
  }

  getLockState(): LockState {
    return this.lockState;
  }

  getDidGoNext(): boolean {
    return this.didGoNext;
  }

  getDidChangeOrientation(): boolean {
    return this.didChangeOrientation;
  }

  private rotateSrs(rotation: Rotation): boolean {
    this.logger.info("Applying SRS");

    const current = this.tetrominoBag.getCurrentTetronimo();
    const body = current.getTetrominoBody();
    const pos = body.getPosition();
    const tmpShape = body.cloneShape();

    rotateMatrix(rotation, tmpShape);

    const addend = current.getName() === "I" ? 8 : 0;
    const absNextRotation =
      Math.abs(body.getAmountOfRotations() + rotation) % 4;
    const kickIdx =
      rotation === ROTATION.COUNTER_CLOCKWISE
        ? addend + absNextRotation + 4
        : addend + absNextRotation;

    for (let kick = 0; kick < SRS_KICK_DATA[kickIdx].length; ++kick) {
      const [dx, dy] = SRS_KICK_DATA[kickIdx][kick];

      const newPoint = new Point(pos.getX() + dx, pos.getY() - dy);

      if (
        collides(
          this.grid,
          newPoint,
          tmpShape,
          new Offsets(0, 0, 0, 0)
        ).collidesAny()
      ) {
        continue;
      }

      this.logger.info("Chosen SRS: " + SRS_KICK_DATA[kickIdx][kick]);

      pos.setX(newPoint.getX());
      pos.setY(newPoint.getY());
      body.rotate(rotation);

      return true;
    }

    return false;
  }

  private rotate(rotation: Rotation): boolean {
    switch (Config.getInstance().getGameplayConfig().getKickDataKey()) {
      case "SRS": {
        return this.rotateSrs(rotation);
      }
      case KICK_DATA.NONE:
        {
        }
        break;
    }

    return false;
  }

  private nextTetromino(): void {
    this.logger.info("Going to next Tetromino");

    this.tetrominoBag.getCurrentTetronimo().occupyGrid(this.grid);
    this.tetrominoBag.makeNextTetrominoCurrent();
    this.lockState.setLocked(false);
    this.gravityState.setRowsToOccupy(0);
    this.gravityState.setHardDrop(false);
    this.grid.clearRows();
    this.tetrominoGhost.setTetromino(this.tetrominoBag.getCurrentTetronimo());
    this.tetrominoGhost.update(this.grid);

    this.didGoNext = true;
  }

  update(ticker: Ticker): void {
    this.didGoNext = false;
    this.didChangeOrientation = false;
    const actionProcessor = GlobalAction.getInstance().getActionProcessor();

    if (
      !this.lockState.getLocked() ||
      (this.lockState.getLocked() && this.lockState.canReset())
    ) {
      switch (
        actionProcessor.chooseAction(
          ControlAction.MOVE_LEFT,
          ControlAction.MOVE_RIGHT
        )
      ) {
        case ControlAction.MOVE_LEFT:
          {
            this.tetrominoBag.getCurrentTetronimo().moveLeft(this.grid);
            this.lockState.resetLock();
            this.tetrominoGhost.update(this.grid);

            this.didChangeOrientation = true;
          }
          break;
        case ControlAction.MOVE_RIGHT:
          {
            this.tetrominoBag.getCurrentTetronimo().moveRight(this.grid);
            this.lockState.resetLock();
            this.tetrominoGhost.update(this.grid);

            this.didChangeOrientation = true;
          }
          break;
      }

      switch (
        actionProcessor.chooseAction(
          ControlAction.ROTATE_CW,
          ControlAction.ROTATE_CCW
        )
      ) {
        case ControlAction.ROTATE_CW:
          {
            this.logger.groupCollapsed("Rotating", "Rotating Clockwise");
            if (this.rotate(ROTATION.CLOCKWISE)) {
              this.logger.info("Rotation sucessful");
              this.lockState.resetLock();
              this.tetrominoGhost.update(this.grid);

              this.didChangeOrientation = true;
            }
            this.logger.groupEnd();
          }
          break;
        case ControlAction.ROTATE_CCW:
          {
            this.logger.groupCollapsed(
              "Rotating",
              "Rotating Counter Clockwise"
            );
            if (this.rotate(ROTATION.COUNTER_CLOCKWISE)) {
              this.logger.info("Rotation sucessful");
              this.lockState.resetLock();
              this.tetrominoGhost.update(this.grid);

              this.didChangeOrientation = true;
            }
            this.logger.groupEnd();
          }
          break;
      }
    }

    this.lockState.update(ticker);

    if (actionProcessor.triggered(ControlAction.HARD_DROP)) {
      this.hardDrop(true);
    } else if (!this.lockState.getLocked()) {
      this.gravityState.update(ticker);

      const currentTetromino = this.tetrominoBag.getCurrentTetronimo();
      const position = currentTetromino.getTetrominoBody().getPosition();
      const shape = currentTetromino.getTetrominoBody().getShape();

      while (this.gravityState.getRowsToOccupy() >= 1) {
        if (collidesBottom(this.grid, position, shape, 1)) {
          if (Config.getInstance().getGameplayConfig().getEnableLock()) {
            this.lockState.setLocked(true);
          } else {
            this.nextTetromino();
          }

          break;
        }

        position.setY(position.getY() + 1);
        this.gravityState.setRowsToOccupy(
          this.gravityState.getRowsToOccupy() - 1
        );
      }
    } else if (this.lockState.getLockExpired()) {
      this.nextTetromino();
    }

    if (this.firstFrame) {
      this.tetrominoGhost.setTetromino(this.tetrominoBag.getCurrentTetronimo());
      this.firstFrame = false;

      this.tetrominoGhost.update(this.grid);
    }
  }

  hardDrop(lock: boolean = true): void {
    this.gravityState.setHardDrop(lock);

    const block = this.tetrominoBag.getCurrentTetronimo();
    const shape = block.getTetrominoBody().getShape();
    const pos = block.getTetrominoBody().getPosition();

    if (
      collidesTop(this.grid, pos, shape, 2) &&
      collidesBottom(this.grid, pos, shape, 1)
    ) {
      // gameover
      return;
    }

    while (!collidesBottom(this.grid, pos, shape, 1)) {
      pos.setY(pos.getY() + 1);
    }

    if (lock) {
      this.gravityState.setHardDrop(false);
      this.nextTetromino();
    }
  }
}
