import type { Ticker } from "pixi.js";
import { GlobalConfig } from "../config/GlobalConfig";

export default class LockState {
  private locked: boolean;
  private resetCount: number;
  private timeSinceLockDelay: number;
  private didReset: boolean;

  constructor() {
    this.locked = false;
    this.resetCount = 0;
    this.timeSinceLockDelay = 0;
    this.didReset = false;
  }

  update(ticker: Ticker): void {
    this.didReset = false;

    if (this.locked) {
      this.timeSinceLockDelay += ticker.deltaTime;
    }
  }

  setLocked(value: boolean): void {
    this.locked = value;

    if (!value) {
      this.didReset = false;
      this.resetCount = 0;
      this.timeSinceLockDelay = 0;
    }
  }

  resetLock(): void {
    if (!this.locked || !this.canReset()) {
      return;
    }

    this.timeSinceLockDelay = 0;
    this.locked = false;
    this.didReset = true;
    this.resetCount += 1;
  }

  canReset(): boolean {
    return GlobalConfig.get().gameplay.lock.maxResets > this.resetCount;
  }

  getDidReset(): boolean {
    return this.didReset;
  }

  getLockExpired(): boolean {
    return this.timeSinceLockDelay >= GlobalConfig.get().gameplay.lock.delayFrames;
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
