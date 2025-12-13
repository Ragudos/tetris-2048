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

export function getTimeEaseOut(t: number) {
  return t * t * (3 - 2 * t);
}
