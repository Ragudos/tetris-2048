import type { Ticker } from "pixi.js";
import type { TetrominoNames } from "@/constants";
import Logger from "@/modules/log/Logger";
import type LinkedList from "@/modules/util/ds/LinkedList";
import { GlobalConfig } from "../config/GlobalConfig";
import Input from "../input/Input";
import { ControlAction } from "./ControlAction";
import GameGrid from "./GameGrid";
import GravityState from "./GravityState";
import LockState from "./LockState";
import { collidesBottom } from "./physics/collisions";
import type Tetromino from "./Tetromino";
import TetrominoBag from "./TetrominoBag";

export default class GameState {
  private logger: Logger;
  private tetrominoBag: TetrominoBag;
  private ghostTetrominoData: { y: number; x: number; shape: number[][] };
  private ghostTetrominoDirty: boolean;
  private grid: GameGrid;
  private lockState: LockState;
  private gravityState: GravityState;

  constructor() {
    const config = GlobalConfig.get();
    this.logger = Logger.createLogger(GameState.name);

    this.tetrominoBag = new TetrominoBag();
    this.grid = new GameGrid(config.sizes.rows + 2, config.sizes.columns);
    this.ghostTetrominoData = this.calculateGhostTetominoPosition();
    this.ghostTetrominoDirty = true;

    this.lockState = new LockState();
    this.gravityState = new GravityState();

    Input.getInstance().addSingleTriggerAction(ControlAction.HARD_DROP);
    Input.getInstance().addSingleTriggerAction(ControlAction.ROTATE_CW);
    Input.getInstance().addSingleTriggerAction(ControlAction.ROTATE_CCW);
    Input.getInstance().addSingleTriggerAction(ControlAction.HOLD);
  }

  private calculateGhostTetominoPosition(): {
    y: number;
    x: number;
    shape: number[][];
  } {
    const tmpPos = this.tetrominoBag.getActiveTetromino().getPosition();
    const shape = this.tetrominoBag.getActiveTetromino().getShape();

    while (!collidesBottom(this.grid, tmpPos, shape, 1)) {
      tmpPos.setY(tmpPos.getY() + 1);
    }

    return {
      x: tmpPos.getX(),
      y: tmpPos.getY(),
      shape,
    };
  }

  private nextTetromino(): void {
    this.logger.info("Going to next Tetromino");

    this.grid.occupyGrid(this.tetrominoBag.getActiveTetromino());
    this.tetrominoBag
      .getActiveTetromino()
      .changeType(this.tetrominoBag.consumeQueue());
    this.lockState.setLocked(false);
    this.gravityState.setRowsToOccupy(0);
    this.gravityState.setHardDrop(false);

    this.ghostTetrominoData = this.calculateGhostTetominoPosition();
    this.ghostTetrominoDirty = true;

    // clear rows
  }

  hardDrop(lock: boolean = true): void {
    this.gravityState.setHardDrop(lock);
    this.tetrominoBag.getActiveTetromino().toBottom(this.grid);

    if (lock) {
      this.gravityState.setHardDrop(false);
      this.nextTetromino();
    }
  }

  update(ticker: Ticker): void {
    this.tetrominoBag.resetDirty();
    this.grid.resetDirty();

    this.ghostTetrominoDirty = false;
    const activeTetromino = this.tetrominoBag.getActiveTetromino();
    activeTetromino.actions.softDrop = false;
    activeTetromino.actions.hardDrop = false;

    if (
      !this.lockState.getLocked() ||
      (this.lockState.getLocked() && this.lockState.canReset())
    ) {
      const moved = activeTetromino.handleMovement(this.grid);
      const rotated = activeTetromino.handleRotation(this.grid);

      if (rotated || moved) {
        this.lockState.resetLock();

        this.ghostTetrominoData = this.calculateGhostTetominoPosition();
        this.ghostTetrominoDirty = true;
      }

      if (Input.getInstance().pressed(ControlAction.HOLD)) {
        if (this.tetrominoBag.holdActive()) {
          this.lockState.setLocked(false);
          this.gravityState.setRowsToOccupy(0);
          this.gravityState.setHardDrop(false);

          this.ghostTetrominoData = this.calculateGhostTetominoPosition();
          this.ghostTetrominoDirty = true;

          return;
        }
      }
    }

    if (this.gravityState.getSoftDrop()) {
      activeTetromino.actions.softDrop = true;
    }

    this.lockState.update(ticker);

    if (Input.getInstance().pressed(ControlAction.HARD_DROP)) {
      this.hardDrop(true);
      activeTetromino.actions.hardDrop = true;
    } else if (!this.lockState.getLocked()) {
      this.gravityState.update(ticker);

      if (this.gravityState.getRowsToOccupy() >= 1) {
        if (
          activeTetromino.moveDown(
            this.grid,
            this.gravityState.getRowsToOccupy()
          )
        ) {
          if (GlobalConfig.get().gameplay.lock.enabled) {
            this.lockState.setLocked(true);
          } else {
            this.nextTetromino();
          }
        }

        this.gravityState.setRowsToOccupy(0);
      }
    } else if (this.lockState.getLockExpired()) {
      this.nextTetromino();
    }
  }

  getCanSwap(): boolean {
    return this.tetrominoBag.getCanSwap();
  }

  getNextTetrominoNamesDirty(): boolean {
    return this.tetrominoBag.getQueueDirty();
  }

  getHeldTetrominoNameDirty(): boolean {
    return this.tetrominoBag.getHeldTetrominoDirty();
  }

  getActiveTetrominoDirty(): boolean {
    return this.tetrominoBag.getActiveTetrominoDirty();
  }

  getNextTetrominoNames(): LinkedList<TetrominoNames> {
    return this.tetrominoBag.getQueueView();
  }

  getHeldTetrominoName(): TetrominoNames | undefined {
    return this.tetrominoBag.getHeldTetrominoName();
  }

  getActiveTetromino(): Tetromino {
    return this.tetrominoBag.getActiveTetromino();
  }

  getGhostTetrominoDirty(): boolean {
    return this.ghostTetrominoDirty;
  }

  getLockedDirty(): boolean {
    return this.grid.getDirty();
  }

  getGrid(): (TetrominoNames | undefined)[] {
    return this.grid.getValue().map((val) => val);
  }

  getGhostTetrominoData(): {
    y: number;
    x: number;
    shape: number[][];
  } {
    return this.ghostTetrominoData;
  }

  getLocking(): boolean {
    return this.lockState.getLocked();
  }
}
