import { describe, it, beforeEach, expect, vi, Mock } from "vitest";
import Input from "./Input";
import InputMap, { ActionName } from "./InputMap";
import InputState from "./InputState";
import { GlobalConfig } from "../config/GlobalConfig";

// Mock dependencies
vi.mock("./InputMap");
vi.mock("../config/GlobalConfig");

describe("Input - choose method detailed tests", () => {
  let input: Input;
  let mockInputMap: any;

  const action1: ActionName = "action1" as ActionName;
  const action2: ActionName = "action2" as ActionName;

  beforeEach(() => {
    // Reset singleton
    (Input as any).instance = null;

    // Mock InputMap
    mockInputMap = { pressed: vi.fn() };
    (InputMap.fromJSON as unknown as Mock).mockReturnValue(mockInputMap);

    // Mock GlobalConfig with custom delays
    (GlobalConfig.get as unknown as Mock).mockReturnValue({
      controls: {
        input: { delay: 2, initialDelay: 5, map: {} },
      },
    });

    input = Input.getInstance();

    // Initialize states
    const state1 = new InputState();
    const state2 = new InputState();

    // Assign different pressedOn timestamps to simulate order
    state1.pressedOn = 100;
    state2.pressedOn = 200;

    (input as any).states.set(action1, state1);
    (input as any).states.set(action2, state2);
  });

  it("choose returns null if neither action is pressed", () => {
    mockInputMap.pressed.mockReturnValue(false);

    const result = input.choose(action1, action2);
    expect(result).toBeNull();

    const state1 = (input as any).states.get(action1);
    const state2 = (input as any).states.get(action2);
    expect(state1.counter).toBe(0);
    expect(state2.counter).toBe(0);
  });

  it("choose returns the pressed action if only one is pressed", () => {
    mockInputMap.pressed.mockImplementation(
      (action: ActionName) => action === action1
    );

    const result = input.choose(action1, action2);
    expect(result).toBe(action1);

    const state2 = (input as any).states.get(action2);
    expect(state2.counter).toBe(0);
  });

  it("choose with both actions pressed selects the correct one based on pressedOn", () => {
    mockInputMap.pressed.mockReturnValue(true);

    const state1: InputState = (input as any).states.get(action1);
    const state2: InputState = (input as any).states.get(action2);

    state1.counter = 0;
    state2.counter = 0;

    const result = input.choose(action1, action2);
    expect(result).toBe(action1);
    expect(state1.repeats).toBe(1);
    expect(state1.counter).toBe(5);

    const result2 = input.choose(action1, action2);
    expect(result2).toBeNull();
  });

  it("choose increments counter and repeats correctly", () => {
    mockInputMap.pressed.mockReturnValue(true);

    const state1: InputState = (input as any).states.get(action1);
    const state2: InputState = (input as any).states.get(action2);

    state1.counter = 0;
    state1.repeats = 1;
    state1.pressedOn = 100;

    state2.counter = 0;
    state2.repeats = 2;
    state2.pressedOn = 200;

    const result = input.choose(action1, action2);
    expect(result).toBe(action1);
    expect(state1.repeats).toBe(2);
    expect(state1.counter).toBe(2);
  });

  it("choose respects single-trigger logic indirectly via pressed", () => {
    input.addSingleTriggerAction(action1);
    mockInputMap.pressed.mockImplementation(
      (action: ActionName) => action === action1
    );

    const state1: InputState = (input as any).states.get(action1);
    state1.counter = 0;

    const result1 = input.choose(action1, action2);
    expect(result1).toBe(action1);

    const result2 = input.choose(action1, action2);
    expect(result2).toBeNull();
  });
});
