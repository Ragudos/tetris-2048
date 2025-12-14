import { Ticker } from "pixi.js";

import Grid from "@/Grid";
import Tetromino from "./Tetromino";
import TetrominoBag from "./TetrominoBag";
import Scorer from "@/lib/scorer/Scorer";
import { collidesBottom, collidesTop } from "@/lib/phys/collisions";
import Config from "@/lib/config/Config";
import { GRAVITY_PER_MODE, GRAVITY_ROWS_PER_FRAME_BY_LEVEL } from "@/constants";
import GlobalAction from "@/lib/input/GlobalAction";
import { ControlAction } from "@/lib/input/ActionProcessor";

export class TetrominoHandlerUpdateState {
  private locked: boolean;
  private didGoNext: boolean;
  private didMoveSideways: boolean;

  constructor(locked: boolean, didGoNext: boolean, didMoveSideways: boolean) {
    this.locked = locked;
    this.didGoNext = didGoNext;
    this.didMoveSideways = didMoveSideways;
  }

  getLocked(): boolean {
    return this.locked;
  }

  getDidGoNext(): boolean {
    return this.didGoNext;
  }

  getDidMoveSideways(): boolean {
    return this.didMoveSideways;
  }
}

export class Gravity {
  private softDropMultiplier: number;
  private dropAccumulator: number;
  private hardDrop: boolean;

  constructor() {
    this.softDropMultiplier = 20;
    this.dropAccumulator = 0;
    this.hardDrop = false;
  }

  getBaseGravity(): number {
    const gravity =
      GRAVITY_PER_MODE[
        Config.getInstance().getGameplayConfig().getGravityMode()
      ];

    if (gravity.type === "none") {
      return 0;
    }

    if (gravity.type === "instant") {
      return Infinity;
    }

    const base =
      GRAVITY_ROWS_PER_FRAME_BY_LEVEL[
        Math.min(
          Scorer.getInstance().getScoreData().getLevel(),
          GRAVITY_ROWS_PER_FRAME_BY_LEVEL.length - 1
        )
      ];

    return base * gravity.multiplier;
  }

  update(ticker: Ticker): void {
    if (this.hardDrop) {
      return;
    }

    const baseGravity = this.getBaseGravity();
    const gravity = this.getSoftDrop()
      ? baseGravity * this.softDropMultiplier
      : baseGravity;

    // Gravity is measured in rows per frame, so we multiply by 60 to convert
    // to rows per second, then by deltaTime to get rows per tick.
    this.setDropAccumulator(this.dropAccumulator + gravity * ticker.deltaTime);
  }

  getDropAccumulator(): number {
    return this.dropAccumulator;
  }

  getHardDrop(): boolean {
    return this.hardDrop;
  }

  getSoftDrop(): boolean {
    return GlobalAction.getInstance()
      .getActionProcessor()
      .triggered(ControlAction.SOFT_DROP);
  }

  setDropAccumulator(value: number): void {
    this.dropAccumulator = value;
  }

  setHardDrop(value: boolean): void {
    this.hardDrop = value;
  }
}

export class Lock {
  private locked: boolean;
  private resetCount: number;
  private timeSinceLockDelay: number;

  constructor() {
    this.locked = false;
    this.resetCount = 0;
    this.timeSinceLockDelay = 0;
  }

  update(ticker: Ticker): void {
    if (this.locked) {
      this.timeSinceLockDelay += ticker.deltaTime;
    }
  }

  setLocked(value: boolean): void {
    this.locked = value;

    if (!value) {
      this.resetCount = 0;
      this.timeSinceLockDelay = 0;
    }
  }

  resetLock(): void {
    if (!this.canReset()) {
      return;
    }

    this.timeSinceLockDelay = 0;
    this.locked = false;
    this.resetCount += 1;
  }

  canReset(): boolean {
    return (
      Config.getInstance().getGameplayConfig().getLockDelayMaxResets() >
      this.resetCount
    );
  }

  getTimeSinceLockDelay(): number {
    return this.timeSinceLockDelay;
  }

  getLocked(): boolean {
    return this.locked;
  }

  getResetcount(): number {
    return this.resetCount;
  }
}

export default class TetrominoHandler {
  private grid: Grid<Tetromino>;
  private tetrominoBag: TetrominoBag;
  private gravity: Gravity;
  private lock: Lock;

