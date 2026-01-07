import type { DeepPartial } from "@/types";

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

/**
 * Creates a debounced version of a function.
 * The function will only be called after it stops being invoked for `delay` ms.
 */
// biome-ignore lint/suspicious/noExplicitAny: too lazy to find the right type here for generic debounce
export function debounce<F extends (...args: any[]) => void>(
  fn: F,
  delay: number
): (...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

export function getTimeEaseOut(t: number) {
  return t * t * (3 - 2 * t);
}

function uppercaseByHalfChance(char: string): string {
  return Math.random() > 0.5 ? char.toUpperCase() : char;
}

/**
 * @returns A random id with a length of 8.
 */
export function generateRandomId(): string {
  let id = "";
  const idLength = 8;
  const lowercaseStartCharCode = 97;
  const lowercaseEndCharCode = 122;
  const numberStartCharCode = 48;
  const numberEndCharCode = 57;

  for (let count = 0; count < idLength; ++count) {
    if (Math.random() < 0.5) {
      const randomChar = range(lowercaseStartCharCode, lowercaseEndCharCode);

      id += uppercaseByHalfChance(String.fromCharCode(randomChar));
    } else {
      const randomChar = range(numberStartCharCode, numberEndCharCode);

      id += String.fromCharCode(randomChar);
    }
  }

  return id;
}

/**
 * @param matrix
 * @returns True if the matrix has equal columns and rows, false otherwise.
 */
export function isSquareMatrix<T>(matrix: T[][]): boolean {
  return matrix.every((row) => row.length === matrix.length);
}
