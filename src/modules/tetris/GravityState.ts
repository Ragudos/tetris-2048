import type { Ticker } from "pixi.js";
import { GlobalConfig } from "../config/GlobalConfig";
import Input from "../input/Input";
import { ControlAction } from "./ControlAction";
import { GRAVITY, GRAVITY_PER_MODE } from "./constants";

export default class GravityState {
  private softDropMultiplier: number;
  private rowsToOccupy: number;
  private hardDrop: boolean;

  constructor() {
    this.softDropMultiplier = 20;
    this.rowsToOccupy = 0;
    this.hardDrop = false;
  }

  getBaseGravity(): number {
    const gravity = GRAVITY_PER_MODE[GlobalConfig.get().gameplay.gravity];

    if (gravity.type === "none") {
      return 0;
    }

    if (gravity.type === "instant") {
      return GRAVITY.ROWS_PER_FRAME[GRAVITY.ROWS_PER_FRAME.length - 1];
    }

    const base =
      GRAVITY.ROWS_PER_FRAME[
        Math.min(
          // TODO: Level
          0,
          GRAVITY.ROWS_PER_FRAME.length - 1,
        )
      ];

    return base * gravity.multiplier;
  }

  update(ticker: Ticker): void {
    if (this.hardDrop) {
      return;
    }

    const base = this.getBaseGravity();
    const gravity = this.getSoftDrop() ? base * this.softDropMultiplier : base;

    this.rowsToOccupy += gravity * ticker.deltaTime;
  }

  getRowsToOccupy(): number {
    return this.rowsToOccupy;
  }

  getHardDrop(): boolean {
    return this.hardDrop;
  }

  getSoftDrop(): boolean {
    return Input.getInstance().pressed(ControlAction.SOFT_DROP);
  }

  setRowsToOccupy(value: number): void {
    this.rowsToOccupy = value;
  }

  setHardDrop(value: boolean): void {
    this.hardDrop = value;
  }
}
