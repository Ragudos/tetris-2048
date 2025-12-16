import Config from "../config/Config";
import InputMap from "../config/InputMap";
import ActionState from "./ActionState";

export const ControlAction = Object.freeze({
  MOVE_LEFT: "move_left",
  MOVE_RIGHT: "move_right",
  SOFT_DROP: "soft_drop",
  HARD_DROP: "hard_drop",
  ROTATE_CW: "rotate_cw",
  ROTATE_CCW: "rotate_ccw",
  HOLD: "hold", // ← Shift
} as const);

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

    Object.values(ControlAction).forEach((a) => this.states.set(a, new ActionState()));
  }

  chooseAction(action1: ControlAction, action2: ControlAction): ControlAction | null {
    const state1 = this.states.get(action1)!;
    const down1 = this.input.isActionDown(action1);
    const state2 = this.states.get(action2)!;
    const down2 = this.input.isActionDown(action2);

    if (!down1 && down2) {
      state1.reset();

      if (this.triggered(action2)) {
        return action2;
      }
    } else if (down1 && !down2) {
      state2.reset();

      if (this.triggered(action1)) {
        return action1;
      }
    } else if (!down1 && !down2) {
      state1.reset();
      state2.reset();

      return null;
    } else if (down1 && down2) {
      const action1PressedOn = state1.getPressedOn();
      const action2PressedOn = state2.getPressedOn();

      // get the latest pressed key
      if (action1PressedOn < action2PressedOn) {
        state1.setCounter(state1.getCounter() - 1);

        if (state1.getCounter() <= 0) {
          const config = Config.getInstance().getControlsConfig();

          state1.setCounter(
            state1.getRepeats() > 0 ? config.getInputDelay() : config.getInitialInputDelay(),
          );

          state1.incrementRepeats();

          return action1;
        }
      } else if (action2PressedOn < action1PressedOn) {
        state2.setCounter(state2.getCounter() - 1);

        if (state2.getCounter() <= 0) {
          const config = Config.getInstance().getControlsConfig();

          state2.setCounter(
            state2.getRepeats() > 0 ? config.getInputDelay() : config.getInitialInputDelay(),
          );

          state2.incrementRepeats();

          return action2;
        }
      }
    } else if (down1 && this.triggered(action1)) {
      return action1;
    } else if (down2 && this.triggered(action2)) {
      return action2;
    }

    return null;
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
        state.getRepeats() > 0 ? config.getInputDelay() : config.getInitialInputDelay(),
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
