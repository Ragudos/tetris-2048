import { DeepPartial } from "@/types/DeepPartial";

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

  return "Something went wrong: " + err;
}

export function mergeDefaults<T>(defaults: T, partial?: DeepPartial<T>): T {
  if (!partial) return defaults;

  const result: any = { ...defaults };

  for (const key in partial) {
    const value = partial[key];
    if (value !== undefined) {
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        result[key] = mergeDefaults((defaults as any)[key], value);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}
