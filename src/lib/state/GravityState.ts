import type { Ticker } from "pixi.js";
import Config from "../config/Config";
import GlobalAction from "../input/GlobalAction";
import Scorer from "../scorer/Scorer";
import { ControlAction } from "../input/ControlAction";

export type GravityConfig =
  | { type: "none" }
  | { type: "scaled"; multiplier: number }
  | { type: "instant" };

export const GRAVITY = Object.freeze([
  "SUBZERO",
  "RELAXED",
  "NORMAL",
  "ENGAGING",
  "SPICY",
  "STATIC",
] as const);

export const GRAVITY_ROWS_PER_FRAME_BY_LEVEL = Object.freeze([
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
  1 / 5,
  1 / 5,
  1 / 5,
  1 / 4,
  1 / 4,
  1 / 4,
  1 / 3,
  1 / 3,
  1 / 3,
  1 / 2,
  1 / 2,
  1 / 2,
  1 / 2,
  1 / 2,
  1 / 2,
  1 / 2,
  1 / 2,
  1 / 2,
  1 / 2,
  1,
] as const);

export const GRAVITY_PER_MODE: Record<(typeof GRAVITY)[number], GravityConfig> = {
  SUBZERO: { type: "none" },
  RELAXED: { type: "scaled", multiplier: 0.75 },
  NORMAL: { type: "scaled", multiplier: 1 },
  ENGAGING: { type: "scaled", multiplier: 2 },
  SPICY: { type: "scaled", multiplier: 3.25 },
  STATIC: { type: "instant" },
};

export default class GravityState {
  private softDropMultiplier: number;
  private rowsToOccupy: number;
  private hardDrop: boolean;

  constructor() {
    this.softDropMultiplier = 20;
    this.rowsToOccupy = 0;
    this.hardDrop = false;
    this.t = 0;
  }

  getBaseGravity(): number {
    const gravity = GRAVITY_PER_MODE[Config.getInstance().getGameplayConfig().getGravityMode()];

    if (gravity.type === "none") {
      return 0;
    }

    if (gravity.type === "instant") {
      return GRAVITY_ROWS_PER_FRAME_BY_LEVEL[GRAVITY_ROWS_PER_FRAME_BY_LEVEL.length - 1];
    }

    const base =
      GRAVITY_ROWS_PER_FRAME_BY_LEVEL[
        Math.min(
          Scorer.getInstance().getScoreData().getLevel(),
          GRAVITY_ROWS_PER_FRAME_BY_LEVEL.length - 1,
        )
      ];

    return base * gravity.multiplier;
  }

  private t;

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
    return GlobalAction.getInstance().getActionProcessor().triggered(ControlAction.SOFT_DROP);
  }

  setRowsToOccupy(value: number): void {
    this.rowsToOccupy = value;
  }

  setHardDrop(value: boolean): void {
    this.hardDrop = value;
  }
}
