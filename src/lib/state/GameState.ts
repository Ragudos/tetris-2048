import Grid from "../../Grid";
import Config from "../config/Config";
import Tetromino from "../../tetromino/Tetromino";
import TetrominoBag from "../../tetromino/TetrominoBag";
import TetrominoGhost from "../../tetromino/TetrominoGhost";
import GravityState from "./GravityState";
import type { Ticker } from "pixi.js";
import LockState from "./LockState";
import GlobalAction from "../input/GlobalAction";
import { ControlAction } from "../input/ActionProcessor";
import { collidesBottom, collidesTop } from "../phys/collisions";
import Initializeable from "@/common/Initializeable";
import Logger from "../log/Logger";

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

    switch (actionProcessor.chooseAction(ControlAction.MOVE_LEFT, ControlAction.MOVE_RIGHT)) {
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

    if (actionProcessor.triggered(ControlAction.ROTATE_CW)) {
      this.tetrominoGhost.update(this.grid);

      this.didChangeOrientation = true;
    }

    if (actionProcessor.triggered(ControlAction.ROTATE_CCW)) {
      this.tetrominoGhost.update(this.grid);

      this.didChangeOrientation = true;
    }

    this.lockState.update(ticker);

    if (!this.lockState.getLocked()) {
      this.gravityState.update(ticker);

      if (actionProcessor.triggered(ControlAction.HARD_DROP)) {
        this.hardDrop(true);
      } else {
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
          this.gravityState.setRowsToOccupy(this.gravityState.getRowsToOccupy() - 1);
        }
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

    if (collidesTop(this.grid, pos, shape, 2) && collidesBottom(this.grid, pos, shape, 1)) {
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
