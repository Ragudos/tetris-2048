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
