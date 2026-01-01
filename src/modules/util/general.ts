import type { DeepPartial } from "@/types";
import Point from "../tetris/common/Point";

/**
 * @returns A random value between start end end
 */
export function range(start: number, end: number): number {
  return Math.floor(Math.random() * (end - start + 1)) + start;
}

export function getErrorMsg(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === "string") {
    return err;
  }

  return `Something went wrong: ${err}`;
}

export function getPointFrom1D(
  totalCells: number,
  columns: number,
  index: number
): Point {
  if (index < 0) {
    index = Math.abs(totalCells + index);
  }

  return new Point(index % columns, Math.floor(index / columns));
}

export function mergeDefaults<T>(defaults: T, partial?: DeepPartial<T>): T {
  if (!partial) return defaults;

  // biome-ignore lint/suspicious/noExplicitAny: too lazy to learn the type for this right now
  const result: any = { ...defaults };

  for (const key in partial) {
    const value = partial[key];
    if (value !== undefined) {
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // biome-ignore lint/suspicious/noExplicitAny: too lazy to learn the type for this right now
        result[key] = mergeDefaults((defaults as any)[key], value);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}
