import { beforeEach, test, expect, describe } from "vitest";
import InputState from "./InputState";

describe("InputState", () => {
  let input: InputState;

  beforeEach(() => {
    input = new InputState();
  });

  test("should initialize with default values", () => {
    expect(input.pressed).toBe(false);
    expect(input.triggeredOnce).toBe(false);
    expect(input.repeats).toBe(0);
    expect(input.counter).toBe(0);
    expect(input.pressedOn).toBe(0);
  });

  test("should update pressed property and set pressedOn timestamp", () => {
    const before = Date.now();
    input.pressed = true;
    const after = Date.now();

    expect(input.pressed).toBe(true);
    expect(input.pressedOn).toBeGreaterThanOrEqual(before);
    expect(input.pressedOn).toBeLessThanOrEqual(after);
  });

  test("should reset all properties to default values", () => {
    input.pressed = true;
    input.triggeredOnce = true;
    input.repeats = 5;
    input.counter = 10;

    input.reset();

    expect(input.pressed).toBe(false);
    expect(input.triggeredOnce).toBe(false);
    expect(input.repeats).toBe(0);
    expect(input.counter).toBe(0);
    expect(input.pressedOn).toBe(0);
  });
});
