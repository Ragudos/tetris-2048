import Logger from "@/modules/log/Logger";
import InputMap, { ActionName } from "./InputMap";
import InputState from "./InputState";
import { GlobalConfig } from "../config/GlobalConfig";

export default class Input {
  private static instance: Input;
  private input: InputMap;
  private logger: Logger = Logger.createLogger(Input.name);
  private states: Map<ActionName, InputState> = new Map();
  private singleTriggerActions: Set<ActionName> = new Set();

  private constructor() {
    this.input = InputMap.fromJSON(GlobalConfig.get().controls.input.map);
  }

  static getInstance(): Input {
    if (!Input.instance) {
      Input.instance = new Input();
    }

    return Input.instance;
  }

  addSingleTriggerAction(action: ActionName): void {
    this.singleTriggerActions.add(action);
  }

  removeSingleTriggerAction(action: ActionName): void {
    this.singleTriggerActions.delete(action);
  }

  choose(action1: ActionName, action2: ActionName): ActionName | null {
    const state1 = this.states.get(action1)!;
    const state2 = this.states.get(action2)!;
    const down1 = this.input.pressed(action1);
    const down2 = this.input.pressed(action2);

    if (!down1 && down2) {
      state1.reset();

      if (this.pressed(action2)) {
        return action2;
      }
    } else if (down1 && !down2) {
      state2.reset();

      if (this.pressed(action1)) {
        return action1;
      }
    } else if (!down1 && !down2) {
      state1.reset();
      state2.reset();

      return null;
    } else if (down1 && down2) {
      const config = GlobalConfig.get();

      // get the latest pressed key
      if (state1.pressedOn < state2.pressedOn) {
        state1.counter--;

        if (state1.counter <= 0) {
          state1.counter =
            state1.repeats > 0
              ? config.controls.input.delay
              : config.controls.input.initialDelay;

          state1.repeats++;

          return action1;
        }
      } else if (state1.pressedOn < state2.pressedOn) {
        state2.counter--;

        if (state2.counter <= 0) {
          state2.counter =
            state2.repeats > 0
              ? config.controls.input.delay
              : config.controls.input.initialDelay;

          state2.repeats++;

          return action2;
        }
      }
    } else if (down1 && this.pressed(action1)) {
      return action1;
    } else if (down2 && this.pressed(action2)) {
      return action2;
    }

    return null;
  }

  pressed(action: ActionName): boolean {
    const state = this.states.get(action)!;
    const down = this.input.pressed(action);

    if (!down) {
      state.reset();

      return false;
    }

    state.pressed = true;

    if (this.singleTriggerActions.has(action)) {
      if (!state.triggeredOnce) {
        state.triggeredOnce = true;

        return true;
      }

      return false;
    }

    state.counter--;

    if (state.counter <= 0) {
      const config = GlobalConfig.get().controls.input;
      state.counter = state.repeats > 0 ? config.delay : config.initialDelay;

      state.repeats++;

      return true;
    }

    return false;
  }
}
