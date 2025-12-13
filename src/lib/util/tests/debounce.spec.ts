import { describe, it, expect, vi } from "vitest";
import { debounce } from "../debounce"; // adjust the path if needed

describe("debounce", () => {
  it("should call the function only after the delay", () => {
    vi.useFakeTimers(); // use fake timers

    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    // call multiple times quickly
    debounced(1);
    debounced(2);
    debounced(3);

    // not called immediately
    expect(fn).not.toHaveBeenCalled();

    // advance time by less than delay
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();

    // advance time past the delay
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);

    vi.useRealTimers();
  });

  it("should call the function each time after debounced separately", () => {
    vi.useFakeTimers();

    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    // first call
    debounced("first");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("first");

    // second call
    debounced("second");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith("second");

    vi.useRealTimers();
  });
});
