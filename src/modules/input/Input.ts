import Logger from "@/modules/log/Logger";
import { GlobalConfig } from "../config/GlobalConfig";
import InputMap, { type ActionName } from "./InputMap";
import InputState from "./InputState";

export default class Input {
  private static instance: Input;
  private input: InputMap;
  private logger: Logger = Logger.createLogger(Input.name);
  private states: Map<ActionName, InputState> = new Map();
  private singleTriggerActions: Set<ActionName> = new Set();

  private constructor() {
    this.input = InputMap.fromJSON(GlobalConfig.get().controls.input.map);
  }

  private repeatInput(inputState: InputState): boolean {
    const config = GlobalConfig.get();

    inputState.counter--;

    if (inputState.counter <= 0) {
      inputState.counter =
        inputState.repeats > 0
          ? config.controls.input.delay
          : config.controls.input.initialDelay;

      inputState.repeats++;

      return true;
    }

    return false;
  }

  private getState(action: ActionName): InputState {
    if (!this.states.has(action)) {
      this.states.set(action, new InputState());
    }

    // biome-ignore lint/style/noNonNullAssertion: Already exists by the condition above
    return this.states.get(action)!;
  }

  addSingleTriggerAction(action: ActionName): void {
    this.singleTriggerActions.add(action);
  }

  removeSingleTriggerAction(action: ActionName): void {
    this.singleTriggerActions.delete(action);
  }

  choose(action1: ActionName, action2: ActionName): ActionName | null {
    const state1 = this.getState(action1);
    const state2 = this.getState(action2);
    const down1 = this.input.pressed(action1);
    const down2 = this.input.pressed(action2);

    if (!down1 && !down2) {
      state1.reset();
      state2.reset();

      return null;
    }

    if (!down1 && down2) {
      state1.reset();

      return this.pressed(action2) ? action2 : null;
    }

    if (down1 && !down2) {
      state2.reset();

      return this.pressed(action1) ? action1 : null;
    }

    if (state1.pressedOn < state2.pressedOn) {
      return this.repeatInput(state1) ? action1 : null;
    }

    if (state2.pressedOn < state1.pressedOn) {
      return this.repeatInput(state2) ? action2 : null;
    }

    return null;
  }

  down(action: ActionName): boolean {
    return this.input.pressed(action);
  }

  pressed(action: ActionName): boolean {
    const state = this.getState(action);
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

    return this.repeatInput(state);
  }

  static getInstance(): Input {
    if (!Input.instance) {
      Input.instance = new Input();
    }

    return Input.instance;
  }
}
