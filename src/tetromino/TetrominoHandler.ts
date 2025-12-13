import type { Ticker } from "pixi.js";

import Grid from "@/Grid";
import Tetromino from "./Tetromino";
import TetrominoBag from "./TetrominoBag";
import Scorer from "@/lib/scorer/Scorer";
import { collidesBottom, collidesTop } from "@/lib/phys/collisions";
import Config from "@/lib/config/Config";

export class TetrominoHandlerUpdateState {
  private locked: boolean;
  private didGoNext: boolean;

  constructor(locked: boolean, didGoNext: boolean) {
    this.locked = locked;
    this.didGoNext = didGoNext;
  }

  getLocked(): boolean {
    return this.locked;
  }

  getDidGoNext(): boolean {
    return this.didGoNext;
  }
}

export class Gravity {
  private static GRAVITY_ROWS_PER_FRAME_BY_LEVEL = Object.freeze([
    1 / 48,
    1 / 43,
    1 / 38,
    1 / 33,
    1 / 28,
    1 / 23,
    1 / 18,
    1 / 13,
    1 / 8,
    1 / 6,
  ] as const);
  private softDropMultiplier;
  private softDrop: boolean;
  private hardDrop: boolean;
  private dropAccumulator: number;

  constructor() {
    this.softDropMultiplier = 20;
    this.softDrop = false;
    this.hardDrop = false;
    this.dropAccumulator = 0;
  }

  getGravityRowsPerFrame(level: number): number {
    return Gravity.GRAVITY_ROWS_PER_FRAME_BY_LEVEL[
      Math.min(level, Gravity.GRAVITY_ROWS_PER_FRAME_BY_LEVEL.length - 1)
    ];
  }

  update(ticker: Ticker) {
    if (this.hardDrop) {
      this.dropAccumulator = 0;
      this.softDrop = false;

      return;
    }

    const level = Scorer.getInstance().getScoreData().getLevel();
    const baseGravity = this.getGravityRowsPerFrame(level);
    const gravity = this.softDrop
      ? baseGravity * this.softDropMultiplier
      : baseGravity;
    this.dropAccumulator += gravity * ticker.deltaTime;
  }

  getDropAccumulator(): number {
    return this.dropAccumulator;
  }

  getHardDrop(): boolean {
    return this.hardDrop;
  }

  getSoftDrop(): boolean {
    return this.softDrop;
  }

  setDropAccumulator(value: number): void {
    this.dropAccumulator = value;
  }

  setHardDrop(value: boolean): void {
    this.hardDrop = value;
  }

  setSoftDrop(value: boolean): void {
    this.softDrop = value;
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
      Config.getInstance().getGameplayConfig().getLockDelayMaxResets() <=
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
    this.grid.clearRows();
  }

  update(ticker: Ticker): TetrominoHandlerUpdateState {
    let didGoNext: boolean = false;

    this.gravity.update(ticker);
    this.lock.update(ticker);

    // check for hard drop key, then perform hard drop with lock
    // check for soft dorp key, then perform soft drop

    // else, normal drop
    if (!this.lock.getLocked()) {
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
    } else {
      if (
        this.lock.getTimeSinceLockDelay() >=
        Config.getInstance().getGameplayConfig().getLockDelayDt()
      ) {
        this.nextTetromino();
        didGoNext = true;
      }
    }

    return new TetrominoHandlerUpdateState(this.lock.getLocked(), didGoNext);
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
