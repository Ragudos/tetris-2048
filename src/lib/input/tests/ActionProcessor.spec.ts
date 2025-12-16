import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import ActionProcessor from "../ActionProcessor";
import ActionState from "../ActionState";
import InputMap from "../../config/InputMap";
import Config, { DEFAULT_CONFIG } from "../../config/Config";
import { ControlAction } from "../ControlAction";

vi.mock("../config/InputMap");
vi.mock("../config/Config");
vi.useFakeTimers();

describe("ActionProcessor", () => {
  let inputMock: InputMap;
  let processor: ActionProcessor;
  let controlsConfigMock: any;

  beforeEach(() => {
    inputMock = new InputMap() as unknown as InputMap;

    controlsConfigMock = {
      getInputDelay: vi.fn(() => 5),
      getInitialInputDelay: vi.fn(() => 10),
    };

    (Config.getInstance as unknown as Mock).mockReturnValue({
      getControlsConfig: () => controlsConfigMock,
    });

    processor = new ActionProcessor(inputMock);
  });

  it("should return false for triggered() if key is not down", () => {
    inputMock.isActionDown = vi.fn(() => false);

    expect(processor.triggered(ControlAction.MOVE_LEFT)).toBe(false);
  });

  it("should trigger a single-trigger action only once", () => {
    inputMock.isActionDown = vi.fn(() => true);

    expect(processor.triggered(ControlAction.HARD_DROP)).toBe(true); // first time
    expect(processor.triggered(ControlAction.HARD_DROP)).toBe(false); // second time
  });

  it("should handle normal repeating actions with delays", () => {
    inputMock.isActionDown = vi.fn(() => true);

    const action = ControlAction.MOVE_LEFT;
    const state = (processor as any).states.get(action) as ActionState;

    // First call: counter decremented, not triggered yet
    expect(processor.triggered(action)).toBe(true);

    // Counter resets with input delay after trigger
    expect(state.getCounter()).toBe(DEFAULT_CONFIG.controlsConfig.initialInputDelay);

    expect(processor.triggered(action)).toBe(false);
    expect(state.getCounter()).toBe(DEFAULT_CONFIG.controlsConfig.initialInputDelay - 1);
  });

  it("chooseAction returns null if neither key is down", () => {
    inputMock.isActionDown = vi.fn(() => false);
    expect(processor.chooseAction(ControlAction.MOVE_LEFT, ControlAction.MOVE_RIGHT)).toBe(null);
  });

  it("chooseAction returns action1 if only it is down", () => {
    inputMock.isActionDown = vi.fn((action: ControlAction) => action === ControlAction.MOVE_LEFT);
    const state1 = (processor as any).states.get(ControlAction.MOVE_LEFT) as ActionState;
    state1.setCounter(0); // force triggered
    expect(processor.chooseAction(ControlAction.MOVE_LEFT, ControlAction.MOVE_RIGHT)).toBe(
      ControlAction.MOVE_LEFT,
    );
  });

  it("chooseAction returns action2 if only it is down", () => {
    inputMock.isActionDown = vi.fn((action: ControlAction) => action === ControlAction.MOVE_RIGHT);
    const state2 = (processor as any).states.get(ControlAction.MOVE_RIGHT) as ActionState;
    state2.setCounter(0); // force triggered
    expect(processor.chooseAction(ControlAction.MOVE_LEFT, ControlAction.MOVE_RIGHT)).toBe(
      ControlAction.MOVE_RIGHT,
    );
  });

  it("chooseAction returns latest pressed when both are down", () => {
    inputMock.isActionDown = vi.fn(() => true);

    const stateLeft = (processor as any).states.get(ControlAction.MOVE_LEFT) as ActionState;
    const stateRight = (processor as any).states.get(ControlAction.MOVE_RIGHT) as ActionState;

    // Simulate pressing left first, then right
    stateLeft.setPressed(true);
    vi.advanceTimersByTime(100);
    stateRight.setPressed(true);

    expect(processor.chooseAction(ControlAction.MOVE_LEFT, ControlAction.MOVE_RIGHT)).toBe(
      ControlAction.MOVE_LEFT,
    );
  });
});
