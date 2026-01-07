import { isSquareMatrix } from "@/lib/utils";
import Logger from "@/lib/log/Logger";
import type { Dirtyable } from "@/lib/dirty";

export const ROTATION_DIRECTION = Object.freeze({
  CLOCKWISE: 1,
  COUNTER_CLOCKWISE: -1,
} as const);

export type RotationDirection =
  (typeof ROTATION_DIRECTION)[keyof typeof ROTATION_DIRECTION];

export type Rotation = 0 | 1 | 2 | 3;

declare const TetrominoShapeBrand: unique symbol;

export type TetrominoShapeValue = readonly (readonly number[])[] & {
  readonly [TetrominoShapeBrand]: true;
};

export default class TetrominoShape implements Dirtyable {
  private static logger = Logger.createLogger(TetrominoShape.name);

  #value: number[][];
  #currentRotation: Rotation;
  #dirty: boolean;

  constructor(initValue: number[][], initRotation: Rotation = 0) {
    if (!isSquareMatrix(initValue)) {
      TetrominoShape.logger.error(
        "Initial shape value is not a square this.#value."
      );
    }

    this.#value = initValue;
    this.#currentRotation = initRotation;
    this.#dirty = false;
  }

  clearDirty(): void {
    this.#dirty = false;
  }

  markDirty(): void {
    this.#dirty = true;
  }

  rotate(rotationDirection: RotationDirection): number {
    for (let y = 0; y < this.#value.length / 2; ++y) {
      const lastIdx = this.#value.length - y - 1;

      for (let x = y; x < lastIdx; ++x) {
        const offset = x - y;
        const lastIdxOffset = lastIdx - offset;

        switch (rotationDirection) {
          case ROTATION_DIRECTION.CLOCKWISE:
            {
              const tmp = this.#value[lastIdxOffset][y];
              this.#value[lastIdxOffset][y] =
                this.#value[lastIdx][lastIdxOffset];
              this.#value[lastIdx][lastIdxOffset] = this.#value[x][lastIdx];
              this.#value[x][lastIdx] = this.#value[y][x];
              this.#value[y][x] = tmp;
            }
            break;
          case ROTATION_DIRECTION.COUNTER_CLOCKWISE:
            {
              const tmp = this.#value[y][x];
              this.#value[y][x] = this.#value[x][lastIdx];
              this.#value[x][lastIdx] = this.#value[lastIdx][lastIdxOffset];
              this.#value[lastIdx][lastIdxOffset] =
                this.#value[lastIdxOffset][y];
              this.#value[lastIdxOffset][y] = tmp;
            }
            break;
        }
      }
    }

    this.#currentRotation = ((this.#currentRotation + rotationDirection) %
      4) as Rotation;

    this.markDirty();

    return this.#currentRotation;
  }

  get currentRotation(): number {
    return this.#currentRotation;
  }

  get value(): TetrominoShapeValue {
    return Object.freeze(
      this.#value.map((row) => Object.freeze([...row]))
    ) as TetrominoShapeValue;
  }

  get dirty(): boolean {
    return this.#dirty;
  }
}