  constructor(grid: Grid<Tetromino>, tetrominoBag: TetrominoBag) {
    this.grid = grid;
    this.tetrominoBag = tetrominoBag;
    this.gravity = new Gravity();
    this.lock = new Lock();
  }

  private nextTetromino(): void {
    const currentTetromino = this.tetrominoBag.getCurrentTetronimo();
    const shape = currentTetromino.getTetrominoBody().getShape();
    const position = currentTetromino.getTetrominoBody().getPosition();

    for (let y = 0; y < shape.length; ++y) {
      const row = shape[y];

      for (let x = 0; x < row.length; ++x) {
        if (row[x]) {
          this.grid.occupyGrid(
            currentTetromino,
            position.getX() + x,
            position.getY() + y
          );
        }
      }
    }

    this.tetrominoBag.makeNextTetrominoCurrent();
    this.lock.setLocked(false);
    this.gravity.setDropAccumulator(0);
    this.gravity.setHardDrop(false);

    // TODO: animations
    this.grid.clearRows();
  }

  private drop(ticker: Ticker): boolean {
    let didGoNext: boolean = false;

    const actionProcessor = GlobalAction.getInstance().getActionProcessor();

    if (actionProcessor.triggered(ControlAction.HARD_DROP)) {
      this.hardDrop(true);
      didGoNext = true;
    } else if (this.gravity.getDropAccumulator() === Infinity) {
      this.hardDrop(false);
    } else {
      const currentTetromino = this.tetrominoBag.getCurrentTetronimo();
      const position = currentTetromino.getTetrominoBody().getPosition();
      const shape = currentTetromino.getTetrominoBody().getShape();

      while (this.gravity.getDropAccumulator() >= 1) {
        if (collidesBottom(this.grid, position, shape, 1)) {
          if (Config.getInstance().getGameplayConfig().getEnableLock()) {
            this.lock.setLocked(true);
          } else {
            this.nextTetromino();
            didGoNext = true;
          }

          this.gravity.setDropAccumulator(0);

          break;
        }

        position.setY(position.getY() + 1);
        this.gravity.setDropAccumulator(this.gravity.getDropAccumulator() - 1);
      }
    }

    return didGoNext;
  }

  private moveSideways(ticker: Ticker): boolean {
    const actionProcessor = GlobalAction.getInstance().getActionProcessor();

    if (actionProcessor.triggered(ControlAction.MOVE_LEFT)) {
      this.tetrominoBag.getCurrentTetronimo().moveLeft(this.grid);

      return true;
    } else if (actionProcessor.triggered(ControlAction.MOVE_RIGHT)) {
      this.tetrominoBag.getCurrentTetronimo().moveRight(this.grid);

      return true;
    }

    return false;
  }

  update(ticker: Ticker): TetrominoHandlerUpdateState {
    let didGoNext: boolean = false;
    let didMoveSideways: boolean = false;

    this.lock.update(ticker);

    if (!this.lock.getLocked()) {
      this.gravity.update(ticker);

      didGoNext = this.drop(ticker);
    } else {
      if (
        this.lock.getTimeSinceLockDelay() >=
        Config.getInstance().getGameplayConfig().getLockDelayDt()
      ) {
        this.nextTetromino();
        didGoNext = true;
      }
    }

    if (!didGoNext) {
      didMoveSideways = this.moveSideways(ticker);

      if (didMoveSideways && this.lock.getLocked() && this.lock.canReset()) {
        this.lock.resetLock();

        const currentTetromino = this.tetrominoBag.getCurrentTetronimo();
        const position = currentTetromino.getTetrominoBody().getPosition();
        const shape = currentTetromino.getTetrominoBody().getShape();

        if (collidesBottom(this.grid, position, shape, 1)) {
          if (Config.getInstance().getGameplayConfig().getEnableLock()) {
            this.lock.setLocked(true);
          } else {
            this.nextTetromino();
          }
        }
      }
    }

    return new TetrominoHandlerUpdateState(
      this.lock.getLocked(),
      didGoNext,
      didMoveSideways
    );
  }

  hardDrop(lock: boolean = true): void {
    this.gravity.setHardDrop(lock);

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
      this.gravity.setHardDrop(false);

      this.nextTetromino();
    }
  }
}
