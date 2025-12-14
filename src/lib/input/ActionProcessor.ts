import Config from "../config/Config";
import ActionState from "./ActionState";
import InputMap from "./InputMap";

export const ControlAction = {
  MOVE_LEFT: "move_left",
  MOVE_RIGHT: "move_right",
  SOFT_DROP: "soft_drop",
  HARD_DROP: "hard_drop",
  ROTATE_CW: "rotate_cw",
  ROTATE_CCW: "rotate_ccw",
  HOLD: "hold", // ← Shift
} as const;

export type ControlAction = (typeof ControlAction)[keyof typeof ControlAction];

const SINGLE_TRIGGER_ACTIONS = new Set<ControlAction>([
  ControlAction.ROTATE_CW,
  ControlAction.ROTATE_CCW,
  ControlAction.HARD_DROP,
  ControlAction.HOLD,
]);

export default class ActionProcessor {
  private input: InputMap;
  private states: Map<ControlAction, ActionState>;

  constructor(input: InputMap) {
    this.input = input;
    this.states = new Map<ControlAction, ActionState>();

    Object.values(ControlAction).forEach((a) =>
      this.states.set(a, new ActionState())
    );
  }

  triggered(action: ControlAction): boolean {
    const state = this.states.get(action)!;
    const down = this.input.isActionDown(action);

    if (!down) {
      state.reset();

      return false;
    }

    state.setPressed(true);

    if (SINGLE_TRIGGER_ACTIONS.has(action)) {
      if (!state.getTriggeredOnce()) {
        state.setTriggeredOnce(true);
        return true;
      }

      return false;
    }

    state.setCounter(state.getCounter() - 1);

    if (state.getCounter() <= 0) {
      const config = Config.getInstance().getControlsConfig();

      state.setCounter(
        state.getRepeats() > 0
          ? config.getInputDelay()
          : config.getInitialInputDelay()
      );

      state.incrementRepeats();

      return true;
    }

    return false;
  }

  getInputMap(): InputMap {
    return this.input;
  }
}
