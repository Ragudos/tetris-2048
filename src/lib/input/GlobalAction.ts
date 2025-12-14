import ActionProcessor, { ControlAction } from "./ActionProcessor";
import InputMap from "./InputMap";

export default class GlobalAction {
  private static instance: GlobalAction;

  private inputMap: InputMap;
  private actionProcessor: ActionProcessor;

  static getInstance(): GlobalAction {
    if (GlobalAction.instance === undefined) {
      GlobalAction.instance = new GlobalAction();
    }

    return GlobalAction.instance;
  }

  private constructor() {
    this.inputMap = new InputMap();
    this.actionProcessor = new ActionProcessor(this.inputMap);

    this.initialize();
  }

  private initialize(): void {
    this.inputMap.bind(ControlAction.MOVE_LEFT, "ArrowLeft", "KeyA");
    this.inputMap.bind(ControlAction.MOVE_RIGHT, "ArrowRight", "KeyD");
    this.inputMap.bind(ControlAction.SOFT_DROP, "ArrowDown", "KeyS");
    this.inputMap.bind(ControlAction.HARD_DROP, "Space");
    this.inputMap.bind(ControlAction.ROTATE_CW, "ArrowUp", "KeyX");
    this.inputMap.bind(ControlAction.ROTATE_CCW, "KeyZ");
    this.inputMap.bind(ControlAction.HOLD, "ShiftLeft", "ShiftRight");
  }

  getActionProcessor(): ActionProcessor {
    return this.actionProcessor;
  }
}
